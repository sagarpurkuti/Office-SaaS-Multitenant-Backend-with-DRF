import { tenantBff } from "./client";
import { orNullOn404, queryString, toList } from "./list";
import type { AttendanceRecord, CheckInResponse } from "../types";

export type AttendanceFilters = {
  employee?: string;
  date?: string;
  status?: string;
};

export const tenantAttendanceApi = {
  list: async (filters: AttendanceFilters = {}): Promise<AttendanceRecord[]> => {
    const payload = await tenantBff.django<unknown>(
      `api/attendance/${queryString(filters)}`,
    );
    return toList<AttendanceRecord>(payload);
  },

  /** Returns `null` when the signed-in user has no record for today yet. */
  today: () =>
    orNullOn404(tenantBff.django<AttendanceRecord>("api/attendance/today/")),

  checkIn: () =>
    tenantBff.django<CheckInResponse>("api/attendance/check_in/", {
      method: "POST",
      body: {},
    }),

  checkOut: () =>
    tenantBff.django<CheckInResponse>("api/attendance/check_out/", {
      method: "POST",
      body: {},
    }),

  update: (id: string, body: Partial<AttendanceRecord>) =>
    tenantBff.django<AttendanceRecord>(`api/attendance/${id}/`, {
      method: "PATCH",
      body,
    }),
};
