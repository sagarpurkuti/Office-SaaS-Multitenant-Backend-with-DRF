"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/card";
import { employeeDisplayName } from "../../employees/scope";
import { useScopedEmployees } from "../../employees/use-employees";
import { employeeStatusTone } from "../../lib/status-tone";
import { humanizeEnum } from "../../lib/format";
import { ScopeBadge } from "../../rbac";
import { WidgetCard, WidgetEmpty } from "./widget-card";

/** Headcount the viewer is responsible for, broken down by employment status. */
export function TeamWidget() {
  const { employees, scope, isLoading, error } =
    useScopedEmployees("employee.view");

  const byStatus = useMemo(() => {
    const counts = new Map<string, number>();
    for (const employee of employees) {
      counts.set(employee.status, (counts.get(employee.status) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [employees]);

  return (
    <WidgetCard
      title="People"
      description="Employees you are responsible for."
      action={{ href: "/employees", label: "Directory" }}
      loading={isLoading}
      error={error}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl font-semibold text-slate-900">
          {employees.length}
        </span>
        <span className="text-sm text-slate-500">in scope</span>
        <ScopeBadge scope={scope} />
      </div>

      {byStatus.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {byStatus.map(([status, count]) => (
            <Badge key={status} tone={employeeStatusTone(status)}>
              {humanizeEnum(status)} · {count}
            </Badge>
          ))}
        </div>
      ) : (
        <WidgetEmpty>No employees are visible in your scope yet.</WidgetEmpty>
      )}

      <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
        {employees.slice(0, 4).map((employee) => (
          <li key={employee.id} className="flex justify-between gap-3">
            <span className="truncate">{employeeDisplayName(employee)}</span>
            <span className="shrink-0 text-xs text-slate-400">
              {humanizeEnum(employee.employment_type)}
            </span>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
