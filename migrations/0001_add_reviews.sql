CREATE TABLE IF NOT EXISTS "reviews" (
  "id" serial PRIMARY KEY NOT NULL,
  "service_request_id" integer NOT NULL REFERENCES "service_requests"("id"),
  "contractor_id" text NOT NULL REFERENCES "users"("id"),
  "homeowner_id" text NOT NULL REFERENCES "users"("id"),
  "rating" integer NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "comment" text,
  "created_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "reviews_service_request_id_unique" ON "reviews" ("service_request_id");
CREATE INDEX IF NOT EXISTS "reviews_contractor_id_idx" ON "reviews" ("contractor_id");
