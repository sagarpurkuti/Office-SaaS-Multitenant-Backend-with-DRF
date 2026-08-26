import { tenantBff } from "./client";
import { queryString, toList } from "./list";
import type { PayrollRun } from "../types";

export type PayrollFilters = {
  employee?: string;
  month?: number | string;
  year?: number | string;
};

export const tenantPayrollApi = {
  list: async (filters: PayrollFilters = {}): Promise<PayrollRun[]> => {
    const payload = await tenantBff.django<unknown>(
      `api/payroll/${queryString(filters)}`,
    );
    return toList<PayrollRun>(payload);
  },

  generate: (month: number, year: number) =>
    tenantBff.django<{ detail?: string }>("api/payroll/generate/", {
      method: "POST",
      body: { month, year },
    }),

  approve: (id: number) =>
    tenantBff.django<PayrollRun>(`api/payroll/${id}/approve/`, {
      method: "POST",
      body: {},
    }),

  lock: (id: number) =>
    tenantBff.django<PayrollRun>(`api/payroll/${id}/lock/`, {
      method: "POST",
      body: {},
    }),

  /** Server-rendered PDF; opened directly rather than fetched as JSON. */
  payslipUrl: (id: number) => `/api/tenant/proxy/api/payroll/${id}/payslip/`,
};
