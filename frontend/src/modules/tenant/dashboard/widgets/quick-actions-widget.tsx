"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TENANT_ROUTES } from "../../config";
import { useRbac, type PermissionKey, type Scope } from "../../rbac";
import { WidgetCard, WidgetEmpty } from "./widget-card";

type QuickAction = {
  href: string;
  label: string;
  hint: string;
  permission: PermissionKey;
  scope?: Scope;
};

const ACTIONS: QuickAction[] = [
  {
    href: TENANT_ROUTES.leave,
    label: "Apply for leave",
    hint: "Submit a new request",
    permission: "leave.apply",
  },
  {
    href: TENANT_ROUTES.attendance,
    label: "Review attendance",
    hint: "Corrections and appeals",
    permission: "attendance.approve",
  },
  {
    href: TENANT_ROUTES.employees,
    label: "Add an employee",
    hint: "Onboard a new joiner",
    permission: "employee.create",
  },
  {
    href: TENANT_ROUTES.payroll,
    label: "Run payroll",
    hint: "Generate this period",
    permission: "payroll.process",
  },
  {
    href: TENANT_ROUTES.organization,
    label: "Manage structure",
    hint: "Branches and departments",
    permission: "department.update",
  },
  {
    href: TENANT_ROUTES.reports,
    label: "Export a report",
    hint: "Download organizational data",
    permission: "reports.export",
  },
];

export function QuickActionsWidget() {
  const { can } = useRbac();
  const actions = ACTIONS.filter((action) =>
    can(action.permission, action.scope),
  );

  return (
    <WidgetCard title="Quick actions" description="Shortcuts for your role.">
      {actions.length === 0 ? (
        <WidgetEmpty>No actions are available for your role.</WidgetEmpty>
      ) : (
        <ul className="space-y-1">
          {actions.slice(0, 5).map((action) => (
            <li key={action.label}>
              <Link
                href={action.href}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-slate-50"
              >
                <span>
                  <span className="font-medium text-slate-800">
                    {action.label}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {action.hint}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
