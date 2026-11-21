ALTER TABLE "product_plans"
ADD COLUMN "card_color" TEXT NOT NULL DEFAULT '#272064',
ADD COLUMN "pdf_media_id" UUID;
