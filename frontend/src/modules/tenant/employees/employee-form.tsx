"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fieldErrors } from "@/shared/api/errors";
import { tenantEmployeesApi } from "../api/employees";
import { orNullOnForbidden } from "../api/list";
import { tenantQueryKeys } from "../api/query-keys";
import {
  ASSIGNABLE_TENANT_ROLES,
  TENANT_ROLE_META,
  type TenantRole,
} from "../config";
import { humanizeEnum, todayIso } from "../lib/format";
import { useOrgLookups } from "../organization/use-organization";
import {
  BLOOD_GROUPS,
  EMPLOYEE_STATUSES,
  GENDERS,
  MARITAL_STATUSES,
  type Employee,
  type EmployeeInput,
  type EmployeeStatus,
  type EmploymentType,
  type Gender,
  type MaritalStatus,
} from "../types";
import { employeeDisplayName } from "./scope";

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "PERMANENT",
  "CONTRACT",
  "INTERN",
  "PART_TIME",
  "TEMPORARY",
  "CONSULTANT",
];

/** How the new employee gets into the system. */
type AccessMode = "none" | "link" | "create";

type FormState = {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: Gender;
  dob: string;
  marital_status: MaritalStatus;
  blood_group: string;
  employee_id: string;
  joining_date: string;
  probation_end: string;
  employment_type: EmploymentType;
  status: EmployeeStatus;
  official_email: string;
  official_phone: string;
  branch: string;
  department: string;
  designation: string;
  reporting_manager: string;
  linkedUser: string;
  accountEmail: string;
  accountPassword: string;
  accountRole: TenantRole;
};

const EMPTY: FormState = {
  first_name: "",
  middle_name: "",
  last_name: "",
  gender: "MALE",
  dob: "",
  marital_status: "SINGLE",
  blood_group: "",
  employee_id: "",
  joining_date: todayIso(),
  probation_end: "",
  employment_type: "PERMANENT",
  status: "ACTIVE",
  official_email: "",
  official_phone: "",
  branch: "",
  department: "",
  designation: "",
  reporting_manager: "",
  linkedUser: "",
  accountEmail: "",
  accountPassword: "",
  accountRole: "EMPLOYEE",
};

const optionalNumber = (value: string) => (value ? Number(value) : null);
const optionalText = (value: string) => (value.trim() ? value.trim() : null);

export function AddEmployeeDialog({
  open,
  onClose,
  managers,
}: {
  open: boolean;
  onClose: () => void;
  /** Existing employees offered as reporting managers. */
  managers: Employee[];
}) {
  const queryClient = useQueryClient();
  const { branches, departments, designations } = useOrgLookups();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [access, setAccess] = useState<AccessMode>("create");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const { data: linkableUsers } = useQuery({
    queryKey: tenantQueryKeys.employees.linkableUsers,
    queryFn: async () =>
      (await orNullOnForbidden(tenantEmployeesApi.linkableUsers())) ?? [],
    enabled: open,
  });

  const create = useMutation({
    mutationFn: () => tenantEmployeesApi.create(buildPayload(form, access)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.employees.all });
      setForm(EMPTY);
      onClose();
    },
  });

  const errors = fieldErrors(create.error);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add employee"
      description="Personal details, where they sit in the organization, and how they sign in."
    >
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <Section title="Personal">
          <Field label="First name" error={errors["profile.first_name"]}>
            <Input
              value={form.first_name}
              onChange={(event) => set("first_name", event.target.value)}
              required
            />
          </Field>
          <Field label="Middle name">
            <Input
              value={form.middle_name}
              onChange={(event) => set("middle_name", event.target.value)}
            />
          </Field>
          <Field label="Last name" error={errors["profile.last_name"]}>
            <Input
              value={form.last_name}
              onChange={(event) => set("last_name", event.target.value)}
              required
            />
          </Field>
          <Field label="Gender" error={errors["profile.gender"]}>
            <Select
              value={form.gender}
              onChange={(event) => set("gender", event.target.value as Gender)}
            >
              {GENDERS.map((value) => (
                <option key={value} value={value}>
                  {humanizeEnum(value)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date of birth" error={errors["profile.dob"]}>
            <Input
              type="date"
              value={form.dob}
              onChange={(event) => set("dob", event.target.value)}
              required
            />
          </Field>
          <Field label="Marital status">
            <Select
              value={form.marital_status}
              onChange={(event) =>
                set("marital_status", event.target.value as MaritalStatus)
              }
            >
              {MARITAL_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {humanizeEnum(value)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Blood group">
            <Select
              value={form.blood_group}
              onChange={(event) => set("blood_group", event.target.value)}
            >
              <option value="">Not recorded</option>
              {BLOOD_GROUPS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
        </Section>

        <Section title="Employment">
          <Field label="Employee ID" error={errors.employee_id}>
            <Input
              value={form.employee_id}
              onChange={(event) => set("employee_id", event.target.value)}
              placeholder="EMP-001"
              required
            />
          </Field>
          <Field label="Joining date" error={errors.joining_date}>
            <Input
              type="date"
              value={form.joining_date}
              onChange={(event) => set("joining_date", event.target.value)}
              required
            />
          </Field>
          <Field label="Probation ends">
            <Input
              type="date"
              value={form.probation_end}
              onChange={(event) => set("probation_end", event.target.value)}
            />
          </Field>
          <Field label="Employment type">
            <Select
              value={form.employment_type}
              onChange={(event) =>
                set("employment_type", event.target.value as EmploymentType)
              }
            >
              {EMPLOYMENT_TYPES.map((value) => (
                <option key={value} value={value}>
                  {humanizeEnum(value)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(event) =>
                set("status", event.target.value as EmployeeStatus)
              }
            >
              {EMPLOYEE_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {humanizeEnum(value)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Branch">
            <Select
              value={form.branch}
              onChange={(event) => set("branch", event.target.value)}
            >
              <option value="">Unassigned</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Department">
            <Select
              value={form.department}
              onChange={(event) => set("department", event.target.value)}
            >
              <option value="">Unassigned</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Designation">
            <Select
              value={form.designation}
              onChange={(event) => set("designation", event.target.value)}
            >
              <option value="">Unassigned</option>
              {designations.map((designation) => (
                <option key={designation.id} value={designation.id}>
                  {designation.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Reporting manager">
            <Select
              value={form.reporting_manager}
              onChange={(event) => set("reporting_manager", event.target.value)}
            >
              <option value="">None</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {employeeDisplayName(manager)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Official email" error={errors.official_email}>
            <Input
              type="email"
              value={form.official_email}
              onChange={(event) => set("official_email", event.target.value)}
            />
          </Field>
          <Field label="Official phone">
            <Input
              value={form.official_phone}
              onChange={(event) => set("official_phone", event.target.value)}
            />
          </Field>
        </Section>

        <Section title="Workspace access" columns={1}>
          <div className="flex flex-wrap gap-4 text-sm">
            <AccessChoice
              value="create"
              current={access}
              onChange={setAccess}
              label="Create a login"
            />
            <AccessChoice
              value="link"
              current={access}
              onChange={setAccess}
              label="Link an existing account"
            />
            <AccessChoice
              value="none"
              current={access}
              onChange={setAccess}
              label="No login for now"
            />
          </div>

          {access === "create" ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Login email" error={errors["account.email"]}>
                <Input
                  type="email"
                  value={form.accountEmail}
                  onChange={(event) => set("accountEmail", event.target.value)}
                  required
                />
              </Field>
              <Field
                label="Temporary password"
                error={errors["account.password"]}
              >
                <Input
                  type="password"
                  value={form.accountPassword}
                  onChange={(event) =>
                    set("accountPassword", event.target.value)
                  }
                  required
                  minLength={8}
                />
              </Field>
              <Field label="Role" error={errors["account.role"]}>
                <Select
                  value={form.accountRole}
                  onChange={(event) =>
                    set("accountRole", event.target.value as TenantRole)
                  }
                >
                  {ASSIGNABLE_TENANT_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {TENANT_ROLE_META[role].label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          ) : null}

          {access === "link" ? (
            <Field label="Account" error={errors.user}>
              <Select
                value={form.linkedUser}
                onChange={(event) => set("linkedUser", event.target.value)}
                required
              >
                <option value="">Select an account…</option>
                {(linkableUsers ?? []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name || user.last_name
                      ? `${user.first_name} ${user.last_name} · ${user.email}`
                      : user.email}
                  </option>
                ))}
              </Select>
              {(linkableUsers ?? []).length === 0 ? (
                <p className="mt-1 text-xs text-slate-500">
                  Every active account is already linked to an employee.
                </p>
              ) : null}
            </Field>
          ) : null}

          {access === "none" ? (
            <p className="text-sm text-slate-500">
              The record is created without a login. Attendance, leave and
              payslips stay unavailable until an account is linked.
            </p>
          ) : null}
        </Section>

        {create.isError ? (
          <p className="text-sm text-red-600">
            {errors.detail ??
              errors.non_field_errors ??
              errors.profile ??
              "Check the highlighted fields and try again."}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Create employee"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function buildPayload(form: FormState, access: AccessMode): EmployeeInput {
  const payload: EmployeeInput = {
    employee_id: form.employee_id.trim(),
    joining_date: form.joining_date,
    employment_type: form.employment_type,
    status: form.status,
    probation_end: form.probation_end || null,
    official_email: optionalText(form.official_email),
    official_phone: optionalText(form.official_phone),
    branch: optionalNumber(form.branch),
    department: optionalNumber(form.department),
    designation: optionalNumber(form.designation),
    reporting_manager: form.reporting_manager || null,
    profile: {
      first_name: form.first_name.trim(),
      middle_name: form.middle_name.trim() || undefined,
      last_name: form.last_name.trim(),
      gender: form.gender,
      dob: form.dob,
      marital_status: form.marital_status,
      blood_group: form.blood_group || undefined,
    },
  };

  if (access === "link" && form.linkedUser) {
    payload.user = form.linkedUser;
  }
  if (access === "create") {
    payload.account = {
      email: form.accountEmail.trim(),
      password: form.accountPassword,
      role: form.accountRole,
    };
  }
  return payload;
}

function Section({
  title,
  children,
  columns = 3,
}: {
  title: string;
  children: React.ReactNode;
  columns?: 1 | 3;
}) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      <div
        className={
          columns === 1 ? "space-y-4" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </span>
        {children}
      </label>
      <FieldError message={error} />
    </div>
  );
}

function AccessChoice({
  value,
  current,
  onChange,
  label,
}: {
  value: AccessMode;
  current: AccessMode;
  onChange: (mode: AccessMode) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-slate-700">
      <input
        type="radio"
        name="employee-access"
        className="accent-teal-700"
        checked={current === value}
        onChange={() => onChange(value)}
      />
      {label}
    </label>
  );
}
