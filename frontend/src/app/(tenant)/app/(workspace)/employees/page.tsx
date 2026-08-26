import type { Metadata } from "next";
import { EmployeesPage } from "@/modules/tenant/employees/employees-page";

export const metadata: Metadata = { title: "Employees | Saas HRM" };

export default function TenantEmployeesRoute() {
  return <EmployeesPage />;
}
