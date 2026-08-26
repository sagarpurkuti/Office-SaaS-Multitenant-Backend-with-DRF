import type { Scope } from "../rbac";
import type { Employee } from "../types";

/**
 * Applies a data scope to an employee list.
 *
 * The API does not scope querysets yet, so the workspace narrows what it shows
 * to match the user's grant. When the backend adds scope-aware filtering this
 * becomes a second, redundant pass rather than something to unwind.
 */
export function applyEmployeeScope(
  employees: Employee[],
  currentEmployee: Employee | null,
  scope: Scope | null,
): Employee[] {
  if (!scope) return [];
  if (scope === "organization") return employees;

  if (!currentEmployee) return [];

  switch (scope) {
    case "own":
      return employees.filter((e) => e.id === currentEmployee.id);
    case "team":
      return employees.filter(
        (e) =>
          e.id === currentEmployee.id ||
          e.reporting_manager === currentEmployee.id,
      );
    case "department":
      return currentEmployee.department == null
        ? employees.filter((e) => e.id === currentEmployee.id)
        : employees.filter((e) => e.department === currentEmployee.department);
    case "branch":
      return currentEmployee.branch == null
        ? employees.filter((e) => e.id === currentEmployee.id)
        : employees.filter((e) => e.branch === currentEmployee.branch);
    default:
      return [];
  }
}

export function employeeIdSet(employees: Employee[]): Set<string> {
  return new Set(employees.map((employee) => employee.id));
}

/** Filters any employee-owned record (attendance, leave, payroll) by scope. */
export function filterByEmployeeScope<T extends { employee: string }>(
  records: T[],
  visibleEmployeeIds: Set<string>,
): T[] {
  return records.filter((record) => visibleEmployeeIds.has(record.employee));
}

export function employeeDisplayName(
  employee: Employee | null | undefined,
): string {
  if (!employee) return "—";
  const name = employee.full_name?.trim() || fullNameOf(employee);
  return name || employee.employee_id || employee.official_email || employee.id;
}

function fullNameOf(employee: Employee): string {
  const profile = employee.profile;
  if (!profile) return "";
  return [profile.first_name, profile.middle_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
}
