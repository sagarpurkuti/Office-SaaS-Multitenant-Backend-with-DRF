import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  ShieldCheck,
  PieChart,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { TENANT_ROUTES } from "../config";
import type { PermissionKey, Scope } from "../rbac";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * Item is shown when the user holds any one of these. Omit for entries every
   * workspace user may open.
   */
  anyOf?: readonly PermissionKey[];
  /** Minimum reach required to see the entry; defaults to `own`. */
  scope?: Scope;
  description?: string;
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

/**
 * Single source of truth for workspace navigation. Adding a feature means
 * adding an entry here plus a route — the sidebar, mobile nav and command
 * surfaces all read from this list, so nothing can drift out of sync with the
 * permissions that actually gate the page.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        href: TENANT_ROUTES.home,
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Everything relevant to your role today.",
      },
      {
        href: TENANT_ROUTES.profile,
        label: "My profile",
        icon: UserRound,
        anyOf: ["profile.view"],
        description: "Your employment details and personal information.",
      },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      {
        href: TENANT_ROUTES.employees,
        label: "Employees",
        icon: Users,
        anyOf: ["employee.view"],
        scope: "team",
        description: "Directory, assignments and employment status.",
      },
      {
        href: TENANT_ROUTES.organization,
        label: "Organization",
        icon: Building2,
        anyOf: ["organization.view", "branch.view", "department.view"],
        description: "Branches, departments and designations.",
      },
    ],
  },
  {
    id: "time",
    label: "Time",
    items: [
      {
        href: TENANT_ROUTES.attendance,
        label: "Attendance",
        icon: ClipboardCheck,
        anyOf: ["attendance.view"],
        description: "Daily attendance, corrections and appeals.",
      },
      {
        href: TENANT_ROUTES.leave,
        label: "Leave",
        icon: CalendarDays,
        anyOf: ["leave.view", "leave.apply"],
        description: "Requests, approvals and balances.",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      {
        href: TENANT_ROUTES.payroll,
        label: "Payroll",
        icon: Wallet,
        anyOf: ["payroll.view", "salary.view", "salary_statement.view"],
        description: "Payroll runs, salary and statements.",
      },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      {
        href: TENANT_ROUTES.reports,
        label: "Reports",
        icon: PieChart,
        anyOf: ["reports.view"],
        description: "Employee, attendance, leave and payroll reporting.",
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      {
        href: TENANT_ROUTES.roles,
        label: "Roles & permissions",
        icon: ShieldCheck,
        anyOf: ["role.view"],
        description: "Configure what each role in this tenant can do.",
      },
    ],
  },
];

export function isNavItemVisible(
  item: NavItem,
  canAny: (permissions: readonly PermissionKey[], scope?: Scope) => boolean,
): boolean {
  if (!item.anyOf || item.anyOf.length === 0) return true;
  return canAny(item.anyOf, item.scope);
}

/** Sections with no visible item are dropped entirely. */
export function visibleNavSections(
  canAny: (permissions: readonly PermissionKey[], scope?: Scope) => boolean,
): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => isNavItemVisible(item, canAny)),
  })).filter((section) => section.items.length > 0);
}

/**
 * Middleware rewrites tenant-host `/x` to the internal `/app/x`, so both forms
 * can appear in `usePathname()` depending on how the page was reached.
 */
export function isNavItemActive(href: string, pathname: string): boolean {
  const internal = pathname === "/app" || pathname.startsWith("/app/");
  const normalized = internal
    ? pathname.slice("/app".length) || "/"
    : pathname;

  if (href === "/") return normalized === "/";
  return normalized === href || normalized.startsWith(`${href}/`);
}
