"use client";

import { Badge, Card, PageHeader } from "@/components/ui/card";
import { useTenantAuth } from "../auth/tenant-auth-provider";
import { displayName } from "../auth/roles";
import { useCurrentEmployee } from "../employees/use-employees";
import { formatDate, humanizeEnum } from "../lib/format";
import { employeeStatusTone } from "../lib/status-tone";
import { useOrgLookups } from "../organization/use-organization";
import {
  RequirePermission,
  SCOPE_LABELS,
  grantedPermissions,
  useRbac,
} from "../rbac";

export function ProfilePage() {
  return (
    <RequirePermission permission="profile.view">
      <ProfileContent />
    </RequirePermission>
  );
}

function ProfileContent() {
  const { user, tenantHost } = useTenantAuth();
  const { employee, isLoading } = useCurrentEmployee();
  const { departmentNames, designationNames, branchNames } = useOrgLookups();
  const { roleLabel, grants, source } = useRbac();

  if (!user) return null;

  const permissionCount = grantedPermissions(grants).length;

  return (
    <div>
      <PageHeader
        title={displayName(user)}
        description={`${user.email} · ${tenantHost ?? "tenant workspace"}`}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Email" value={user.email} />
            <Row label="Phone" value={user.phone || "—"} />
            <Row label="Role" value={roleLabel} />
            <Row
              label="Status"
              value={
                <Badge tone={user.is_active ? "green" : "slate"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              }
            />
            <Row label="Member since" value={formatDate(user.created_at)} />
          </dl>
        </Card>

        <Card>
          <h2 className="font-semibold">Employment</h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading…</p>
          ) : employee ? (
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Employee ID" value={employee.employee_id} />
              <Row
                label="Department"
                value={
                  employee.department
                    ? (departmentNames.get(employee.department) ??
                      `#${employee.department}`)
                    : "—"
                }
              />
              <Row
                label="Designation"
                value={
                  employee.designation
                    ? (designationNames.get(employee.designation) ??
                      `#${employee.designation}`)
                    : "—"
                }
              />
              <Row
                label="Branch"
                value={
                  employee.branch
                    ? (branchNames.get(employee.branch) ?? `#${employee.branch}`)
                    : "—"
                }
              />
              <Row
                label="Employment type"
                value={humanizeEnum(employee.employment_type)}
              />
              <Row label="Joined" value={formatDate(employee.joining_date)} />
              <Row
                label="Status"
                value={
                  <Badge tone={employeeStatusTone(employee.status)}>
                    {humanizeEnum(employee.status)}
                  </Badge>
                }
              />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              This login is not linked to an employee record. Self-service
              attendance, leave and payslips stay unavailable until HR links it.
            </p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Access</h2>
          <p className="mt-1 text-sm text-slate-500">
            {permissionCount} permissions, resolved from{" "}
            {source === "server" ? "your tenant configuration" : "the role default"}.
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <ScopeRow label="Employees" scope={grants["employee.view"]} />
            <ScopeRow label="Attendance" scope={grants["attendance.view"]} />
            <ScopeRow label="Leave" scope={grants["leave.view"]} />
            <ScopeRow label="Payroll" scope={grants["payroll.view"]} />
            <ScopeRow label="Salary" scope={grants["salary.view"]} />
            <ScopeRow label="Reports" scope={grants["reports.view"]} />
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function ScopeRow({
  label,
  scope,
}: {
  label: string;
  scope: keyof typeof SCOPE_LABELS | undefined;
}) {
  return (
    <div className="rounded-md border border-slate-200 px-3 py-2">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">
        {scope ? SCOPE_LABELS[scope] : "No access"}
      </dd>
    </div>
  );
}
