# Despliegue unico en Vercel

Este repositorio se despliega como un solo proyecto Next.js:

- La web, el blog y el CRM viven en `apps`.
- Las APIs estan en Route Handlers bajo `/api/v1`.
- PostgreSQL permanece como un servicio externo.

## Configuracion del proyecto

Al importar el repositorio en Vercel:

1. Deja **Root Directory** en la raiz del repositorio (`.`).
2. Vercel leera `vercel.json`; no hace falta un Root Directory `apps/web`.
3. Configura las variables de entorno de Production y Preview.

Variables obligatorias:

```env
DATABASE_URL=postgresql://usuario:clave@host:5432/base?schema=public
JWT_SECRET=una_clave_aleatoria_de_al_menos_20_caracteres
JWT_EXPIRES_IN=8h
```

Variables recomendadas para inicializar el Super Admin:

```env
SUPER_ADMIN_EMAIL=administrador@tudominio.com
SUPER_ADMIN_PASSWORD=UnaClaveSegura123!
SUPER_ADMIN_FIRST_NAME=Super
SUPER_ADMIN_LAST_NAME=Admin
```

No configures `NEXT_PUBLIC_API_BASE_URL` en Vercel salvo que quieras otro base path.
Por defecto la app usa `/api/v1` en el mismo dominio.

El build ejecuta `prisma generate` y `prisma migrate deploy` antes de compilar
Next.js (`yarn vercel-build`). La base debe aceptar conexiones desde Vercel.

## Inicializacion de datos

Las migraciones se aplican automaticamente durante el despliegue. Para una
base nueva, ejecuta el seed una vez desde un entorno que tenga las mismas
variables:

```bash
yarn db:seed
```

El seed crea los permisos, roles del sistema y el Super Admin. No se ejecuta
en cada despliegue para evitar crear una cuenta con credenciales por defecto.
