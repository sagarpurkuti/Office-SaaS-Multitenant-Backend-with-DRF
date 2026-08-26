"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/card";
import { tenantPayrollApi } from "../../api/payroll";
import { tenantQueryKeys } from "../../api/query-keys";
import { filterByEmployeeScope } from "../../employees/scope";
import { useScopedEmployees } from "../../employees/use-employees";
import { formatAmount, formatMonth } from "../../lib/format";
import { payrollStatusTone } from "../../lib/status-tone";
import { WidgetCard, WidgetEmpty, WidgetRow } from "./widget-card";

/** Latest payroll activity within the viewer's scope. */
export function PayrollWidget() {
  const { visibleIds, isLoading: employeesLoading } = useScopedEmployees([
    "payroll.view",
    "salary_statement.view",
  ]);

  const { data, isLoading, error } = useQuery({
    queryKey: tenantQueryKeys.payroll.list(),
    queryFn: () => tenantPayrollApi.list(),
  });

  const runs = useMemo(() => {
    const scoped = filterByEmployeeScope(data ?? [], visibleIds);
    return [...scoped].sort(
      (a, b) => b.year - a.year || b.month - a.month,
    );
  }, [data, visibleIds]);

  const latest = runs[0];
  const drafts = runs.filter((run) => run.status === "DRAFT").length;
  const netTotal = runs
    .filter(
      (run) =>
        latest && run.year === latest.year && run.month === latest.month,
    )
    .reduce((sum, run) => sum + Number(run.net_salary || 0), 0);

  return (
    <WidgetCard
      title="Payroll"
      description="Most recent payroll period."
      action={{ href: "/payroll", label: "Payroll" }}
      loading={isLoading || employeesLoading}
      error={error}
    >
      {latest ? (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-900">
              {formatMonth(latest.month, latest.year)}
            </span>
            <Badge tone={payrollStatusTone(latest.status)}>
              {latest.status}
            </Badge>
          </div>
          <dl className="mt-3">
            <WidgetRow label="Payslips in period" value={runs.length} />
            <WidgetRow label="Net total" value={formatAmount(netTotal)} />
            <WidgetRow label="Drafts pending" value={drafts} />
          </dl>
        </div>
      ) : (
        <WidgetEmpty>No payroll has been generated yet.</WidgetEmpty>
      )}
    </WidgetCard>
  );
}
