import type { Metadata } from "next";
import { LeavePage } from "@/modules/tenant/leave/leave-page";

export const metadata: Metadata = { title: "Leave | Saas HRM" };

export default function TenantLeaveRoute() {
  return <LeavePage />;
}
