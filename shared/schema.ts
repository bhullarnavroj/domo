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
  isSuspended: boolean("is_suspended").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  homeownerId: text("homeowner_id").notNull().references(() => authUsers.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., plumbing, electrical, landscaping
  location: text("location").notNull(),
  province: text("province"),
  photos: text("photos").array(),
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
  amount: integer("amount").notNull(),
  baseAmount: integer("base_amount"),
  gstAmount: integer("gst_amount").default(0),
  pstAmount: integer("pst_amount").default(0),
  taxRegion: text("tax_region"),
  commissionAmount: integer("commission_amount").notNull(),
  commissionRate: integer("commission_rate"),
  description: text("description"),
  status: text("status", { enum: ["pending", "paid", "failed", "refunded", "partially_refunded"] }).default("pending").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const refundLogs = pgTable("refund_logs", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  adminUserId: text("admin_user_id").notNull().references(() => authUsers.id),
  stripeRefundId: text("stripe_refund_id").notNull(),
  amount: integer("amount").notNull(), // Amount refunded in cents
  isPartial: boolean("is_partial").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull().references(() => serviceRequests.id),
  contractorId: text("contractor_id").notNull().references(() => authUsers.id),
  homeownerId: text("homeowner_id").notNull().references(() => authUsers.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull().references(() => serviceRequests.id),
  senderId: text("sender_id").notNull().references(() => authUsers.id),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role", { enum: ["homeowner", "contractor"] }).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertProfileSchema = createInsertSchema(profiles, {
  phoneNumber: z.string().regex(/^\+?[\d\s\-().]{7,20}$/, "Please enter a valid phone number").optional().nullable(),
}).omit({ id: true, createdAt: true, userId: true, isSuspended: true, isVerified: true });
export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({ id: true, createdAt: true, homeownerId: true, status: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true, contractorId: true, status: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, status: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, senderId: true, senderName: true, senderRole: true, serviceRequestId: true });
export const insertReviewSchema = createInsertSchema(reviews, {
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
}).omit({ id: true, createdAt: true, homeownerId: true });

// === TYPES ===

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Invoice = typeof invoices.$inferSelect;

export type RefundLog = typeof refundLogs.$inferSelect;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

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

// Admin Response Types
export type AdminUserResponse = User & { profile: Profile | null };
export type AdminServiceRequestResponse = ServiceRequest & { homeownerName: string | null };
export type AdminInvoiceResponse = Invoice;
export type AdminContractorApplicationResponse = Profile & { user: User | null };

