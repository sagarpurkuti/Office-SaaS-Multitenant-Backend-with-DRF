"use client";

import { TenantAuthProvider } from "@/modules/tenant/auth/tenant-auth-provider";

export default function TenantLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TenantAuthProvider>{children}</TenantAuthProvider>;
}
