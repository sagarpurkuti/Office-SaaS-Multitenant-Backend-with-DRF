"use client";

import { useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { Card, PageHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TENANT_ROUTES } from "../config";
import { formatMonth } from "../lib/format";
import {
  RequirePermission,
  ScopeNotice,
  useRbac,
  type PermissionKey,
} from "../rbac";

type ReportCard = {
  title: string;
  description: string;
  href: string;
  permission: PermissionKey;
};

const REPORTS: ReportCard[] = [
  {
    title: "Employee report",
    description: "Headcount, employment type and status across your scope.",
    href: TENANT_ROUTES.employees,
    permission: "employee.view",
  },
  {
    title: "Attendance report",
    description: "Presence, lateness and worked hours by day.",
    href: TENANT_ROUTES.attendance,
    permission: "attendance.view",
  },
  {
    title: "Leave report",
    description: "Requests, approvals and pending balances.",
    href: TENANT_ROUTES.leave,
    permission: "leave.view",
  },
  {
    title: "Payroll report",
    description: "Gross, deductions and net payable per period.",
    href: TENANT_ROUTES.payroll,
    permission: "payroll.view",
  },
  {
    title: "Organization report",
    description: "Branch and department structure.",
    href: TENANT_ROUTES.organization,
    permission: "department.view",
  },
];

export function ReportsPage() {
  return (
    <RequirePermission permission="reports.view">
      <ReportsContent />
    </RequirePermission>
  );
}

function ReportsContent() {
  const { can, scopeOf } = useRbac();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const available = REPORTS.filter((report) => can(report.permission));

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Reporting is limited to the data your role can reach."
      />

      <ScopeNotice scope={scopeOf("reports.view")} noun="reporting data" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {available.map((report) => (
          <Link key={report.title} href={report.href} className="block">
            <Card className="h-full transition hover:border-indigo-200 hover:shadow">
              <h2 className="font-semibold text-slate-900">{report.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{report.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      {can("reports.export") ? (
        <Card className="mt-6">
          <h2 className="font-semibold">Export payroll</h2>
          <p className="mt-1 text-sm text-slate-500">
            Downloads the payroll register for a single period.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <Select
              className="w-40"
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              aria-label="Export month"
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {formatMonth(value, year).split(" ")[0]}
                </option>
              ))}
            </Select>
            <Select
              className="w-32"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              aria-label="Export year"
            >
              {[year + 1, year, year - 1, year - 2].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
            <a
              href={`/api/tenant/proxy/api/payroll/export/?month=${month}&year=${year}&format=csv`}
              className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </a>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
