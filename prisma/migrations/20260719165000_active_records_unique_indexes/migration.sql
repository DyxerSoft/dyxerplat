-- Los valores historicos eliminados logicamente no bloquean nuevas altas.
DROP INDEX IF EXISTS "users_email_key";
DROP INDEX IF EXISTS "roles_code_key";
DROP INDEX IF EXISTS "post_categories_slug_key";
DROP INDEX IF EXISTS "post_tags_slug_key";
DROP INDEX IF EXISTS "posts_slug_key";

CREATE UNIQUE INDEX "users_email_active_key" ON "users" ("email") WHERE "is_deleted" = false;
CREATE UNIQUE INDEX "roles_code_active_key" ON "roles" ("code") WHERE "is_deleted" = false;
CREATE UNIQUE INDEX "post_categories_slug_active_key" ON "post_categories" ("slug") WHERE "is_deleted" = false;
CREATE UNIQUE INDEX "post_tags_slug_active_key" ON "post_tags" ("slug") WHERE "is_deleted" = false;
CREATE UNIQUE INDEX "posts_slug_active_key" ON "posts" ("slug") WHERE "is_deleted" = false;
