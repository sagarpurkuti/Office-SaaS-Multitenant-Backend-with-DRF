import type { Metadata } from "next";
import { PayrollPage } from "@/modules/tenant/payroll/payroll-page";

export const metadata: Metadata = { title: "Payroll | Saas HRM" };

export default function TenantPayrollRoute() {
  return <PayrollPage />;
}
