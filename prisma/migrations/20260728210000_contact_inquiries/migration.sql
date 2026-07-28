CREATE TYPE "ContactInquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED');

CREATE TABLE "contact_inquiries" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "service" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "ContactInquiryStatus" NOT NULL DEFAULT 'NEW',
  "notes" TEXT,
  "contacted_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "updated_by_id" UUID,
  "deleted_at" TIMESTAMP(3),
  "deleted_by_id" UUID,
  CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contact_inquiries_status_created_at_idx" ON "contact_inquiries" ("status", "created_at");

INSERT INTO "permissions" ("id", "code", "module", "description", "created_at") VALUES
  (gen_random_uuid(), 'inquiries:read', 'inquiries', 'Consultar solicitudes web', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'inquiries:update', 'inquiries', 'Actualizar solicitudes web', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'inquiries:delete', 'inquiries', 'Eliminar solicitudes web', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
