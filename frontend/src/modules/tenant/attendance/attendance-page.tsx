"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Card, ErrorBanner, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableEmpty,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@/components/ui/table";
import { tenantAttendanceApi } from "../api/attendance";
import { tenantQueryKeys } from "../api/query-keys";
import { employeeDisplayName, filterByEmployeeScope } from "../employees/scope";
import {
  useCurrentEmployee,
  useEmployeeLookup,
  useScopedEmployees,
} from "../employees/use-employees";
import { formatDate, formatMinutes, formatTime, humanizeEnum } from "../lib/format";
import { attendanceStatusTone } from "../lib/status-tone";
import { Can, RequirePermission, ScopeNotice, useRbac } from "../rbac";

export function AttendancePage() {
  return (
    <RequirePermission permission="attendance.view">
      <AttendanceContent />
    </RequirePermission>
  );
}

function AttendanceContent() {
  const { scopeOf } = useRbac();
  const [date, setDate] = useState("");

  const { employees, visibleIds, isLoading: employeesLoading } =
    useScopedEmployees("attendance.view");
  const lookup = useEmployeeLookup(employees);

  const { data, isLoading, error } = useQuery({
    queryKey: tenantQueryKeys.attendance.list({ date }),
    queryFn: () => tenantAttendanceApi.list(date ? { date } : {}),
  });

  const records = useMemo(() => {
    const scoped = filterByEmployeeScope(data ?? [], visibleIds);
    const byDate = date
      ? scoped.filter((record) => record.date === date)
      : scoped;
    return [...byDate].sort((a, b) => b.date.localeCompare(a.date));
  }, [data, visibleIds, date]);

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Daily attendance for the people in your scope."
      />

      <Can permission="attendance.mark">
        <SelfCheckCard />
      </Can>

      <ScopeNotice scope={scopeOf("attendance.view")} noun="attendance" />

      {error ? <ErrorBanner message={(error as Error).message} /> : null}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="attendance-date"
            className="mb-1.5 block text-xs font-medium text-slate-600"
          >
            Date
          </label>
          <Input
            id="attendance-date"
            type="date"
            className="max-w-[12rem]"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        {date ? (
          <Button variant="secondary" onClick={() => setDate("")}>
            Clear
          </Button>
        ) : null}
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Employee</Th>
            <Th>Date</Th>
            <Th>In</Th>
            <Th>Out</Th>
            <Th>Worked</Th>
            <Th align="right">Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading || employeesLoading ? (
            <TableEmpty colSpan={6}>Loading attendance…</TableEmpty>
          ) : records.length === 0 ? (
            <TableEmpty colSpan={6}>
              No attendance records in this view.
            </TableEmpty>
          ) : (
            records.slice(0, 100).map((record) => (
              <Tr key={record.id}>
                <Td className="font-medium text-slate-900">
                  {employeeDisplayName(lookup.get(record.employee))}
                </Td>
                <Td>{formatDate(record.date)}</Td>
                <Td>{formatTime(record.check_in)}</Td>
                <Td>{formatTime(record.check_out)}</Td>
                <Td>{formatMinutes(record.worked_minutes)}</Td>
                <Td align="right">
                  <Badge tone={attendanceStatusTone(record.status)}>
                    {humanizeEnum(record.status)}
                  </Badge>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}

function SelfCheckCard() {
  const queryClient = useQueryClient();
  const { employee } = useCurrentEmployee();

  const { data } = useQuery({
    queryKey: tenantQueryKeys.attendance.today,
    queryFn: () => tenantAttendanceApi.today(),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: tenantQueryKeys.attendance.all });

  const checkIn = useMutation({
    mutationFn: () => tenantAttendanceApi.checkIn(),
    onSuccess: invalidate,
  });
  const checkOut = useMutation({
    mutationFn: () => tenantAttendanceApi.checkOut(),
    onSuccess: invalidate,
  });

  const error = checkIn.error ?? checkOut.error;

  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">Today</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {employee
              ? `In ${formatTime(data?.check_in)} · Out ${formatTime(
                  data?.check_out,
                )} · ${formatMinutes(data?.worked_minutes)}`
              : "Your login is not linked to an employee record, so attendance cannot be recorded."}
          </p>
        </div>
        {employee ? (
          <div className="flex gap-2">
            <Button
              onClick={() => checkIn.mutate()}
              disabled={checkIn.isPending || Boolean(data?.check_in)}
            >
              Check in
            </Button>
            <Button
              variant="secondary"
              onClick={() => checkOut.mutate()}
              disabled={
                checkOut.isPending || !data?.check_in || Boolean(data?.check_out)
              }
            >
              Check out
            </Button>
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="mt-3 text-xs text-red-600">
          {error instanceof Error ? error.message : "Could not update attendance."}
        </p>
      ) : null}
    </Card>
  );
}
