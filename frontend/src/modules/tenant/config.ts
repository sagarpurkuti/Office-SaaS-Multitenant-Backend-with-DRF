export const TENANT_COOKIE = {
  access: "tenant_access",
  refresh: "tenant_refresh",
  host: "tenant_host",
} as const;

export const TENANT_ROUTES = {
  login: "/login",
  home: "/",
  bff: "/api/tenant",
  profile: "/profile",
  employees: "/employees",
  organization: "/organization",
  attendance: "/attendance",
  leave: "/leave",
  payroll: "/payroll",
  reports: "/reports",
  roles: "/settings/roles",
} as const;

/**
 * Roles recognised by the tenant workspace.
 *
 * `OWNER`, `HR`, `MANAGER`, `ACCOUNTANT` and `EMPLOYEE` exist in Django today
 * (`accounts.User.Role`). `INTERN` is defined here so the workspace already
 * handles it; until Django adds the choice no user can be issued that role.
 */
export const TENANT_ROLES = [
  "OWNER",
  "HR",
  "MANAGER",
  "ACCOUNTANT",
  "EMPLOYEE",
  "INTERN",
] as const;

export type TenantRole = (typeof TENANT_ROLES)[number];

/**
 * Roles that can be issued to a new login today. Kept in step with
 * `accounts.User.Role`, which has no `INTERN` choice yet.
 */
export const ASSIGNABLE_TENANT_ROLES = TENANT_ROLES.filter(
  (role) => role !== "INTERN",
);

export type TenantRoleMeta = {
  /** Name shown in the product; the stored value stays the Django enum. */
  label: string;
  description: string;
  tone: "teal" | "amber" | "green" | "slate" | "red";
};

export const TENANT_ROLE_META: Record<TenantRole, TenantRoleMeta> = {
  OWNER: {
    label: "CEO / Organization admin",
    description: "Full access to every feature and every record in the tenant.",
    tone: "teal",
  },
  HR: {
    label: "HR",
    description:
      "People operations across the organization. Payroll stays view-only unless granted.",
    tone: "green",
  },
  MANAGER: {
    label: "Manager",
    description: "Team-scoped access to the people who report to them.",
    tone: "amber",
  },
  ACCOUNTANT: {
    label: "Accounts / Finance",
    description: "Payroll, salary structures and the data needed to run them.",
    tone: "amber",
  },
  EMPLOYEE: {
    label: "Employee",
    description: "Self-service only: own profile, attendance, leave and payslips.",
    tone: "slate",
  },
  INTERN: {
    label: "Intern / Trainee",
    description: "Restricted self-service. No access to salary of any kind.",
    tone: "slate",
  },
};

export function isTenantRole(value: unknown): value is TenantRole {
  return (
    typeof value === "string" &&
    (TENANT_ROLES as readonly string[]).includes(value)
  );
}

export function tenantRoleLabel(value: string | null | undefined): string {
  if (isTenantRole(value)) return TENANT_ROLE_META[value].label;
  return value || "Unknown role";
}
