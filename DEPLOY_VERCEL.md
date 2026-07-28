# Despliegue unico en Vercel

Este repositorio se despliega como un solo proyecto:

- Next.js publica la web y la landing page.
- Express se ejecuta como una Vercel Function bajo `/api/v1`.
- PostgreSQL permanece como un servicio externo.

## Configuracion del proyecto

Al importar el repositorio en Vercel:

1. Deja **Root Directory** en la raiz del repositorio (`.`).
2. Vercel leera `vercel.json`; no crees un segundo proyecto para `apps/api`.
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

No configures `NEXT_PUBLIC_API_BASE_URL` en Vercel. La web usa `/api/v1`
en el mismo dominio. `API_BASE_URL` y `CORS_ORIGIN` se calculan con las
variables nativas de Vercel, aunque se pueden definir manualmente si se usa
un dominio personalizado.

El build ejecuta `prisma generate` y `prisma migrate deploy` antes de compilar
Next.js. La base debe aceptar conexiones desde Vercel y usar SSL cuando el
proveedor lo requiera.

## Inicializacion de datos

Las migraciones se aplican automáticamente durante el despliegue. Para una
base nueva, ejecuta el seed una vez desde un entorno que tenga las mismas
variables:

```bash
yarn db:seed
```

El seed crea los permisos, roles del sistema y el Super Admin. No se ejecuta
en cada despliegue para evitar crear una cuenta con credenciales por defecto.
