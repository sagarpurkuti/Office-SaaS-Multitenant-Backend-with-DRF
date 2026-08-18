"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tenants", label: "Tenants", icon: Building2 },
  { href: "/plans", label: "Plans", icon: Package },
  { href: "/subscriptions", label: "Subscriptions", icon: Users },
  { href: "/audit", label: "Audit", icon: ClipboardList },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
];

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Loading SaaS Manager…
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div className="border-b border-slate-200 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Saas HRM
            </p>
            <h1 className="mt-1 text-lg font-semibold">SaaS Manager</h1>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    active
                      ? "bg-teal-50 text-teal-900"
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
            <p className="truncate text-sm font-medium">{user.email}</p>
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
            <span className="font-semibold">SaaS Manager</span>
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
