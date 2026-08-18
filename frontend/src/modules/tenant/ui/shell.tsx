"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useTenantAuth } from "../auth/tenant-auth-provider";
import { displayName } from "../auth/roles";
import { TENANT_ROUTES } from "../config";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { href: "/organization", label: "Organization", icon: Building2, enabled: false },
  { href: "/employees", label: "Employees", icon: Users, enabled: false },
  { href: "/leave", label: "Leave", icon: CalendarDays, enabled: false },
  { href: "/payroll", label: "Payroll", icon: Wallet, enabled: false },
];

export function TenantShell({ children }: { children: React.ReactNode }) {
  const { user, tenantHost, loading, logout } = useTenantAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(TENANT_ROUTES.login);
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading workspace…
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div className="border-b border-slate-200 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Tenant workspace
            </p>
            <h1 className="mt-1 text-lg font-semibold">Saas HRM</h1>
            {tenantHost ? (
              <p className="mt-1 truncate font-mono text-xs text-slate-500">{tenantHost}</p>
            ) : null}
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/" || pathname === "/app"
                  : pathname === item.href || pathname === `/app${item.href}`;
              const Icon = item.icon;
              if (!item.enabled) {
                return (
                  <span
                    key={item.href}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-slate-400"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <span className="text-[10px] uppercase">Soon</span>
                  </span>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    active
                      ? "bg-indigo-50 text-indigo-950"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-200 p-4">
            <p className="truncate text-sm font-medium">{displayName(user)}</p>
            <p className="text-xs text-slate-500">{user.role}</p>
            <Button
              variant="ghost"
              className="mt-2 w-full justify-start px-2"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <span className="font-semibold">Workspace</span>
            <Button variant="ghost" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
