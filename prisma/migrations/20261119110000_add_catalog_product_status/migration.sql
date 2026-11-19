ALTER TABLE "catalog_products"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'Disponible';

UPDATE "catalog_products" SET "status" = CASE "slug"
  WHEN 'dyxercrm' THEN 'Próximamente'
  WHEN 'dyxersales' THEN 'Disponible'
  WHEN 'dyxerfinance' THEN 'Próximamente'
  WHEN 'dyxerflow' THEN 'En beta'
  WHEN 'dyxeranalytics' THEN 'Próximamente'
  WHEN 'pigim' THEN 'Disponible'
  WHEN 'bespa' THEN 'En beta'
  ELSE 'Disponible'
END;
