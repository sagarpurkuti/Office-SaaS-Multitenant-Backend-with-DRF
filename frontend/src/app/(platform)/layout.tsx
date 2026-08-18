"use client";

import { AuthProvider } from "@/components/auth-provider";
import { PlatformShell } from "@/components/platform-shell";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <PlatformShell>{children}</PlatformShell>
    </AuthProvider>
  );
}
