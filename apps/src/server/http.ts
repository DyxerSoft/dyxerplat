import { NextResponse } from "next/server";
import { ZodError, type ZodIssue, type ZodTypeAny } from "zod";
import { AppError } from "@/server/common/AppError";

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  legalName: "Razon social",
  taxId: "NIT / Tax ID",
  email: "Correo",
  phone: "Telefono",
  address: "Direccion",
  website: "Sitio web",
  status: "Estado",
  notes: "Notas",
  firstName: "Nombre",
  lastName: "Apellido",
  position: "Cargo",
  isPrimary: "Contacto principal",
  password: "Contrasena",
  documentNumber: "Documento",
  roleIds: "Roles",
  code: "Codigo",
  description: "Descripcion",
  permissionCodes: "Permisos",
  title: "Titulo",
  excerpt: "Resumen",
  content: "Contenido",
  categoryId: "Categoria",
  tagIds: "Etiquetas",
  coverImage: "Imagen de portada",
  fileName: "Nombre de archivo",
  mimeType: "Tipo de archivo",
  dataBase64: "Archivo",
  q: "Busqueda",
  page: "Pagina",
  pageSize: "Tamano de pagina",
  companyId: "Compania",
  contactId: "Contacto",
  userId: "Usuario",
  roleId: "Rol",
  postId: "Publicacion",
  tagId: "Etiqueta",
  slug: "Slug",
  mediaId: "Archivo"
};

function labelForPath(path: ZodIssue["path"]) {
  const relevant = path.filter((segment) => segment !== "body" && segment !== "query" && segment !== "params");

  if (relevant.length === 0) {
    return "Formulario";
  }

  const key = String(relevant[relevant.length - 1]);
  return FIELD_LABELS[key] ?? key;
}

export function formatZodValidation(error: ZodError) {
  const errors = error.issues.map((issue) => {
    const field = labelForPath(issue.path);
    return `${field}: ${issue.message}`;
  });

  const uniqueErrors = Array.from(new Set(errors));

  return {
    message:
      uniqueErrors.length === 1
        ? uniqueErrors[0]
        : `Revisa estos datos: ${uniqueErrors.join(" · ")}`,
    details: {
      errors: uniqueErrors,
      fields: error.flatten().fieldErrors
    }
  };
}

export function jsonSuccess<T>(message: string, data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data
    },
    { status }
  );
}

export function jsonError(error: unknown) {
  if (error instanceof ZodError) {
    const validation = formatZodValidation(error);

    return NextResponse.json(
      {
        success: false,
        message: validation.message,
        code: "VALIDATION_ERROR",
        details: validation.details
      },
      { status: 422 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
        details: error.details ?? null
      },
      { status: error.statusCode }
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      message: "Ocurrio un error inesperado en el servidor.",
      code: "INTERNAL_SERVER_ERROR",
      details: null
    },
    { status: 500 }
  );
}

export async function handleRoute(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    return jsonError(error);
  }
}

export async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function searchParamsToObject(request: Request) {
  const params = new URL(request.url).searchParams;
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

export async function parseRequest<TSchema extends ZodTypeAny>(
  schema: TSchema,
  request: Request,
  params: Record<string, string> = {}
) {
  const method = request.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" || method === "DELETE" ? undefined : await parseJsonBody(request);

  return schema.parse({
    body,
    query: searchParamsToObject(request),
    params
  }) as ReturnType<TSchema["parse"]>;
}
