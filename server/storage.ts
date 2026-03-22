import {
  users, profiles, serviceRequests, quotes, invoices, messages, refundLogs, reviews,
  type User, type InsertUser,
  type Profile, type InsertProfile, type UpdateProfileRequest,
  type ServiceRequest, type InsertServiceRequest, type UpdateServiceRequestRequest,
  type Quote, type InsertQuote, type UpdateQuoteRequest,
  type Invoice,
  type RefundLog,
  type Message,
  type Review, type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";

export type AdminUser = User & { profile: Profile | null };
export type AdminServiceRequest = ServiceRequest & { homeownerName: string | null };
export type AdminInvoice = Invoice;
export type AdminContractorApplication = Profile & { user: User | null };

export interface IStorage {
  // User & Profile
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: UpdateProfileRequest): Promise<Profile>;

  // Service Requests
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
  getServiceRequests(filters?: { category?: string; status?: string; search?: string; limit?: number; offset?: number }): Promise<{ data: ServiceRequest[]; total: number }>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: number, request: UpdateServiceRequestRequest): Promise<ServiceRequest>;
  
  // Quotes
  getQuote(id: number): Promise<Quote | undefined>;
  getQuotesByRequest(requestId: number): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: UpdateQuoteRequest): Promise<Quote>;
  
  // Messages
  getMessagesByRequest(requestId: number): Promise<Message[]>;
  createMessage(message: Omit<Message, "id" | "createdAt">): Promise<Message>;

  // Contractors
  getContractorsByCategory(category: string): Promise<Array<{ userId: string; businessName: string | null }>>;

  // Invoices
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByUser(userId: string, role: "homeowner" | "contractor"): Promise<Invoice[]>;
  createInvoice(invoice: Omit<Invoice, "id" | "createdAt" | "status" | "commissionRate" | "description" | "baseAmount" | "gstAmount" | "pstAmount" | "taxRegion"> & { commissionRate?: number | null; description?: string | null; baseAmount?: number | null; gstAmount?: number | null; pstAmount?: number | null; taxRegion?: string | null }): Promise<Invoice>;
  updateInvoiceStatus(id: number, status: "pending" | "paid" | "failed" | "refunded" | "partially_refunded", stripePaymentIntentId?: string): Promise<Invoice>;

  // Reviews
  createReview(review: InsertReview & { homeownerId: string }): Promise<Review>;
  getReviewsByContractor(contractorId: string): Promise<Review[]>;
  getReviewByRequest(serviceRequestId: number): Promise<Review | undefined>;
  getContractorRating(contractorId: string): Promise<{ average: number; count: number }>;

  // Refund Logs
  createRefundLog(log: Omit<RefundLog, "id" | "createdAt">): Promise<RefundLog>;
  getRefundLogsByInvoice(invoiceId: number): Promise<RefundLog[]>;

  // Admin
  getAllUsers(): Promise<AdminUser[]>;
  getAllServiceRequests(): Promise<AdminServiceRequest[]>;
  getAllInvoices(): Promise<AdminInvoice[]>;
  getPendingContractorApplications(): Promise<AdminContractorApplication[]>;
  suspendUser(userId: string): Promise<Profile>;
  unsuspendUser(userId: string): Promise<Profile>;
  approveContractor(userId: string): Promise<Profile>;
  rejectContractor(userId: string): Promise<Profile>;
}

export class DatabaseStorage implements IStorage {
  // User operations (kept for compatibility, but mainly handled by Auth module)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Profile Operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, update: UpdateProfileRequest): Promise<Profile> {
    const [updated] = await db
      .update(profiles)
      .set(update)
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  // Service Request Operations
  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    const [request] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return request;
  }

  async getServiceRequests(filters?: { category?: string; status?: string; search?: string; limit?: number; offset?: number }): Promise<{ data: ServiceRequest[]; total: number }> {
    const conditions = [];
    if (filters?.category) conditions.push(eq(serviceRequests.category, filters.category));
    if (filters?.status) conditions.push(eq(serviceRequests.status, filters.status as "open" | "in_progress" | "completed" | "cancelled"));
    if (filters?.search) {
      conditions.push(
        or(
          ilike(serviceRequests.title, `%${filters.search}%`),
          ilike(serviceRequests.description, `%${filters.search}%`),
          ilike(serviceRequests.location, `%${filters.search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const limit = Math.min(filters?.limit ?? 20, 100);
    const offset = filters?.offset ?? 0;

    const [data, countResult] = await Promise.all([
      db.select().from(serviceRequests)
        .where(whereClause)
        .orderBy(desc(serviceRequests.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(serviceRequests).where(whereClause),
    ]);

    return { data, total: countResult[0]?.count ?? 0 };
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [newRequest] = await db.insert(serviceRequests).values(request).returning();
    return newRequest;
  }

  async updateServiceRequest(id: number, update: UpdateServiceRequestRequest): Promise<ServiceRequest> {
    const [updated] = await db
      .update(serviceRequests)
      .set(update)
      .where(eq(serviceRequests.id, id))
      .returning();
    return updated;
  }

  // Quote Operations
  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async getQuotesByRequest(requestId: number): Promise<Quote[]> {
    return await db.select().from(quotes).where(eq(quotes.serviceRequestId, requestId));
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db.insert(quotes).values(quote).returning();
    return newQuote;
  }

  async updateQuote(id: number, update: UpdateQuoteRequest): Promise<Quote> {
    const [updated] = await db
      .update(quotes)
      .set(update)
      .where(eq(quotes.id, id))
      .returning();
    return updated;
  }

  // Message Operations
  async getMessagesByRequest(requestId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.serviceRequestId, requestId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: Omit<Message, "id" | "createdAt">): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  // Contractor lookup by category (skills array match)
  async getContractorsByCategory(category: string): Promise<Array<{ userId: string; businessName: string | null }>> {
    return await db
      .select({ userId: profiles.userId, businessName: profiles.businessName })
      .from(profiles)
      .where(
        and(
          eq(profiles.role, "contractor"),
          sql`${category} = ANY(${profiles.skills})`
        )
      );
  }

  // Invoice Operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoicesByUser(userId: string, role: "homeowner" | "contractor"): Promise<Invoice[]> {
    if (role === "homeowner") {
      return await db.select().from(invoices).where(eq(invoices.homeownerId, userId));
    } else {
      return await db.select().from(invoices).where(eq(invoices.contractorId, userId));
    }
  }

  async createInvoice(invoice: Omit<Invoice, "id" | "createdAt" | "status" | "commissionRate" | "description" | "baseAmount" | "gstAmount" | "pstAmount" | "taxRegion"> & { commissionRate?: number | null; description?: string | null; baseAmount?: number | null; gstAmount?: number | null; pstAmount?: number | null; taxRegion?: string | null }): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoiceStatus(id: number, status: "pending" | "paid" | "failed" | "refunded" | "partially_refunded", stripePaymentIntentId?: string): Promise<Invoice> {
    const updates: Partial<Invoice> = { status };
    if (stripePaymentIntentId) {
      updates.stripePaymentIntentId = stripePaymentIntentId;
    }
    
    const [updated] = await db
      .update(invoices)
      .set(updates)
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  // Admin Operations
  async getAllUsers(): Promise<AdminUser[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const result: AdminUser[] = await Promise.all(allUsers.map(async (user) => {
      const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
      return { ...user, profile: profile || null };
    }));
    return result;
  }

  async getAllServiceRequests(): Promise<AdminServiceRequest[]> {
    const allRequests = await db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
    const result: AdminServiceRequest[] = await Promise.all(allRequests.map(async (request) => {
      const [user] = await db.select().from(users).where(eq(users.id, request.homeownerId));
      const homeownerName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || null : null;
      return { ...request, homeownerName };
    }));
    return result;
  }

  async getAllInvoices(): Promise<AdminInvoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getPendingContractorApplications(): Promise<AdminContractorApplication[]> {
    const pendingProfiles = await db.select().from(profiles)
      .where(and(eq(profiles.role, "contractor"), eq(profiles.isVerified, false)))
      .orderBy(desc(profiles.createdAt));
    const result: AdminContractorApplication[] = await Promise.all(pendingProfiles.map(async (profile) => {
      const [user] = await db.select().from(users).where(eq(users.id, profile.userId));
      return { ...profile, user: user || null };
    }));
    return result;
  }

  async suspendUser(userId: string): Promise<Profile> {
    const [updated] = await db.update(profiles).set({ isSuspended: true }).where(eq(profiles.userId, userId)).returning();
    return updated;
  }

  async unsuspendUser(userId: string): Promise<Profile> {
    const [updated] = await db.update(profiles).set({ isSuspended: false }).where(eq(profiles.userId, userId)).returning();
    return updated;
  }

  async approveContractor(userId: string): Promise<Profile> {
    const [updated] = await db.update(profiles).set({ isVerified: true }).where(eq(profiles.userId, userId)).returning();
    return updated;
  }

  async rejectContractor(userId: string): Promise<Profile> {
    const [updated] = await db.update(profiles).set({ isVerified: false }).where(eq(profiles.userId, userId)).returning();
    return updated;
  }

  // Review Operations
  async createReview(review: InsertReview & { homeownerId: string }): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsByContractor(contractorId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.contractorId, contractorId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewByRequest(serviceRequestId: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews)
      .where(eq(reviews.serviceRequestId, serviceRequestId));
    return review;
  }

  async getContractorRating(contractorId: string): Promise<{ average: number; count: number }> {
    const [result] = await db
      .select({
        average: sql<number>`COALESCE(AVG(${reviews.rating}), 0)::numeric(3,1)`,
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.contractorId, contractorId));
    return { average: Number(result?.average ?? 0), count: result?.count ?? 0 };
  }

  // Refund Log Operations
  async createRefundLog(log: Omit<RefundLog, "id" | "createdAt">): Promise<RefundLog> {
    const [newLog] = await db.insert(refundLogs).values(log).returning();
    return newLog;
  }

  async getRefundLogsByInvoice(invoiceId: number): Promise<RefundLog[]> {
    return await db.select().from(refundLogs)
      .where(eq(refundLogs.invoiceId, invoiceId))
      .orderBy(desc(refundLogs.createdAt));
  }
}

export const storage = new DatabaseStorage();
