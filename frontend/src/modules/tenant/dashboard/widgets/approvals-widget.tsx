"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { tenantLeaveApi } from "../../api/leave";
import { tenantQueryKeys } from "../../api/query-keys";
import {
  useEmployeeLookup,
  useScopedEmployees,
} from "../../employees/use-employees";
import { employeeDisplayName, filterByEmployeeScope } from "../../employees/scope";
import { formatDate } from "../../lib/format";
import { ScopeBadge, useRbac } from "../../rbac";
import { WidgetCard, WidgetEmpty } from "./widget-card";

/**
 * Pending leave awaiting this approver, narrowed to the scope on their
 * `leave.approve` grant — a manager sees their team, HR sees the organization.
 */
export function ApprovalsWidget() {
  const { can, scopeOf } = useRbac();
  const queryClient = useQueryClient();
  const approveScope = scopeOf("leave.approve");

  const { visibleIds, employees, isLoading: employeesLoading } =
    useScopedEmployees("leave.view");
  const lookup = useEmployeeLookup(employees);

  const { data, isLoading, error } = useQuery({
    queryKey: tenantQueryKeys.leave.requests({ status: "PENDING" }),
    queryFn: () => tenantLeaveApi.requests({ status: "PENDING" }),
  });

  const pending = useMemo(() => {
    const requests = (data ?? []).filter(
      (request) => request.status === "PENDING",
    );
    return filterByEmployeeScope(requests, visibleIds);
  }, [data, visibleIds]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: tenantQueryKeys.leave.all });
  };

  const approve = useMutation({
    mutationFn: (id: string) => tenantLeaveApi.approve(id),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: (id: string) => tenantLeaveApi.reject(id),
    onSuccess: invalidate,
  });

  const canReject = can("leave.reject");

  return (
    <WidgetCard
      title="Leave approvals"
      description="Requests waiting on you."
      action={{ href: "/leave", label: "Review all" }}
      loading={isLoading || employeesLoading}
      error={error}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl font-semibold text-slate-900">
          {pending.length}
        </span>
        <span className="text-sm text-slate-500">pending</span>
        <ScopeBadge scope={approveScope} />
      </div>

      <div className="space-y-2">
        {pending.slice(0, 4).map((request) => (
          <div
            key={request.id}
            className="rounded-md border border-slate-200 px-3 py-2"
          >
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-800">
                {employeeDisplayName(lookup.get(request.employee))}
              </span>
              <span className="text-xs text-slate-500">
                {formatDate(request.from_date)} – {formatDate(request.to_date)}
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                className="px-2.5 py-1 text-xs"
                onClick={() => approve.mutate(request.id)}
                disabled={approve.isPending}
              >
                Approve
              </Button>
              {canReject ? (
                <Button
                  variant="secondary"
                  className="px-2.5 py-1 text-xs"
                  onClick={() => reject.mutate(request.id)}
                  disabled={reject.isPending}
                >
                  Reject
                </Button>
              ) : null}
            </div>
          </div>
        ))}

        {pending.length === 0 ? (
          <WidgetEmpty>Nothing is waiting for your approval.</WidgetEmpty>
        ) : null}
      </div>
    </WidgetCard>
  );
}
