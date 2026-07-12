import type { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/AppError";
import type {
  CreateCompanyInput,
  CreateContactInput,
  ListCompaniesInput,
  ListContactsInput,
  UpdateCompanyInput,
  UpdateContactInput
} from "./companies.schemas";

function cleanOptional(value: string | null | undefined) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toCompanyResponse(company: Prisma.CompanyGetPayload<{ include: { _count: { select: { contacts: true } } } }>) {
  return {
    id: company.id,
    name: company.name,
    legalName: company.legalName,
    taxId: company.taxId,
    email: company.email,
    phone: company.phone,
    address: company.address,
    website: company.website,
    status: company.status,
    notes: company.notes,
    contactsCount: company._count.contacts,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt
  };
}

export async function listCompanies(input: ListCompaniesInput) {
  const where: Prisma.CompanyWhereInput = {
    isDeleted: false,
    ...(input.status ? { status: input.status } : {}),
    ...(input.q
      ? {
          OR: [
            { name: { contains: input.q, mode: "insensitive" } },
            { legalName: { contains: input.q, mode: "insensitive" } },
            { taxId: { contains: input.q, mode: "insensitive" } },
            { email: { contains: input.q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const skip = (input.page - 1) * input.pageSize;
  const [items, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        _count: {
          select: {
            contacts: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: input.pageSize
    }),
    prisma.company.count({ where })
  ]);

  return {
    items: items.map(toCompanyResponse),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize))
    }
  };
}

export async function createCompany(input: CreateCompanyInput, actorId: string) {
  const company = await prisma.company.create({
    data: {
      name: input.name.trim(),
      legalName: cleanOptional(input.legalName),
      taxId: cleanOptional(input.taxId),
      email: cleanOptional(input.email),
      phone: cleanOptional(input.phone),
      address: cleanOptional(input.address),
      website: cleanOptional(input.website),
      status: input.status,
      notes: cleanOptional(input.notes),
      createdById: actorId,
      updatedById: actorId
    },
    include: {
      _count: {
        select: {
          contacts: true
        }
      }
    }
  });

  return toCompanyResponse(company);
}

export async function updateCompany(companyId: string, input: UpdateCompanyInput, actorId: string) {
  const existing = await prisma.company.findFirst({
    where: {
      id: companyId,
      isDeleted: false
    }
  });

  if (!existing) {
    throw new AppError("La compania no existe o fue eliminada.", 404, "COMPANY_NOT_FOUND");
  }

  const company = await prisma.company.update({
    where: { id: companyId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.legalName !== undefined ? { legalName: cleanOptional(input.legalName) } : {}),
      ...(input.taxId !== undefined ? { taxId: cleanOptional(input.taxId) } : {}),
      ...(input.email !== undefined ? { email: cleanOptional(input.email) } : {}),
      ...(input.phone !== undefined ? { phone: cleanOptional(input.phone) } : {}),
      ...(input.address !== undefined ? { address: cleanOptional(input.address) } : {}),
      ...(input.website !== undefined ? { website: cleanOptional(input.website) } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.notes !== undefined ? { notes: cleanOptional(input.notes) } : {}),
      updatedById: actorId
    },
    include: {
      _count: {
        select: {
          contacts: true
        }
      }
    }
  });

  return toCompanyResponse(company);
}

export async function deleteCompany(companyId: string, actorId: string) {
  const existing = await prisma.company.findFirst({
    where: {
      id: companyId,
      isDeleted: false
    }
  });

  if (!existing) {
    throw new AppError("La compania no existe o ya fue eliminada.", 404, "COMPANY_NOT_FOUND");
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedById: actorId,
      updatedById: actorId,
      contacts: {
        updateMany: {
          where: {
            isDeleted: false
          },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedById: actorId,
            updatedById: actorId
          }
        }
      }
    }
  });

  return { id: companyId };
}

export async function listCompanyContacts(companyId: string, input: ListContactsInput) {
  await ensureCompanyExists(companyId);

  const where: Prisma.CompanyContactWhereInput = {
    companyId,
    isDeleted: false,
    ...(input.status ? { status: input.status } : {}),
    ...(input.q
      ? {
          OR: [
            { firstName: { contains: input.q, mode: "insensitive" } },
            { lastName: { contains: input.q, mode: "insensitive" } },
            { email: { contains: input.q, mode: "insensitive" } },
            { position: { contains: input.q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const contacts = await prisma.companyContact.findMany({
    where,
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }]
  });

  return contacts.map((contact) => ({
    id: contact.id,
    companyId: contact.companyId,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    position: contact.position,
    isPrimary: contact.isPrimary,
    status: contact.status,
    notes: contact.notes,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt
  }));
}

export async function createCompanyContact(companyId: string, input: CreateContactInput, actorId: string) {
  await ensureCompanyExists(companyId);

  if (input.isPrimary) {
    await clearPrimaryContact(companyId);
  }

  return prisma.companyContact.create({
    data: {
      companyId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: cleanOptional(input.email),
      phone: cleanOptional(input.phone),
      position: cleanOptional(input.position),
      isPrimary: input.isPrimary,
      status: input.status,
      notes: cleanOptional(input.notes),
      createdById: actorId,
      updatedById: actorId
    }
  });
}

export async function updateCompanyContact(companyId: string, contactId: string, input: UpdateContactInput, actorId: string) {
  await ensureCompanyExists(companyId);

  const existing = await prisma.companyContact.findFirst({
    where: {
      id: contactId,
      companyId,
      isDeleted: false
    }
  });

  if (!existing) {
    throw new AppError("El contacto no existe o fue eliminado.", 404, "CONTACT_NOT_FOUND");
  }

  if (input.isPrimary) {
    await clearPrimaryContact(companyId, contactId);
  }

  return prisma.companyContact.update({
    where: { id: contactId },
    data: {
      ...(input.firstName !== undefined ? { firstName: input.firstName.trim() } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName.trim() } : {}),
      ...(input.email !== undefined ? { email: cleanOptional(input.email) } : {}),
      ...(input.phone !== undefined ? { phone: cleanOptional(input.phone) } : {}),
      ...(input.position !== undefined ? { position: cleanOptional(input.position) } : {}),
      ...(input.isPrimary !== undefined ? { isPrimary: input.isPrimary } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.notes !== undefined ? { notes: cleanOptional(input.notes) } : {}),
      updatedById: actorId
    }
  });
}

export async function deleteCompanyContact(companyId: string, contactId: string, actorId: string) {
  await ensureCompanyExists(companyId);

  const existing = await prisma.companyContact.findFirst({
    where: {
      id: contactId,
      companyId,
      isDeleted: false
    }
  });

  if (!existing) {
    throw new AppError("El contacto no existe o ya fue eliminado.", 404, "CONTACT_NOT_FOUND");
  }

  await prisma.companyContact.update({
    where: { id: contactId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedById: actorId,
      updatedById: actorId
    }
  });

  return { id: contactId };
}

async function ensureCompanyExists(companyId: string) {
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      isDeleted: false
    }
  });

  if (!company) {
    throw new AppError("La compania no existe o fue eliminada.", 404, "COMPANY_NOT_FOUND");
  }
}

async function clearPrimaryContact(companyId: string, exceptContactId?: string) {
  await prisma.companyContact.updateMany({
    where: {
      companyId,
      isDeleted: false,
      ...(exceptContactId ? { id: { not: exceptContactId } } : {})
    },
    data: {
      isPrimary: false
    }
  });
}
