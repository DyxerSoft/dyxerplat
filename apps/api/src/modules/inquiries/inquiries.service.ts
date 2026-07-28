import type { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/AppError";
import type { CreateInquiryInput, ListInquiriesInput, UpdateInquiryInput } from "./inquiries.schemas";

export async function createInquiry(input: CreateInquiryInput) {
  return prisma.contactInquiry.create({
    data: {
      name: input.name.trim(),
      company: input.company.trim(),
      email: input.email.toLowerCase().trim(),
      phone: input.phone?.trim() || null,
      service: input.service.trim(),
      message: input.message.trim()
    }
  });
}

export async function listInquiries(input: ListInquiriesInput) {
  const where: Prisma.ContactInquiryWhereInput = {
    isDeleted: false,
    ...(input.status ? { status: input.status } : {}),
    ...(input.q ? {
      OR: [
        { name: { contains: input.q, mode: "insensitive" } },
        { company: { contains: input.q, mode: "insensitive" } },
        { email: { contains: input.q, mode: "insensitive" } },
        { phone: { contains: input.q, mode: "insensitive" } },
        { service: { contains: input.q, mode: "insensitive" } }
      ]
    } : {})
  };
  const skip = (input.page - 1) * input.pageSize;
  const [items, total, statusCounts] = await Promise.all([
    prisma.contactInquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: input.pageSize }),
    prisma.contactInquiry.count({ where }),
    prisma.contactInquiry.groupBy({ by: ["status"], where: { isDeleted: false }, _count: { _all: true } })
  ]);
  return {
    items,
    pagination: { page: input.page, pageSize: input.pageSize, total, totalPages: Math.max(1, Math.ceil(total / input.pageSize)) },
    statusCounts: Object.fromEntries(statusCounts.map((item) => [item.status, item._count._all]))
  };
}

export async function updateInquiry(inquiryId: string, input: UpdateInquiryInput, actorId: string) {
  const existing = await prisma.contactInquiry.findFirst({ where: { id: inquiryId, isDeleted: false } });
  if (!existing) throw new AppError("La solicitud no existe o fue eliminada.", 404, "INQUIRY_NOT_FOUND");
  return prisma.contactInquiry.update({
    where: { id: inquiryId },
    data: {
      status: input.status,
      notes: input.notes?.trim() || null,
      contactedAt: input.status !== "NEW" && !existing.contactedAt ? new Date() : existing.contactedAt,
      updatedById: actorId
    }
  });
}

export async function deleteInquiry(inquiryId: string, actorId: string) {
  const existing = await prisma.contactInquiry.findFirst({ where: { id: inquiryId, isDeleted: false } });
  if (!existing) throw new AppError("La solicitud no existe o ya fue eliminada.", 404, "INQUIRY_NOT_FOUND");
  await prisma.contactInquiry.update({
    where: { id: inquiryId },
    data: { isDeleted: true, deletedAt: new Date(), deletedById: actorId, updatedById: actorId }
  });
  return { id: inquiryId };
}
