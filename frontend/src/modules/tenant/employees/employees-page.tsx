"use client";

import { useMemo, useState } from "react";
import { Badge, ErrorBanner, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatDate, humanizeEnum } from "../lib/format";
import { employeeStatusTone } from "../lib/status-tone";
import { useOrgLookups } from "../organization/use-organization";
import { Can, RequirePermission, ScopeNotice, useRbac } from "../rbac";
import { EMPLOYEE_STATUSES } from "../types";
import { AddEmployeeDialog } from "./employee-form";
import { employeeDisplayName } from "./scope";
import { useScopedEmployees } from "./use-employees";

export function EmployeesPage() {
  return (
    <RequirePermission permission="employee.view">
      <EmployeeDirectory />
    </RequirePermission>
  );
}

function EmployeeDirectory() {
  const { scopeOf } = useRbac();
  const { employees, scope, isLoading, error } =
    useScopedEmployees("employee.view");
  const { departmentNames, designationNames } = useOrgLookups();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return employees.filter((employee) => {
      if (status && employee.status !== status) return false;
      if (!term) return true;
      return [
        employee.employee_id,
        employee.official_email,
        employeeDisplayName(employee),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [employees, search, status]);

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Directory of the people you are allowed to see."
        actions={
          <Can permission="employee.create">
            <Button onClick={() => setAddOpen(true)}>Add employee</Button>
          </Can>
        }
      />

      <Can permission="employee.create">
        <AddEmployeeDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          managers={employees}
        />
      </Can>

      <ScopeNotice scope={scopeOf("employee.view")} noun="employees" />

      {error ? <ErrorBanner message={(error as Error).message} /> : null}

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          className="max-w-xs"
          placeholder="Search by employee ID or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search employees"
        />
        <Select
          className="max-w-[12rem]"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {EMPLOYEE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {humanizeEnum(value)}
            </option>
          ))}
        </Select>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Employee</Th>
            <Th>Department</Th>
            <Th>Designation</Th>
            <Th>Employment</Th>
            <Th>Joined</Th>
            <Th align="right">Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading ? (
            <TableEmpty colSpan={6}>Loading employees…</TableEmpty>
          ) : filtered.length === 0 ? (
            <TableEmpty colSpan={6}>
              {scope === "own"
                ? "Your role only exposes your own record."
                : "No employees match this view."}
            </TableEmpty>
          ) : (
            filtered.map((employee) => (
              <Tr key={employee.id}>
                <Td>
                  <span className="font-medium text-slate-900">
                    {employeeDisplayName(employee)}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {[employee.employee_id, employee.official_email]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </Td>
                <Td>
                  {employee.department
                    ? (departmentNames.get(employee.department) ??
                      `#${employee.department}`)
                    : "—"}
                </Td>
                <Td>
                  {employee.designation
                    ? (designationNames.get(employee.designation) ??
                      `#${employee.designation}`)
                    : "—"}
                </Td>
                <Td>{humanizeEnum(employee.employment_type)}</Td>
                <Td>{formatDate(employee.joining_date)}</Td>
                <Td align="right">
                  <Badge tone={employeeStatusTone(employee.status)}>
                    {humanizeEnum(employee.status)}
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
