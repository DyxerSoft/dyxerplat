export type LeadStatus = "NEW" | "IN_CONTACT" | "CLOSED_WON" | "CLOSED_LOST";

export type LeadFollowedBy = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
};

export type Lead = {
  id: string;
  fullName: string;
  companyName: string;
  position: string | null;
  email: string;
  phone: string;
  serviceInterest: string;
  message: string;
  status: LeadStatus;
  notes: string | null;
  contactedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  followedBy: LeadFollowedBy | null;
};

export type LeadFormValues = {
  status: LeadStatus;
  notes: string;
};

export type PaginatedLeads = {
  items: Lead[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
