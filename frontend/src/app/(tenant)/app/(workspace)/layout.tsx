"use client";

import { TenantAuthProvider } from "@/modules/tenant/auth/tenant-auth-provider";
import { RbacProvider } from "@/modules/tenant/rbac";
import { TenantShell } from "@/modules/tenant/ui/shell";

export default function TenantWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantAuthProvider>
      <RbacProvider>
        <TenantShell>{children}</TenantShell>
      </RbacProvider>
    </TenantAuthProvider>
  );
}
