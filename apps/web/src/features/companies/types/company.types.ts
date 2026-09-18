export type CompanyStatus = "ACTIVE" | "INACTIVE";

export type Company = {
  id: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  status: CompanyStatus;
  notes: string | null;
  contactsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CompanyContact = {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  isPrimary: boolean;
  status: CompanyStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CompanyFormValues = {
  name: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  status: CompanyStatus;
  notes: string;
};

export type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  isPrimary: boolean;
  status: CompanyStatus;
  notes: string;
};

export type PaginatedCompanies = {
  items: Company[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type PaginatedContacts = {
  items: CompanyContact[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};
