import { PERMISSIONS, PROTECTED_ROLE_CODES } from "@dyxerplat/shared";
import { authenticate } from "@/server/auth";
import { handleRoute, jsonSuccess } from "@/server/http";
import { prisma } from "@/server/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await authenticate(request);

    const [companies, posts, users, roles, leads] = await Promise.all([
      auth.permissions.includes(PERMISSIONS.COMPANIES_READ)
        ? prisma.company.count({ where: { isDeleted: false } })
        : Promise.resolve(null),
      auth.permissions.includes(PERMISSIONS.POSTS_READ)
        ? prisma.post.count({ where: { isDeleted: false } })
        : Promise.resolve(null),
      auth.permissions.includes(PERMISSIONS.USERS_READ)
        ? prisma.user.count({
            where: {
              isDeleted: false,
              NOT: {
                userRoles: {
                  some: {
                    role: {
                      code: {
                        in: [...PROTECTED_ROLE_CODES]
                      }
                    }
                  }
                }
              }
            }
          })
        : Promise.resolve(null),
      prisma.role.count({
        where: {
          isDeleted: false,
          code: {
            notIn: [...PROTECTED_ROLE_CODES]
          }
        }
      }),
      auth.permissions.includes(PERMISSIONS.LEADS_READ)
        ? prisma.lead.count({ where: { isDeleted: false } })
        : Promise.resolve(null)
    ]);

    return jsonSuccess("Resumen del dashboard obtenido correctamente.", {
      companies,
      posts,
      users,
      roles,
      leads
    });
  });
}
