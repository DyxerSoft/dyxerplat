# Plan de implementacion Dyxerplat

## Objetivo

Convertir Dyxerplat en una plataforma con landing publica, blog y CRM interno para gestionar companias, contactos, publicaciones, usuarios, roles y permisos.

## Arquitectura

- Monorepo con Yarn workspaces.
- `apps/web`: Next.js para landing publica, blog, login y plataforma interna.
- `apps/api`: Node.js, Express, Prisma y PostgreSQL.
- `packages/shared`: constantes compartidas de roles, permisos y contratos simples.
- `prisma`: esquema, migraciones y seed de datos base.
- `docker-compose.yml`: PostgreSQL local para desarrollo.

## Modulos iniciales

1. Autenticacion:
   - Login por email y contrasena.
   - JWT.
   - Super admin creado por seed.

2. Seguridad:
   - Roles: `SUPER_ADMIN`, `ADMIN`, `USER`.
   - Permisos por modulo y accion.
   - Middleware de autenticacion y permisos en API.

3. CRM:
   - Companias.
   - Contactos encargados por compania.
   - Usuarios internos.
   - Roles y permisos.

4. Blog:
   - Publicaciones.
   - Categorias.
   - Tags.
   - Imagen de portada guardada en base de datos.

5. Auditoria basica:
   - `created_at`, `created_by_id`.
   - `updated_at`, `updated_by_id`.
   - `deleted_at`, `deleted_by_id`.
   - `is_deleted`.

## Decisiones tecnicas

- No se crea tabla de auditoria historica por ahora.
- Las eliminaciones son logicas.
- Las imagenes se guardan en PostgreSQL como `Bytes` mediante Prisma, no como archivos externos.
- El frontend consume al backend con respuestas estandarizadas.
- Los mensajes de error del backend deben mostrarse claros en pantalla.

## Ramas

- `main`: rama estable.
- `feature/configuracion-inicial`: configuracion base del monorepo.
- Futuras ramas sugeridas:
  - `feature/autenticacion-y-permisos`
  - `feature/landing-y-blog-publico`
  - `feature/crm-companias-contactos`
  - `feature/usuarios-roles-permisos`
  - `feature/publicaciones-blog`
  - `feature/diseno-plataforma`

## Pendientes a confirmar

- Proveedor final para base de datos en produccion.
- Donde se desplegara el API si no queda en Vercel.
- Tamano maximo permitido para imagenes en BD.
- Email final del super admin de produccion.
- Reglas exactas de permisos para el rol `USER`.
