import { CompanyContactsManager } from "@/features/companies/components/CompanyContactsManager";

export default async function CompanyContactsPage({ params }: Readonly<{ params: Promise<{ companyId: string }> }>) {
  const { companyId } = await params;
  return <CompanyContactsManager companyId={companyId} />;
}
