# dyxerplat

Plataforma Dyxerplat para landing publica, blog y CRM interno de DyxerSoft.

## Stack

- Yarn workspaces.
- Next.js (App Router) en `apps` con Route Handlers en `/api/v1`.
- PostgreSQL local con Docker.
- Prisma schema y seed en `prisma`.

## Desarrollo local

Prerequisitos: Node.js, Corepack y Docker Desktop en ejecucion.

1. Instalar dependencias y crear el archivo de entorno:

```powershell
corepack yarn install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Si `DATABASE_URL` apunta a `localhost:5433` y Prisma no logra conectarse, cambia `localhost` por `127.0.0.1` en esa variable.

2. Levantar PostgreSQL:

```bash
corepack yarn docker:up
```

3. Aplicar migraciones y cargar los datos iniciales:

```bash
corepack yarn db:migrate
corepack yarn db:seed
```

4. Levantar la app (front + API en un solo proceso):

```bash
corepack yarn dev
```

## URLs locales

- App: `http://localhost:3000`
- API: `http://localhost:3000/api/v1`
- Healthcheck: `http://localhost:3000/api/v1/health`

## Deploy en Vercel

1. Importar el monorepo en Vercel.
2. Root Directory: deja la **raiz** del repo (Vercel usa `vercel.json`).
3. Variables de entorno:
   - `DATABASE_URL` (Neon/Supabase/Vercel Postgres con pooling)
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (opcional)
   - `APP_URL` (URL publica del proyecto, ej. `https://tu-app.vercel.app`)
   - `NEXT_PUBLIC_API_BASE_URL=/api/v1`
4. Ejecutar migraciones contra la DB remota antes del primer deploy (`prisma migrate deploy`).

## Super admin local

- Email: `admin@dyxerplat.local`
- Password: `Cambiar123!`

La contrasena se guarda hasheada en base de datos por el seed. En produccion debe reemplazarse por variables de entorno seguras.
