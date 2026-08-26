"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { useTenantAuth } from "../auth/tenant-auth-provider";
import { displayName } from "../auth/roles";
import { TENANT_ROLE_META, TENANT_ROUTES, isTenantRole } from "../config";
import {
  isNavItemActive,
  visibleNavSections,
  type NavSection,
} from "../navigation/nav";
import { useRbac } from "../rbac";

export function TenantShell({ children }: { children: React.ReactNode }) {
  const { user, tenantHost, loading, logout } = useTenantAuth();
  const { canAny, roleLabel } = useRbac();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace(TENANT_ROUTES.login);
  }, [loading, user, router]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading workspace…
      </div>
    );
  }

  if (!user) return null;

  const sections = visibleNavSections(canAny);
  const tone = isTenantRole(user.role)
    ? TENANT_ROLE_META[user.role].tone
    : "slate";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <WorkspaceBrand tenantHost={tenantHost} />
          <NavList sections={sections} pathname={pathname} />
          <div className="border-t border-slate-200 p-4">
            <p className="truncate text-sm font-medium">{displayName(user)}</p>
            <div className="mt-1">
              <Badge tone={tone}>{roleLabel}</Badge>
            </div>
            <Button
              variant="ghost"
              className="mt-3 w-full justify-start px-2"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <button
              type="button"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <span className="truncate text-sm font-semibold">
              {displayName(user)}
            </span>
            <Button variant="ghost" onClick={() => logout()} aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </header>

          {mobileNavOpen ? (
            <div className="border-b border-slate-200 bg-white md:hidden">
              <NavList sections={sections} pathname={pathname} />
            </div>
          ) : null}

          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function WorkspaceBrand({ tenantHost }: { tenantHost: string | null }) {
  return (
    <div className="border-b border-slate-200 px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
        Tenant workspace
      </p>
      <h1 className="mt-1 text-lg font-semibold">Saas HRM</h1>
      {tenantHost ? (
        <p className="mt-1 truncate font-mono text-xs text-slate-500">
          {tenantHost}
        </p>
      ) : null}
    </div>
  );
}

function NavList({
  sections,
  pathname,
}: {
  sections: NavSection[];
  pathname: string;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-5 p-3">
      {sections.map((section) => (
        <div key={section.id}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {section.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = isNavItemActive(item.href, pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
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
          </div>
        </div>
      ))}
    </nav>
  );
}
