"use client";

import { TenantAuthProvider } from "@/modules/tenant/auth/tenant-auth-provider";
import { TenantShell } from "@/modules/tenant/ui/shell";

export default function TenantWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantAuthProvider>
      <TenantShell>{children}</TenantShell>
    </TenantAuthProvider>
  );
}
