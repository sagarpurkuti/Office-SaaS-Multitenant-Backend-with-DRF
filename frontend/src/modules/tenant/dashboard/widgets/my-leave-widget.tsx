"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/card";
import { tenantLeaveApi } from "../../api/leave";
import { tenantQueryKeys } from "../../api/query-keys";
import { useCurrentEmployee } from "../../employees/use-employees";
import { formatDate } from "../../lib/format";
import { leaveStatusTone } from "../../lib/status-tone";
import { WidgetCard, WidgetEmpty, WidgetRow } from "./widget-card";

/** The signed-in user's own leave, regardless of what else their role can see. */
export function MyLeaveWidget() {
  const { employee } = useCurrentEmployee();

  const { data, isLoading, error } = useQuery({
    queryKey: tenantQueryKeys.leave.requests(),
    queryFn: () => tenantLeaveApi.requests(),
  });

  const mine = useMemo(() => {
    if (!employee) return [];
    return (data ?? [])
      .filter((request) => request.employee === employee.id)
      .sort((a, b) => b.applied_at.localeCompare(a.applied_at));
  }, [data, employee]);

  const pending = mine.filter((request) => request.status === "PENDING").length;
  const approved = mine.filter((request) => request.status === "APPROVED").length;

  return (
    <WidgetCard
      title="My leave"
      description="Requests you have submitted."
      action={{ href: "/leave", label: "Leave" }}
      loading={isLoading}
      error={error}
    >
      {employee ? (
        <>
          <dl>
            <WidgetRow label="Pending" value={pending} />
            <WidgetRow label="Approved this period" value={approved} />
          </dl>

          <div className="mt-3 space-y-2">
            {mine.slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="text-slate-600">
                  {formatDate(request.from_date)} – {formatDate(request.to_date)}
                </span>
                <Badge tone={leaveStatusTone(request.status)}>
                  {request.status}
                </Badge>
              </div>
            ))}
            {mine.length === 0 ? (
              <WidgetEmpty>You have not requested any leave yet.</WidgetEmpty>
            ) : null}
          </div>
        </>
      ) : (
        <WidgetEmpty>
          Your login is not linked to an employee record, so personal leave is
          unavailable.
        </WidgetEmpty>
      )}
    </WidgetCard>
  );
}
