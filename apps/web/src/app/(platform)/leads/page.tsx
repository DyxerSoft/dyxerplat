import type { Metadata } from "next";
import { LeadManager } from "@/features/leads/components/LeadManager";

export const metadata: Metadata = {
  title: "Leads"
};

export default function LeadsPage() {
  return <LeadManager />;
}
