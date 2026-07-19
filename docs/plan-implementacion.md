# Plan de implementacion Dyxerplat

## Objetivo

Convertir Dyxerplat en una plataforma con landing publica, blog y CRM interno para gestionar companias, contactos, publicaciones, usuarios, roles y permisos.

## Arquitectura

- Monorepo con Yarn workspaces.
- `apps/web`: Next.js para landing publica, blog, login y plataforma interna.
- `apps/api`: Node.js, Express, Prisma y PostgreSQL.
- Cada aplicacion mantiene sus propios tipos y constantes dentro de `apps/api` y `apps/web`.
- `prisma`: esquema, migraciones y seed de datos base.
- `docker-compose.yml`: PostgreSQL local para desarrollo.

## Modulos iniciales

1. Autenticacion:
   - Login por email y contrasena.
   - JWT.
   - Super admin creado por seed.
   - Estado: implementado.

2. Seguridad:
   - Roles: `SUPER_ADMIN`, `ADMIN`, `USER`.
   - Permisos por modulo y accion.
   - Middleware de autenticacion y permisos en API.
   - Administracion interna de usuarios, roles y permisos.
   - Estado: implementado.

3. CRM:
   - Companias.
   - Contactos encargados por compania.
   - Usuarios internos.
   - Roles y permisos.
   - Estado: implementado para companias, contactos, usuarios, roles y permisos.

4. Blog:
   - Publicaciones.
   - Categorias.
   - Tags.
   - Imagen de portada guardada en base de datos.
   - Estado: implementado para publicaciones, blog publico e imagen de portada. Categorias y tags quedan modelados en BD para una segunda iteracion de UI.

5. Auditoria basica:
   - `created_at`, `created_by_id`.
   - `updated_at`, `updated_by_id`.
   - `deleted_at`, `deleted_by_id`.
   - `is_deleted`.
   - Estado: implementado en las tablas principales.

## Decisiones tecnicas

- No se crea tabla de auditoria historica por ahora.
- Las eliminaciones son logicas.
- Las imagenes se guardan en PostgreSQL como `Bytes` mediante Prisma, no como archivos externos.
- El frontend consume al backend con respuestas estandarizadas.
- Los mensajes de error del backend deben mostrarse claros en pantalla.

## Ramas

- `main`: rama estable.
- `feature/configuracion-inicial`: configuracion base del monorepo.
- `feature/autenticacion-y-permisos`: autenticacion, JWT, seed y permisos base.
- `feature/landing-publica`: landing copiada desde `dixersft io`, blog/login en navegacion y estados vacios.
- `feature/crm-companias-contactos`: companias y encargados de contacto.
- `feature/publicaciones-blog`: publicaciones privadas y blog publico.
- `feature/usuarios-roles-permisos`: usuarios, roles y permisos.

## Pendientes a confirmar

- Proveedor final para base de datos en produccion.
- Donde se desplegara el API si no queda en Vercel.
- Tamano maximo permitido para imagenes en BD.
- Email final del super admin de produccion.
- Reglas exactas de permisos para el rol `USER`.
