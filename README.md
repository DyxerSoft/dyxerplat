# dyxerplat

Plataforma Dyxerplat para landing publica, blog y CRM interno de DyxerSoft.

## Stack

- Yarn workspaces.
- Next.js (App Router) en `apps/web` con Route Handlers en `/api/v1`.
- PostgreSQL local con Docker.
- Prisma schema y seed en `prisma`.

## Desarrollo local

1. Instalar dependencias:

```bash
yarn install
```

2. Levantar PostgreSQL:

```bash
yarn docker:up
```

3. Ejecutar migraciones y seed:

```bash
yarn db:migrate
yarn db:seed
```

4. Copiar variables de entorno:

```bash
cp .env.example .env
```

5. Levantar la app (front + API en un solo proceso):

```bash
yarn dev
```

## URLs locales

- App: `http://localhost:3000`
- API: `http://localhost:3000/api/v1`
- Healthcheck: `http://localhost:3000/api/v1/health`

## Deploy en Vercel

1. Importar el monorepo en Vercel.
2. Root Directory: `apps/web` (o configurar el build desde la raiz).
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
