INSERT INTO "permissions" ("id", "code", "module", "description", "created_at")
VALUES
  (gen_random_uuid(), 'roles:create', 'roles', 'Crear roles', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'roles:read', 'roles', 'Consultar roles', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'roles:update', 'roles', 'Editar roles', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'roles:delete', 'roles', 'Eliminar roles', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id", "created_at")
SELECT existing."role_id", replacement."id", CURRENT_TIMESTAMP
FROM "role_permissions" existing
JOIN "permissions" legacy ON legacy."id" = existing."permission_id" AND legacy."code" = 'roles:manage'
CROSS JOIN "permissions" replacement
WHERE replacement."code" IN ('roles:create', 'roles:read', 'roles:update', 'roles:delete')
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

DELETE FROM "role_permissions"
WHERE "permission_id" = (SELECT "id" FROM "permissions" WHERE "code" = 'roles:manage');

DELETE FROM "permissions" WHERE "code" = 'roles:manage';
