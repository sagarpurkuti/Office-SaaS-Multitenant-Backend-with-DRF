import type { ComponentType } from "react";
import type { PermissionKey, Scope } from "../rbac";
import { AccessWidget } from "./widgets/access-widget";
import { ApprovalsWidget } from "./widgets/approvals-widget";
import { MyDayWidget } from "./widgets/my-day-widget";
import { MyLeaveWidget } from "./widgets/my-leave-widget";
import { OrgPulseWidget } from "./widgets/org-pulse-widget";
import { PayrollWidget } from "./widgets/payroll-widget";
import { QuickActionsWidget } from "./widgets/quick-actions-widget";
import { TeamWidget } from "./widgets/team-widget";

export type WidgetSpan = "third" | "half" | "full";

export type DashboardWidget = {
  id: string;
  component: ComponentType;
  /** Shown when the user holds any of these; omit for always-on widgets. */
  anyOf?: readonly PermissionKey[];
  /** Minimum reach required, so org widgets stay out of a manager's view. */
  scope?: Scope;
  span: WidgetSpan;
};

/**
 * The dashboard is assembled from this list rather than branching on role.
 * A new widget needs one entry plus the permission that justifies it, which is
 * what keeps "CEO sees everything, intern sees their own day" from turning into
 * a pile of conditionals.
 */
export const DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    id: "org-pulse",
    component: OrgPulseWidget,
    anyOf: ["employee.view", "organization.view"],
    scope: "organization",
    span: "full",
  },
  {
    id: "my-day",
    component: MyDayWidget,
    anyOf: ["attendance.view"],
    span: "third",
  },
  {
    id: "my-leave",
    component: MyLeaveWidget,
    anyOf: ["leave.view", "leave.apply"],
    span: "third",
  },
  {
    id: "approvals",
    component: ApprovalsWidget,
    anyOf: ["leave.approve"],
    span: "third",
  },
  {
    id: "team",
    component: TeamWidget,
    anyOf: ["employee.view"],
    scope: "team",
    span: "third",
  },
  {
    id: "payroll",
    component: PayrollWidget,
    anyOf: ["payroll.view", "salary_statement.view"],
    span: "third",
  },
  {
    id: "quick-actions",
    component: QuickActionsWidget,
    span: "third",
  },
  {
    id: "access",
    component: AccessWidget,
    span: "third",
  },
];

export function visibleWidgets(
  canAny: (permissions: readonly PermissionKey[], scope?: Scope) => boolean,
): DashboardWidget[] {
  return DASHBOARD_WIDGETS.filter(
    (widget) => !widget.anyOf || canAny(widget.anyOf, widget.scope),
  );
}

export const WIDGET_SPAN_CLASS: Record<WidgetSpan, string> = {
  third: "lg:col-span-2",
  half: "lg:col-span-3",
  full: "lg:col-span-6",
};
