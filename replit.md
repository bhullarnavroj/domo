# Domo - Property Services Marketplace

## Overview
Domo is a marketplace platform that connects property owners with service professionals across multiple categories (plumbing, electrical, legal, real estate, photography, property management, and more). Property owners post service requests with photos, professionals submit quotes, owners accept quotes, and upon completion the customer pays the full amount via Stripe. DOMO deducts a tiered commission fee and the service provider receives the remainder.

## Recent Changes
- 2026-02-18: Rebranded from "FixItPro" to "Domo"
- 2026-02-18: Expanded service categories to 25+ professional categories (Legal, Real Estate, Photography, Property Management, etc.)
- 2026-02-18: Updated terminology from "contractor" to "service provider/professional" throughout UI
- 2026-02-18: Fixed authentication bug (setupAuth not being called before routes)
- 2026-02-18: Implemented tiered commission fees (15% <$500, 12% $500-$2K, 10% $2K-$10K, 8% >$10K)
- 2026-02-18: Reworked payment flow: customer pays full amount, DOMO deducts fee, provider gets net
- 2026-02-18: Auto-invoice creation when customer marks job complete (no manual invoice creation)
- 2026-02-18: Added earnings/payments dashboard for service providers
- 2026-02-18: Added in-app messaging system for request communication
- 2026-02-18: Added invoice detail view with tax breakdown (13% tax display)
- 2026-02-18: Added PDF download for individual invoices/records (jsPDF + autotable)
- 2026-02-18: Added Excel export for all invoices/records (xlsx/SheetJS)
- 2026-02-18: Moved fee tiers to fine print at bottom of invoices page
- 2026-02-18: Provider sees "Records", homeowner sees "Invoices" terminology

## Architecture
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui components, wouter routing, TanStack Query
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Replit Auth (OIDC via passport)
- **Payments**: Stripe (tiered commission: 15%/12%/10%/8%)
- **Storage**: Replit Object Storage for photo uploads

## Key Files
- `shared/schema.ts` - Database schema and Zod validation
- `shared/routes.ts` - API route definitions
- `server/routes.ts` - Express route handlers
- `server/storage.ts` - Database CRUD operations (IStorage interface)
- `shared/commission.ts` - Tiered commission fee calculation
- `server/stripeService.ts` - Stripe integration
- `client/src/pages/Home.tsx` - Landing page
- `client/src/pages/Dashboard.tsx` - User dashboard (homeowner/provider views)
- `client/src/pages/CreateRequest.tsx` - Service request creation form
- `client/src/pages/RequestDetails.tsx` - Request details + quote management
- `client/src/pages/Invoices.tsx` - Invoice listing and payment
- `client/src/components/Navigation.tsx` - Top navigation bar

## User Preferences
- Platform name: "Domo" (Latin for "home")
- Broad service categories (not limited to home repair)
- Role terminology: "Property Owner" and "Service Provider"
- Internal DB still uses "contractor" role value for backward compatibility

## Service Categories
Organized into groups:
- **Home & Repair**: Plumbing, Electrical, Carpentry, Painting, HVAC, Roofing, General Repair
- **Property Services**: Landscaping, Cleaning, Pest Control, Moving, Interior Design
- **Legal & Financial**: Real Estate Law, Property Law, Notary, Tax Services, Insurance
- **Real Estate**: Real Estate Agent, Property Manager, Home Inspector, Appraiser
- **Creative & Media**: Photography, Videography, Virtual Tour
- **Other**: Other
