-- Garantiza que Super Admin reciba permisos actuales y futuros automaticamente.
INSERT INTO "role_permissions" ("role_id", "permission_id", "created_at")
SELECT role."id", permission."id", CURRENT_TIMESTAMP
FROM "roles" role
CROSS JOIN "permissions" permission
WHERE role."code" = 'SUPER_ADMIN' AND role."is_deleted" = false
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

CREATE OR REPLACE FUNCTION assign_permission_to_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "role_permissions" ("role_id", "permission_id", "created_at")
  SELECT "id", NEW."id", CURRENT_TIMESTAMP
  FROM "roles"
  WHERE "code" = 'SUPER_ADMIN' AND "is_deleted" = false
  ON CONFLICT ("role_id", "permission_id") DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS permission_created_assign_super_admin ON "permissions";
CREATE TRIGGER permission_created_assign_super_admin
AFTER INSERT ON "permissions"
FOR EACH ROW
EXECUTE FUNCTION assign_permission_to_super_admin();
