import type { Metadata } from "next";
import { ReportsPage } from "@/modules/tenant/reports/reports-page";

export const metadata: Metadata = { title: "Reports | Saas HRM" };

export default function TenantReportsRoute() {
  return <ReportsPage />;
}
