import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { stripeService } from "./stripeService";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register integration routes
  registerObjectStorageRoutes(app);
  registerAuthRoutes(app);

  // === PROFILES ===

  app.get(api.profiles.me.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.get(api.profiles.get.path, async (req, res) => {
    const profile = await storage.getProfile(req.params.userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.post(api.profiles.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.profiles.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Ensure user ID matches authenticated user
      if (input.userId && input.userId !== userId) {
        return res.status(403).json({ message: "Cannot create profile for another user" });
      }

      // Check if profile already exists
      const existing = await storage.getProfile(userId);
      if (existing) {
        return res.status(400).json({ message: "Profile already exists" });
      }

      const profile = await storage.createProfile({ ...input, userId });
      res.status(201).json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.profiles.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.profiles.update.input.parse(req.body);
      const userId = req.user.claims.sub;

      const updated = await storage.updateProfile(userId, input);
      if (!updated) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === SERVICE REQUESTS ===

  app.get(api.serviceRequests.list.path, async (req, res) => {
    const filters = {
      category: req.query.category as string,
      status: req.query.status as string
    };
    const requests = await storage.getServiceRequests(filters);
    res.json(requests);
  });

  app.get(api.serviceRequests.get.path, async (req, res) => {
    const request = await storage.getServiceRequest(Number(req.params.id));
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }
    
    // Fetch quotes if homeowner or specific contractor involved (logic simplified for now)
    const quotes = await storage.getQuotesByRequest(request.id);
    const homeownerProfile = await storage.getProfile(request.homeownerId);
    
    // Expand response
    const expanded = {
      ...request,
      homeowner: homeownerProfile,
      quotes: quotes
    };
    
    res.json(expanded);
  });

  app.post(api.serviceRequests.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.serviceRequests.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      
      const profile = await storage.getProfile(userId);
      if (profile?.role !== 'homeowner') {
        return res.status(403).json({ message: "Only homeowners can create service requests" });
      }

      const request = await storage.createServiceRequest({ ...input, homeownerId: userId });
      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.serviceRequests.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.serviceRequests.update.input.parse(req.body);
      const userId = req.user.claims.sub;
      const requestId = Number(req.params.id);

      const request = await storage.getServiceRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }

      if (request.homeownerId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this request" });
      }

      const updated = await storage.updateServiceRequest(requestId, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === QUOTES ===

  app.get(api.quotes.listByRequest.path, async (req, res) => {
    const requestId = Number(req.params.requestId);
    const quotes = await storage.getQuotesByRequest(requestId);
    
    // Expand with contractor info
    const expandedQuotes = await Promise.all(quotes.map(async (quote) => {
      const contractor = await storage.getProfile(quote.contractorId);
      return { ...quote, contractor };
    }));
    
    res.json(expandedQuotes);
  });

  app.post(api.quotes.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const requestId = Number(req.params.requestId);
      const input = api.quotes.create.input.parse(req.body);
      const userId = req.user.claims.sub;

      const profile = await storage.getProfile(userId);
      if (profile?.role !== 'contractor') {
        return res.status(403).json({ message: "Only contractors can submit quotes" });
      }

      // Check if request is open
      const request = await storage.getServiceRequest(requestId);
      if (!request || request.status !== 'open') {
        return res.status(400).json({ message: "Service request is not open for quotes" });
      }

      const quote = await storage.createQuote({ 
        ...input, 
        serviceRequestId: requestId,
        contractorId: userId,
      });
      res.status(201).json(quote);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.quotes.accept.path, isAuthenticated, async (req: any, res) => {
    const quoteId = Number(req.params.id);
    const userId = req.user.claims.sub;

    const quote = await storage.getQuote(quoteId);
    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    const request = await storage.getServiceRequest(quote.serviceRequestId);
    if (!request) {
      return res.status(404).json({ message: "Associated service request not found" });
    }

    if (request.homeownerId !== userId) {
      return res.status(403).json({ message: "Only the homeowner can accept quotes" });
    }

    // 1. Mark quote as accepted
    const acceptedQuote = await storage.updateQuote(quoteId, { status: "accepted" });
    
    // 2. Mark other quotes as rejected (optional, but good practice)
    // 3. Update service request status
    await storage.updateServiceRequest(request.id, { status: "in_progress" });

    // 4. Create invoice immediately (pending status)
    const commissionAmount = Math.round(quote.amount * 0.10); // 10% commission
    await storage.createInvoice({
      serviceRequestId: request.id,
      contractorId: quote.contractorId,
      homeownerId: userId,
      amount: quote.amount,
      commissionAmount: commissionAmount,
      stripePaymentIntentId: null,
    });

    res.json(acceptedQuote);
  });

  // === INVOICES & PAYMENTS ===

  app.get(api.invoices.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const invoices = await storage.getInvoicesByUser(userId, profile.role as "homeowner" | "contractor");
    res.json(invoices);
  });

  app.post(api.invoices.payCommission.path, isAuthenticated, async (req: any, res) => {
    const invoiceId = Number(req.params.id);
    const userId = req.user.claims.sub;

    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.contractorId !== userId) {
      return res.status(403).json({ message: "Only the assigned contractor can pay this commission" });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: "Commission already paid" });
    }

    // Create Stripe checkout session
    try {
      const session = await stripeService.createCommissionCheckoutSession(
        invoice.id,
        invoice.commissionAmount,
        `${req.protocol}://${req.get('host')}/payment/success?invoiceId=${invoice.id}`,
        `${req.protocol}://${req.get('host')}/payment/cancel`
      );
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error);
      res.status(500).json({ message: "Failed to create payment session" });
    }
  });

  return httpServer;
}
