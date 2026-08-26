"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { tenantEmployeesApi } from "../api/employees";
import { tenantQueryKeys } from "../api/query-keys";
import { useTenantAuth } from "../auth/tenant-auth-provider";
import { useRbac, widestScope, type PermissionKey, type Scope } from "../rbac";
import type { Employee } from "../types";
import { applyEmployeeScope, employeeIdSet } from "./scope";

/** Raw directory as returned by the API, before any scope is applied. */
export function useEmployeeDirectory(enabled = true) {
  return useQuery({
    queryKey: tenantQueryKeys.employees.list(),
    queryFn: () => tenantEmployeesApi.list(),
    enabled,
  });
}

/**
 * The employee record linked to the signed-in login.
 *
 * `/api/auth/me/` does not include it, so it is matched out of the directory.
 * Centralised here so there is one place to switch over once the API exposes
 * the link directly.
 */
export function useCurrentEmployee(): {
  employee: Employee | null;
  isLoading: boolean;
} {
  const { user } = useTenantAuth();
  const { data, isLoading } = useEmployeeDirectory(Boolean(user));

  const employee = useMemo(() => {
    if (!user || !data) return null;
    return data.find((candidate) => candidate.user === user.id) ?? null;
  }, [data, user]);

  return { employee, isLoading };
}

export type ScopedEmployees = {
  employees: Employee[];
  visibleIds: Set<string>;
  scope: Scope | null;
  currentEmployee: Employee | null;
  isLoading: boolean;
  error: unknown;
};

/**
 * Employees the user is allowed to see for a given permission, already narrowed
 * to the scope attached to that grant.
 *
 * Several permissions can justify the same screen — payroll is readable through
 * `payroll.view` or, for an employee, `salary_statement.view` at `own`. Passing
 * a list resolves to the widest scope the user actually holds.
 */
export function useScopedEmployees(
  permission: PermissionKey | readonly PermissionKey[] = "employee.view",
): ScopedEmployees {
  const { scopeOf } = useRbac();
  const permissions: readonly PermissionKey[] =
    typeof permission === "string" ? [permission] : permission;

  const scope = permissions.reduce<Scope | null>((widest, key) => {
    const current = scopeOf(key);
    if (!current) return widest;
    return widest ? widestScope(widest, current) : current;
  }, null);
  const { data, isLoading, error } = useEmployeeDirectory(Boolean(scope));
  const { employee: currentEmployee } = useCurrentEmployee();

  const employees = useMemo(
    () => applyEmployeeScope(data ?? [], currentEmployee, scope),
    [data, currentEmployee, scope],
  );

  const visibleIds = useMemo(() => employeeIdSet(employees), [employees]);

  return {
    employees,
    visibleIds,
    scope,
    currentEmployee,
    isLoading,
    error,
  };
}

/** Lookup map for rendering employee names against foreign keys. */
export function useEmployeeLookup(employees: Employee[]) {
  return useMemo(() => {
    const map = new Map<string, Employee>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);
}
