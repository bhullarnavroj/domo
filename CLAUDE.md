# DOMO — Claude Code Project Instructions

## What is this app?
DOMO is a BC-based home services marketplace connecting homeowners with verified local tradespeople (plumbers, electricians, handymen). Think Uber for home repairs.

## Tech Stack
- **Frontend**: React 18 + TypeScript, Wouter routing, TanStack React Query, Shadcn/ui + Tailwind CSS, Framer Motion
- **Backend**: Express 5 + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Passport.js + Replit Auth (OIDC)
- **Payments**: Stripe (checkout sessions, webhooks, refunds)
- **Email**: Resend
- **File storage**: Replit object storage
- **Shared code**: `/shared/` — schema, categories, routes, tax, commission used by both client and server

## Key conventions
- Categories are defined in `/shared/categories.ts` — always use this, never hardcode category lists
- Roles: `homeowner` or `contractor` (stored in `profiles.role`)
- Contractors must be approved (`isVerified = true`) before they can submit quotes
- All monetary amounts stored in **cents** (integer), displayed as dollars
- Canadian taxes: GST + PST vary by province, logic in `/shared/tax.ts`

## Workflow
- Edit on Mac with Claude Code
- `git push origin main`
- On Replit shell: `git fetch origin && git reset --hard origin/main && fuser -k 5000/tcp && npm run dev &`
- **Never use the Replit AI agent** — it makes its own commits and causes conflicts

## Roles & access
- **Homeowners**: post jobs, view quotes, accept quotes, pay invoices, leave reviews
- **Contractors**: browse open jobs, submit quotes (only if verified), view earnings
- **Admin**: `/admin` route, requires `isAdmin = true` on user record

## Testing tip
Use `/admin` → Reset Role button to wipe a user's profile so they re-do onboarding as a different role. No need for multiple accounts.

## Do not
- Add "Post a Job" or `/create-request` access for contractors
- Let unverified contractors submit quotes (server enforces this, UI should show pending banner)
- Switch to a different auth provider — Replit Auth is baked in deep
