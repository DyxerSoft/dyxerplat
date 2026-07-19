INSERT INTO "permissions" ("id", "code", "module", "description", "created_at") VALUES
  (gen_random_uuid(), 'categories:create', 'categories', 'Crear categorías', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'categories:read', 'categories', 'Consultar categorías', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'categories:update', 'categories', 'Editar categorías', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'categories:delete', 'categories', 'Eliminar categorías', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'tags:create', 'tags', 'Crear tags', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'tags:read', 'tags', 'Consultar tags', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'tags:update', 'tags', 'Editar tags', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'tags:delete', 'tags', 'Eliminar tags', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
