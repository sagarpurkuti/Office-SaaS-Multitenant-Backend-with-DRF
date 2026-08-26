"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Badge, Card, ErrorBanner, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableEmpty,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@/components/ui/table";
import { tenantPayrollApi } from "../api/payroll";
import { tenantQueryKeys } from "../api/query-keys";
import { employeeDisplayName, filterByEmployeeScope } from "../employees/scope";
import {
  useEmployeeLookup,
  useScopedEmployees,
} from "../employees/use-employees";
import { formatAmount, formatMonth } from "../lib/format";
import { payrollStatusTone } from "../lib/status-tone";
import { Can, RequirePermission, ScopeNotice, useRbac } from "../rbac";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export function PayrollPage() {
  return (
    <RequirePermission
      anyOf={["payroll.view", "salary.view", "salary_statement.view"]}
    >
      <PayrollContent />
    </RequirePermission>
  );
}

function PayrollContent() {
  const { can, scopeOf } = useRbac();
  const queryClient = useQueryClient();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { employees, visibleIds, isLoading: employeesLoading } =
    useScopedEmployees(["payroll.view", "salary_statement.view"]);
  const lookup = useEmployeeLookup(employees);

  const { data, isLoading, error } = useQuery({
    queryKey: tenantQueryKeys.payroll.list({ month, year }),
    queryFn: () => tenantPayrollApi.list({ month, year }),
  });

  const runs = useMemo(() => {
    const scoped = filterByEmployeeScope(data ?? [], visibleIds);
    return scoped.filter((run) => run.month === month && run.year === year);
  }, [data, visibleIds, month, year]);

  const totals = useMemo(
    () =>
      runs.reduce(
        (acc, run) => ({
          gross: acc.gross + Number(run.gross_salary || 0),
          net: acc.net + Number(run.net_salary || 0),
          tax: acc.tax + Number(run.tax || 0),
        }),
        { gross: 0, net: 0, tax: 0 },
      ),
    [runs],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: tenantQueryKeys.payroll.all });

  const generate = useMutation({
    mutationFn: () => tenantPayrollApi.generate(month, year),
    onSuccess: invalidate,
  });
  const approve = useMutation({
    mutationFn: (id: number) => tenantPayrollApi.approve(id),
    onSuccess: invalidate,
  });
  const lock = useMutation({
    mutationFn: (id: number) => tenantPayrollApi.lock(id),
    onSuccess: invalidate,
  });

  const canApprove = can("payroll.approve");
  const canDownload = can("salary_statement.download");
  const showActions = canApprove || canDownload;
  const mutationError = generate.error ?? approve.error ?? lock.error;

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Payroll runs and salary statements for your scope."
        actions={
          <Can permission="reports.export">
            <a
              href={`/api/tenant/proxy/api/payroll/export/?month=${month}&year=${year}&format=csv`}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          </Can>
        }
      />

      <ScopeNotice scope={scopeOf("payroll.view")} noun="payroll" />

      {error ? <ErrorBanner message={(error as Error).message} /> : null}
      {mutationError ? (
        <ErrorBanner
          message={
            mutationError instanceof Error
              ? mutationError.message
              : "Payroll action failed."
          }
        />
      ) : null}

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="payroll-month"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Month
            </label>
            <Select
              id="payroll-month"
              className="w-40"
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
            >
              {MONTHS.map((value) => (
                <option key={value} value={value}>
                  {formatMonth(value, year).split(" ")[0]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label
              htmlFor="payroll-year"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Year
            </label>
            <Select
              id="payroll-year"
              className="w-32"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {[year + 1, year, year - 1, year - 2].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </div>
          <Can permission="payroll.process">
            <Button
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
            >
              {generate.isPending ? "Generating…" : "Generate payroll"}
            </Button>
          </Can>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Payslips"
          value={runs.length}
          hint={formatMonth(month, year)}
          loading={isLoading}
        />
        <StatCard
          label="Gross"
          value={formatAmount(totals.gross)}
          loading={isLoading}
        />
        <StatCard
          label="Net payable"
          value={formatAmount(totals.net)}
          hint={`Tax ${formatAmount(totals.tax)}`}
          loading={isLoading}
        />
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Employee</Th>
            <Th>Period</Th>
            <Th align="right">Gross</Th>
            <Th align="right">Deductions</Th>
            <Th align="right">Net</Th>
            <Th>Status</Th>
            {showActions ? <Th align="right">Actions</Th> : null}
          </Tr>
        </Thead>
        <Tbody>
          {isLoading || employeesLoading ? (
            <TableEmpty colSpan={showActions ? 7 : 6}>
              Loading payroll…
            </TableEmpty>
          ) : runs.length === 0 ? (
            <TableEmpty colSpan={showActions ? 7 : 6}>
              No payroll for {formatMonth(month, year)} in your scope.
            </TableEmpty>
          ) : (
            runs.map((run) => (
              <Tr key={run.id}>
                <Td className="font-medium text-slate-900">
                  {employeeDisplayName(lookup.get(run.employee))}
                </Td>
                <Td>{formatMonth(run.month, run.year)}</Td>
                <Td align="right">{formatAmount(run.gross_salary)}</Td>
                <Td align="right">{formatAmount(run.total_deduction)}</Td>
                <Td align="right" className="font-medium">
                  {formatAmount(run.net_salary)}
                </Td>
                <Td>
                  <Badge tone={payrollStatusTone(run.status)}>{run.status}</Badge>
                </Td>
                {showActions ? (
                  <Td align="right">
                    <span className="inline-flex gap-2">
                      {canDownload ? (
                        <a
                          href={tenantPayrollApi.payslipUrl(run.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-indigo-700 hover:underline"
                        >
                          Payslip
                        </a>
                      ) : null}
                      {canApprove && run.status === "DRAFT" ? (
                        <button
                          type="button"
                          onClick={() => approve.mutate(run.id)}
                          className="text-xs font-medium text-teal-700 hover:underline"
                        >
                          Approve
                        </button>
                      ) : null}
                      {canApprove && run.status === "APPROVED" ? (
                        <button
                          type="button"
                          onClick={() => lock.mutate(run.id)}
                          className="text-xs font-medium text-slate-600 hover:underline"
                        >
                          Lock
                        </button>
                      ) : null}
                    </span>
                  </Td>
                ) : null}
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}
