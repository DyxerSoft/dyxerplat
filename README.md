# dyxerplat

Plataforma Dyxerplat para landing publica, blog y CRM interno de DyxerSoft.

## Stack inicial

- Yarn workspaces.
- Next.js en `apps/web`.
- Express + Prisma en `apps/api`.
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

4. Levantar web y API:

```bash
yarn dev
```

## URLs locales

- Web: `http://localhost:3000`
- API: `http://localhost:4000/api/v1`
- Healthcheck: `http://localhost:4000/api/v1/health`

## Super admin local

- Email: `admin@dyxerplat.local`
- Password: `Cambiar123!`

La contrasena se guarda hasheada en base de datos por el seed. En produccion debe reemplazarse por variables de entorno seguras.
