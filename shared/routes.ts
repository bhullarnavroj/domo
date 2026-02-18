import { z } from 'zod';
import { 
  insertProfileSchema, 
  insertServiceRequestSchema, 
  insertQuoteSchema,
  insertMessageSchema,
  profiles,
  serviceRequests,
  quotes,
  invoices,
  messages
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  profiles: {
    get: {
      method: 'GET' as const,
      path: '/api/profiles/:userId' as const,
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/profiles' as const,
      input: insertProfileSchema,
      responses: {
        201: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/profiles' as const,
      input: insertProfileSchema.partial(),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/profiles/me' as const,
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  serviceRequests: {
    list: {
      method: 'GET' as const,
      path: '/api/service-requests' as const,
      input: z.object({
        category: z.string().optional(),
        status: z.enum(["open", "in_progress", "completed", "cancelled"]).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof serviceRequests.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/service-requests/:id' as const,
      responses: {
        200: z.custom<typeof serviceRequests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/service-requests' as const,
      input: insertServiceRequestSchema,
      responses: {
        201: z.custom<typeof serviceRequests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/service-requests/:id' as const,
      input: insertServiceRequestSchema.partial().extend({
        status: z.enum(["open", "in_progress", "completed", "cancelled"]).optional(),
      }),
      responses: {
        200: z.custom<typeof serviceRequests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  quotes: {
    listByRequest: {
      method: 'GET' as const,
      path: '/api/service-requests/:requestId/quotes' as const,
      responses: {
        200: z.array(z.custom<typeof quotes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/service-requests/:requestId/quotes' as const,
      input: insertQuoteSchema.omit({ serviceRequestId: true }),
      responses: {
        201: z.custom<typeof quotes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    accept: {
      method: 'POST' as const,
      path: '/api/quotes/:id/accept' as const,
      responses: {
        200: z.custom<typeof quotes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  messages: {
    listByRequest: {
      method: 'GET' as const,
      path: '/api/service-requests/:requestId/messages' as const,
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/service-requests/:requestId/messages' as const,
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.unauthorized,
      },
    },
  },
  invoices: {
    list: {
      method: 'GET' as const,
      path: '/api/invoices' as const,
      responses: {
        200: z.array(z.custom<typeof invoices.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/invoices' as const,
      input: z.object({
        serviceRequestId: z.number(),
        amount: z.number().min(1),
        description: z.string().min(1),
      }),
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.unauthorized,
      },
    },
    earnings: {
      method: 'GET' as const,
      path: '/api/earnings' as const,
      responses: {
        200: z.object({
          totalEarnings: z.number(),
          totalCommission: z.number(),
          netEarnings: z.number(),
          invoiceCount: z.number(),
          paidCount: z.number(),
          pendingCount: z.number(),
        }),
      },
    },
    payCommission: {
      method: 'POST' as const,
      path: '/api/invoices/:id/pay-commission' as const,
      responses: {
        200: z.object({ url: z.string() }),
        404: errorSchemas.notFound,
      },
    }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
