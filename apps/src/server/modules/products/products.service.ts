import { prisma } from "@/server/prisma";
import { AppError } from "@/server/common/AppError";
import type { ProductInput } from "./products.schemas";

const includePlans = { plans: { orderBy: { sortOrder: "asc" as const } } };

export function listCatalogProducts(activeOnly = false) {
  return prisma.catalogProduct.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    include: includePlans,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
  });
}

export async function getPublicProduct(slug: string) {
  const product = await prisma.catalogProduct.findFirst({
    where: { slug, isActive: true },
    include: { plans: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } }
  });
  if (!product) throw new AppError("Producto no encontrado.", 404, "PRODUCT_NOT_FOUND");
  return product;
}

export async function createCatalogProduct(input: ProductInput) {
  return prisma.$transaction(async (tx) => {
    const plans = await Promise.all(input.plans.map(async (plan, sortOrder) => {
      let pdfMediaId = plan.pdfMediaId ?? null;
      if (plan.pdfUpload) {
        const data = Buffer.from(plan.pdfUpload.dataBase64.replace(/^data:[^;]+;base64,/, ""), "base64");
        if (data.byteLength > 10 * 1024 * 1024 || data.subarray(0, 5).toString() !== "%PDF-") throw new AppError("El PDF debe ser válido y no superar 10 MB.", 422, "INVALID_PLAN_PDF");
        const media = await tx.mediaFile.create({ data: { fileName: plan.pdfUpload.fileName, mimeType: "application/pdf", size: data.byteLength, data } });
        pdfMediaId = media.id;
      }
      return { name: plan.name, benefits: plan.benefits, price: plan.price, currency: plan.currency, additionalInfo: plan.additionalInfo?.trim() || null, cardColor: plan.cardColor, pdfMediaId, isActive: plan.isActive, sortOrder };
    }));
    return tx.catalogProduct.create({
      data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      shortDescription: input.shortDescription.trim(),
      description: input.description.trim(),
      additionalInfo: input.additionalInfo?.trim() || null,
      status: input.status,
      isActive: input.isActive,
      plans: { create: plans }
    },
    include: includePlans
  });
  });
}

export async function updateCatalogProduct(productId: string, input: ProductInput) {
  const exists = await prisma.catalogProduct.findUnique({ where: { id: productId }, select: { id: true } });
  if (!exists) throw new AppError("Producto no encontrado.", 404, "PRODUCT_NOT_FOUND");
  return prisma.$transaction(async (tx) => {
    await tx.productPlan.deleteMany({ where: { productId } });
    const plans = await Promise.all(input.plans.map(async (plan, sortOrder) => {
      let pdfMediaId = plan.pdfMediaId ?? null;
      if (plan.pdfUpload) {
        const data = Buffer.from(plan.pdfUpload.dataBase64.replace(/^data:[^;]+;base64,/, ""), "base64");
        if (data.byteLength > 10 * 1024 * 1024 || data.subarray(0, 5).toString() !== "%PDF-") throw new AppError("El PDF debe ser válido y no superar 10 MB.", 422, "INVALID_PLAN_PDF");
        const media = await tx.mediaFile.create({ data: { fileName: plan.pdfUpload.fileName, mimeType: "application/pdf", size: data.byteLength, data } });
        pdfMediaId = media.id;
      }
      return { name: plan.name, benefits: plan.benefits, price: plan.price, currency: plan.currency, additionalInfo: plan.additionalInfo?.trim() || null, cardColor: plan.cardColor, pdfMediaId, isActive: plan.isActive, sortOrder };
    }));
    return tx.catalogProduct.update({
      where: { id: productId },
      data: {
        name: input.name.trim(),
        slug: input.slug.trim(),
        shortDescription: input.shortDescription.trim(),
        description: input.description.trim(),
        additionalInfo: input.additionalInfo?.trim() || null,
        status: input.status,
        isActive: input.isActive,
        plans: { create: plans }
      },
      include: includePlans
    });
  });
}

export async function deleteCatalogProduct(productId: string) {
  await prisma.catalogProduct.delete({ where: { id: productId } });
  return { id: productId };
}
