import type { Metadata } from "next";
import { ProfilePage } from "@/modules/tenant/profile/profile-page";

export const metadata: Metadata = { title: "My profile | Saas HRM" };

export default function TenantProfileRoute() {
  return <ProfilePage />;
}
