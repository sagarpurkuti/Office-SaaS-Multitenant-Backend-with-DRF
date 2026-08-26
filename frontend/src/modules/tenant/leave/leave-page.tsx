"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Card, ErrorBanner, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableEmpty,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@/components/ui/table";
import { tenantLeaveApi } from "../api/leave";
import { tenantQueryKeys } from "../api/query-keys";
import { employeeDisplayName, filterByEmployeeScope } from "../employees/scope";
import {
  useCurrentEmployee,
  useEmployeeLookup,
  useScopedEmployees,
} from "../employees/use-employees";
import { daysBetween, formatDate, todayIso } from "../lib/format";
import { leaveStatusTone } from "../lib/status-tone";
import { Can, RequirePermission, ScopeNotice, useRbac } from "../rbac";
import type { Employee, LeaveRequest } from "../types";

export function LeavePage() {
  return (
    <RequirePermission anyOf={["leave.view", "leave.apply"]}>
      <LeaveContent />
    </RequirePermission>
  );
}

function LeaveContent() {
  const { can, scopeOf } = useRbac();
  const { employee } = useCurrentEmployee();

  const { employees, visibleIds } = useScopedEmployees("leave.view");
  const lookup = useEmployeeLookup(employees);

  const { data, isLoading, error } = useQuery({
    queryKey: tenantQueryKeys.leave.requests(),
    queryFn: () => tenantLeaveApi.requests(),
  });

  const requests = useMemo(() => data ?? [], [data]);

  const mine = useMemo(
    () =>
      employee
        ? requests
            .filter((request) => request.employee === employee.id)
            .sort((a, b) => b.applied_at.localeCompare(a.applied_at))
        : [],
    [requests, employee],
  );

  const teamRequests = useMemo(() => {
    const scoped = filterByEmployeeScope(requests, visibleIds);
    return scoped
      .filter((request) => !employee || request.employee !== employee.id)
      .sort((a, b) => b.applied_at.localeCompare(a.applied_at));
  }, [requests, visibleIds, employee]);

  return (
    <div>
      <PageHeader
        title="Leave"
        description="Requests, approvals and history."
      />

      {error ? <ErrorBanner message={(error as Error).message} /> : null}

      <Can permission="leave.apply">
        <ApplyForLeaveCard hasEmployeeRecord={Boolean(employee)} />
      </Can>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-slate-900">My requests</h2>
        <LeaveTable
          requests={mine}
          loading={isLoading}
          emptyMessage="You have not submitted any leave requests."
          showEmployee={false}
          lookup={lookup}
        />
      </section>

      {can("leave.view", "team") ? (
        <section>
          <h2 className="mb-1 font-semibold text-slate-900">
            {can("leave.approve") ? "Requests to review" : "Team requests"}
          </h2>
          <ScopeNotice scope={scopeOf("leave.view")} noun="requests" />
          <LeaveTable
            requests={teamRequests}
            loading={isLoading}
            emptyMessage="No requests from people in your scope."
            showEmployee
            lookup={lookup}
          />
        </section>
      ) : null}
    </div>
  );
}

function ApplyForLeaveCard({
  hasEmployeeRecord,
}: {
  hasEmployeeRecord: boolean;
}) {
  const queryClient = useQueryClient();
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [reason, setReason] = useState("");

  const { data: types } = useQuery({
    queryKey: tenantQueryKeys.leave.types,
    queryFn: () => tenantLeaveApi.types(),
  });

  const apply = useMutation({
    mutationFn: () =>
      tenantLeaveApi.apply({
        leave_type: Number(leaveType),
        from_date: fromDate,
        to_date: toDate,
        reason,
      }),
    onSuccess: () => {
      setReason("");
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.leave.all });
    },
  });

  const days = daysBetween(fromDate, toDate);
  const invalidRange = new Date(fromDate) > new Date(toDate);

  return (
    <Card className="mb-8">
      <h2 className="font-semibold">Apply for leave</h2>
      {!hasEmployeeRecord ? (
        <p className="mt-2 text-sm text-slate-500">
          Your login is not linked to an employee record, so leave cannot be
          submitted. Ask HR to link it.
        </p>
      ) : (
        <form
          className="mt-4 grid gap-4 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!invalidRange && leaveType) apply.mutate();
          }}
        >
          <div>
            <Label htmlFor="leave-type">Leave type</Label>
            <Select
              id="leave-type"
              value={leaveType}
              onChange={(event) => setLeaveType(event.target.value)}
              required
            >
              <option value="">Select…</option>
              {(types ?? [])
                .filter((type) => type.is_active)
                .map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="leave-from">From</Label>
            <Input
              id="leave-from"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="leave-to">To</Label>
            <Input
              id="leave-to"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <p className="text-sm text-slate-500">
              {invalidRange ? "Invalid range" : `${days} day${days > 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="md:col-span-4">
            <Label htmlFor="leave-reason">Reason</Label>
            <Textarea
              id="leave-reason"
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
            />
          </div>
          <div className="md:col-span-4">
            <Button type="submit" disabled={apply.isPending || invalidRange}>
              {apply.isPending ? "Submitting…" : "Submit request"}
            </Button>
            {apply.error ? (
              <FieldError
                message={
                  apply.error instanceof Error
                    ? apply.error.message
                    : "Could not submit the request."
                }
              />
            ) : null}
            {apply.isSuccess ? (
              <p className="mt-1 text-xs text-emerald-700">Request submitted.</p>
            ) : null}
          </div>
        </form>
      )}
    </Card>
  );
}

function LeaveTable({
  requests,
  loading,
  emptyMessage,
  showEmployee,
  lookup,
}: {
  requests: LeaveRequest[];
  loading: boolean;
  emptyMessage: string;
  showEmployee: boolean;
  lookup: Map<string, Employee>;
}) {
  const { can } = useRbac();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: tenantQueryKeys.leave.all });

  const approve = useMutation({
    mutationFn: (id: string) => tenantLeaveApi.approve(id),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: (id: string) => tenantLeaveApi.reject(id),
    onSuccess: invalidate,
  });

  const canApprove = can("leave.approve");
  const canReject = can("leave.reject");
  const showActions = showEmployee && (canApprove || canReject);
  const columns = (showEmployee ? 1 : 0) + 4 + (showActions ? 1 : 0);

  return (
    <Table>
      <Thead>
        <Tr>
          {showEmployee ? <Th>Employee</Th> : null}
          <Th>From</Th>
          <Th>To</Th>
          <Th>Reason</Th>
          <Th align={showActions ? "left" : "right"}>Status</Th>
          {showActions ? <Th align="right">Actions</Th> : null}
        </Tr>
      </Thead>
      <Tbody>
        {loading ? (
          <TableEmpty colSpan={columns}>Loading requests…</TableEmpty>
        ) : requests.length === 0 ? (
          <TableEmpty colSpan={columns}>{emptyMessage}</TableEmpty>
        ) : (
          requests.slice(0, 50).map((request) => (
            <Tr key={request.id}>
              {showEmployee ? (
                <Td className="font-medium text-slate-900">
                  {employeeDisplayName(lookup.get(request.employee))}
                </Td>
              ) : null}
              <Td>{formatDate(request.from_date)}</Td>
              <Td>{formatDate(request.to_date)}</Td>
              <Td className="max-w-xs truncate">{request.reason}</Td>
              <Td align={showActions ? "left" : "right"}>
                <Badge tone={leaveStatusTone(request.status)}>
                  {request.status}
                </Badge>
              </Td>
              {showActions ? (
                <Td align="right">
                  {request.status === "PENDING" ? (
                    <span className="inline-flex gap-2">
                      {canApprove ? (
                        <Button
                          className="px-2.5 py-1 text-xs"
                          onClick={() => approve.mutate(request.id)}
                          disabled={approve.isPending}
                        >
                          Approve
                        </Button>
                      ) : null}
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
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </Td>
              ) : null}
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
  );
}
