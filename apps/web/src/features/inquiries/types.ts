export type InquiryStatus = "NEW" | "CONTACTED" | "FOLLOW_UP" | "CONVERTED" | "CLOSED";

export type ContactInquiry = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  service: string;
  message: string;
  status: InquiryStatus;
  notes: string | null;
  contactedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InquiriesPage = {
  items: ContactInquiry[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  statusCounts: Partial<Record<InquiryStatus, number>>;
};
