-- CreateIndex
CREATE INDEX IF NOT EXISTS "leads_updated_by_id_idx" ON "leads"("updated_by_id");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_updated_by_id_fkey'
  ) THEN
    ALTER TABLE "leads"
      ADD CONSTRAINT "leads_updated_by_id_fkey"
      FOREIGN KEY ("updated_by_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
