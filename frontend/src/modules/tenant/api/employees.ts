import { tenantBff } from "./client";
import { queryString, toList } from "./list";
import type { Employee, EmployeeInput, TenantUser } from "../types";

export type EmployeeFilters = {
  status?: string;
  department?: number | string;
  branch?: number | string;
  search?: string;
};

export const tenantEmployeesApi = {
  list: async (filters: EmployeeFilters = {}): Promise<Employee[]> => {
    const payload = await tenantBff.django<unknown>(
      `api/employees/${queryString(filters)}`,
    );
    return toList<Employee>(payload);
  },

  detail: (id: string) => tenantBff.django<Employee>(`api/employees/${id}/`),

  create: (body: EmployeeInput) =>
    tenantBff.django<Employee>("api/employees/", {
      method: "POST",
      body,
    }),

  update: (id: string, body: Partial<Employee>) =>
    tenantBff.django<Employee>(`api/employees/${id}/`, {
      method: "PATCH",
      body,
    }),

  /** Tenant logins not yet attached to an employee. Owner/HR only. */
  linkableUsers: async (): Promise<TenantUser[]> =>
    toList<TenantUser>(
      await tenantBff.django<unknown>("api/employees/linkable-users/"),
    ),
};
