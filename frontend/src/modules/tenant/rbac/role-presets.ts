/**
 * Default permission set per role.
 *
 * These are *defaults*, not the security boundary. When the API starts
 * returning a permission set for the signed-in user (see `resolve.ts`) that
 * payload wins, which is how a tenant admin's custom role configuration takes
 * effect without a frontend release.
 */

import { TENANT_ROLES, type TenantRole } from "../config";
import { expandGrants, type GrantSpec, type PermissionGrants } from "./grants";

/**
 * Self-service baseline every workspace user gets, whatever their role.
 * Always `own` scope.
 */
const SELF_SERVICE: GrantSpec = {
  "profile.view": "own",
  "profile.update": "own",
  "employee.view": "own",
  "attendance.view": "own",
  "attendance.mark": "own",
  "attendance.appeal": "own",
  "leave.view": "own",
  "leave.apply": "own",
  "salary_statement.view": "own",
  "salary_statement.download": "own",
};

/**
 * CEO / Organization admin: everything, organization-wide.
 * Written as a single wildcard so new permissions are covered automatically.
 */
const OWNER_SPEC: GrantSpec = {
  "*": "organization",
};

/**
 * HR owns people operations org-wide. Deliberately excluded: `salary.*`,
 * payroll mutations and `role.manage` — the spec wants those granted
 * explicitly, not inherited.
 */
const HR_SPEC: GrantSpec = {
  ...SELF_SERVICE,
  "organization.view": "organization",
  "branch.view": "organization",
  "department.view": "organization",
  "department.create": "organization",
  "department.update": "organization",
  "designation.view": "organization",
  "designation.create": "organization",
  "designation.update": "organization",
  "employee.view": "organization",
  "employee.create": "organization",
  "employee.update": "organization",
  "employee.assign": "organization",
  "employee_document.view": "organization",
  "employee_document.manage": "organization",
  "attendance.view": "organization",
  "attendance.update": "organization",
  "attendance.approve": "organization",
  "leave.view": "organization",
  "leave.approve": "organization",
  "leave.reject": "organization",
  "leave.manage": "organization",
  "payroll.view": "organization",
  "reports.view": "organization",
  "reports.export": "organization",
  "role.view": "organization",
  "audit.view": "organization",
};

/**
 * Accounts / Finance owns payroll and salary. Employee access is intentionally
 * read-only — enough to run payroll, nothing more.
 */
const ACCOUNTANT_SPEC: GrantSpec = {
  ...SELF_SERVICE,
  "organization.view": "organization",
  "branch.view": "organization",
  "department.view": "organization",
  "designation.view": "organization",
  "employee.view": "organization",
  "attendance.view": "organization",
  "leave.view": "organization",
  "payroll.*": "organization",
  "salary.*": "organization",
  "salary_statement.view": "organization",
  "salary_statement.download": "organization",
  "reports.view": "organization",
  "reports.export": "organization",
  "audit.view": "organization",
};

/** Manager: same verbs as HR in places, but capped at their own team. */
const MANAGER_SPEC: GrantSpec = {
  ...SELF_SERVICE,
  "organization.view": "organization",
  "branch.view": "organization",
  "department.view": "organization",
  "designation.view": "organization",
  "employee.view": "team",
  "attendance.view": "team",
  "attendance.approve": "team",
  "leave.view": "team",
  "leave.approve": "team",
  "leave.reject": "team",
  "reports.view": "team",
};

const EMPLOYEE_SPEC: GrantSpec = {
  ...SELF_SERVICE,
  "organization.view": "organization",
  "department.view": "organization",
  "designation.view": "organization",
  "salary.view": "own",
};

/** Intern: employee self-service minus salary amounts. Stipend statements stay. */
const INTERN_SPEC: GrantSpec = {
  ...SELF_SERVICE,
  "organization.view": "organization",
  "department.view": "organization",
};

export const ROLE_PRESET_SPECS: Record<TenantRole, GrantSpec> = {
  OWNER: OWNER_SPEC,
  HR: HR_SPEC,
  ACCOUNTANT: ACCOUNTANT_SPEC,
  MANAGER: MANAGER_SPEC,
  EMPLOYEE: EMPLOYEE_SPEC,
  INTERN: INTERN_SPEC,
};

export const ROLE_PRESETS: Record<TenantRole, PermissionGrants> =
  TENANT_ROLES.reduce(
    (acc, role) => {
      acc[role] = expandGrants(ROLE_PRESET_SPECS[role]);
      return acc;
    },
    {} as Record<TenantRole, PermissionGrants>,
  );

export function presetFor(role: TenantRole): PermissionGrants {
  return ROLE_PRESETS[role];
}
