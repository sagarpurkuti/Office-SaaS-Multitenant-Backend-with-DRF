import { tenantBff } from "./client";
import { queryString, toList } from "./list";
import type { LeaveRequest, LeaveRequestInput, LeaveType } from "../types";

export type LeaveFilters = {
  status?: string;
  employee?: string;
};

export const tenantLeaveApi = {
  requests: async (filters: LeaveFilters = {}): Promise<LeaveRequest[]> => {
    const payload = await tenantBff.django<unknown>(
      `api/leave-requests/${queryString(filters)}`,
    );
    return toList<LeaveRequest>(payload);
  },

  types: async (): Promise<LeaveType[]> =>
    toList<LeaveType>(await tenantBff.django<unknown>("api/leave-types/")),

  apply: (body: LeaveRequestInput) =>
    tenantBff.django<LeaveRequest>("api/leave-requests/", {
      method: "POST",
      body,
    }),

  approve: (id: string, comment?: string) =>
    tenantBff.django<LeaveRequest>(`api/leave-requests/${id}/approve/`, {
      method: "POST",
      body: { comment: comment ?? "" },
    }),

  reject: (id: string, comment?: string) =>
    tenantBff.django<LeaveRequest>(`api/leave-requests/${id}/reject/`, {
      method: "POST",
      body: { comment: comment ?? "" },
    }),
};
