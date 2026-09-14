import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { AppError } from "@/server/common/AppError";
import type { CreatePublicLeadInput, ListLeadsInput, UpdateLeadInput } from "./leads.schemas";

const leadInclude = {
  updatedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true
    }
  }
} satisfies Prisma.LeadInclude;

type LeadWithFollowUp = Prisma.LeadGetPayload<{ include: typeof leadInclude }>;

function toLeadResponse(lead: LeadWithFollowUp) {
  return {
    id: lead.id,
    fullName: lead.fullName,
    companyName: lead.companyName,
    position: lead.position,
    email: lead.email,
    phone: lead.phone,
    serviceInterest: lead.serviceInterest,
    message: lead.message,
    status: lead.status,
    notes: lead.notes,
    contactedAt: lead.contactedAt,
    closedAt: lead.closedAt,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    followedBy: lead.updatedBy
      ? {
          id: lead.updatedBy.id,
          firstName: lead.updatedBy.firstName,
          lastName: lead.updatedBy.lastName,
          email: lead.updatedBy.email,
          fullName: `${lead.updatedBy.firstName} ${lead.updatedBy.lastName}`.trim()
        }
      : null
  };
}

export async function createPublicLead(input: CreatePublicLeadInput) {
  const lead = await prisma.lead.create({
    data: {
      fullName: input.fullName.trim(),
      companyName: input.companyName.trim(),
      position: input.position?.trim() || null,
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      serviceInterest: input.serviceInterest.trim(),
      message: input.message.trim(),
      status: "NEW"
    },
    include: leadInclude
  });

  return toLeadResponse(lead);
}

export async function listLeads(input: ListLeadsInput) {
  const where: Prisma.LeadWhereInput = {
    isDeleted: false,
    ...(input.status ? { status: input.status } : {}),
    ...(input.q
      ? {
          OR: [
            { fullName: { contains: input.q, mode: "insensitive" } },
            { companyName: { contains: input.q, mode: "insensitive" } },
            { email: { contains: input.q, mode: "insensitive" } },
            { phone: { contains: input.q, mode: "insensitive" } },
            { serviceInterest: { contains: input.q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const skip = (input.page - 1) * input.pageSize;
  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: leadInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: input.pageSize
    }),
    prisma.lead.count({ where })
  ]);

  return {
    items: items.map(toLeadResponse),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize))
    }
  };
}

export async function updateLead(leadId: string, input: UpdateLeadInput, actorId: string) {
  const existing = await prisma.lead.findFirst({
    where: { id: leadId, isDeleted: false }
  });

  if (!existing) {
    throw new AppError("El lead no existe o fue eliminado.", 404, "LEAD_NOT_FOUND");
  }

  const nextStatus = input.status ?? existing.status;
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      ...(input.fullName !== undefined ? { fullName: input.fullName.trim() } : {}),
      ...(input.companyName !== undefined ? { companyName: input.companyName.trim() } : {}),
      ...(input.position !== undefined ? { position: input.position?.trim() || null } : {}),
      ...(input.email !== undefined ? { email: input.email.trim().toLowerCase() } : {}),
      ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
      ...(input.serviceInterest !== undefined ? { serviceInterest: input.serviceInterest.trim() } : {}),
      ...(input.message !== undefined ? { message: input.message.trim() } : {}),
      ...(input.notes !== undefined ? { notes: input.notes?.trim() || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      contactedAt:
        nextStatus === "IN_CONTACT" && !existing.contactedAt
          ? new Date()
          : nextStatus === "NEW"
            ? null
            : existing.contactedAt,
      closedAt:
        (nextStatus === "CLOSED_WON" || nextStatus === "CLOSED_LOST") && !existing.closedAt
          ? new Date()
          : nextStatus === "NEW" || nextStatus === "IN_CONTACT"
            ? null
            : existing.closedAt,
      updatedById: actorId
    },
    include: leadInclude
  });

  return toLeadResponse(lead);
}

export async function deleteLead(leadId: string, actorId: string) {
  const existing = await prisma.lead.findFirst({
    where: { id: leadId, isDeleted: false }
  });

  if (!existing) {
    throw new AppError("El lead no existe o ya fue eliminado.", 404, "LEAD_NOT_FOUND");
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedById: actorId,
      updatedById: actorId
    }
  });

  return { id: leadId };
}
