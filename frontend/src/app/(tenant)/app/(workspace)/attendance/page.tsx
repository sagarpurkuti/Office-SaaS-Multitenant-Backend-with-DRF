import type { Metadata } from "next";
import { AttendancePage } from "@/modules/tenant/attendance/attendance-page";

export const metadata: Metadata = { title: "Attendance | Saas HRM" };

export default function TenantAttendanceRoute() {
  return <AttendancePage />;
}
