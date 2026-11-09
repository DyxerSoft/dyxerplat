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
  return prisma.catalogProduct.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      shortDescription: input.shortDescription.trim(),
      description: input.description.trim(),
      additionalInfo: input.additionalInfo?.trim() || null,
      isActive: input.isActive,
      plans: { create: input.plans.map((plan, sortOrder) => ({ ...plan, sortOrder, additionalInfo: plan.additionalInfo?.trim() || null })) }
    },
    include: includePlans
  });
}

export async function updateCatalogProduct(productId: string, input: ProductInput) {
  const exists = await prisma.catalogProduct.findUnique({ where: { id: productId }, select: { id: true } });
  if (!exists) throw new AppError("Producto no encontrado.", 404, "PRODUCT_NOT_FOUND");
  return prisma.$transaction(async (tx) => {
    await tx.productPlan.deleteMany({ where: { productId } });
    return tx.catalogProduct.update({
      where: { id: productId },
      data: {
        name: input.name.trim(),
        slug: input.slug.trim(),
        shortDescription: input.shortDescription.trim(),
        description: input.description.trim(),
        additionalInfo: input.additionalInfo?.trim() || null,
        isActive: input.isActive,
        plans: { create: input.plans.map((plan, sortOrder) => ({ name: plan.name, benefits: plan.benefits, price: plan.price, currency: plan.currency, additionalInfo: plan.additionalInfo?.trim() || null, isActive: plan.isActive, sortOrder })) }
      },
      include: includePlans
    });
  });
}

export async function deleteCatalogProduct(productId: string) {
  await prisma.catalogProduct.delete({ where: { id: productId } });
  return { id: productId };
}
