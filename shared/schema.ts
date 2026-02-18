import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users as authUsers } from "./models/auth";

// Re-export auth models
export * from "./models/auth";

// === TABLE DEFINITIONS ===

// Extend the auth users table with additional fields for our app
// Note: We can't actually extend the table definition from another file in Drizzle easily 
// without complex setup, so we'll create a profile table that links to the auth user.
// However, since we want to store stripe info, let's create a profiles table.

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => authUsers.id),
  role: text("role", { enum: ["homeowner", "contractor"] }).notNull().default("homeowner"),
  stripeCustomerId: text("stripe_customer_id"),
  businessName: text("business_name"),
  description: text("description"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  skills: text("skills").array(), // For contractors
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  homeownerId: text("homeowner_id").notNull().references(() => authUsers.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., plumbing, electrical, landscaping
  location: text("location").notNull(),
  photos: text("photos").array(), // Array of object storage paths
  status: text("status", { enum: ["open", "in_progress", "completed", "cancelled"] }).default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull().references(() => serviceRequests.id),
  contractorId: text("contractor_id").notNull().references(() => authUsers.id),
  amount: integer("amount").notNull(), // In cents
  description: text("description").notNull(),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull().references(() => serviceRequests.id),
  contractorId: text("contractor_id").notNull().references(() => authUsers.id),
  homeownerId: text("homeowner_id").notNull().references(() => authUsers.id),
  amount: integer("amount").notNull(), // In cents
  commissionAmount: integer("commission_amount").notNull(), // 10% of amount
  status: text("status", { enum: ["pending", "paid"] }).default("pending").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true, userId: true });
export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({ id: true, createdAt: true, homeownerId: true, status: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true, contractorId: true, status: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, status: true });

// === TYPES ===

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Invoice = typeof invoices.$inferSelect;

// Request Types
export type CreateProfileRequest = InsertProfile;
export type UpdateProfileRequest = Partial<InsertProfile>;

export type CreateServiceRequestRequest = InsertServiceRequest;
export type UpdateServiceRequestRequest = Partial<InsertServiceRequest> & { status?: "open" | "in_progress" | "completed" | "cancelled" };

export type CreateQuoteRequest = InsertQuote;
export type UpdateQuoteRequest = Partial<InsertQuote> & { status?: "pending" | "accepted" | "rejected" };

// Response Types (often same as Select types, but can be extended)
export type ProfileResponse = Profile;
export type ServiceRequestResponse = ServiceRequest & { homeowner?: any, quotes?: Quote[] }; // expanded
export type QuoteResponse = Quote & { contractor?: any }; // expanded
export type InvoiceResponse = Invoice;

