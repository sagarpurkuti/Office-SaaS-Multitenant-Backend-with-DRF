import type { Metadata } from "next";
import { OrganizationPage } from "@/modules/tenant/organization/organization-page";

export const metadata: Metadata = { title: "Organization | Saas HRM" };

export default function TenantOrganizationRoute() {
  return <OrganizationPage />;
}
