import type { Metadata } from "next";
import { RolesPage } from "@/modules/tenant/settings/roles-page";

export const metadata: Metadata = { title: "Roles & permissions | Saas HRM" };

export default function TenantRolesRoute() {
  return <RolesPage />;
}
