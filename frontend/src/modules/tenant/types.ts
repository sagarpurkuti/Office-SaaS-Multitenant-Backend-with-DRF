import type { TenantRole } from "./config";

/**
 * Shape returned by Django `accounts.UserSerializer`.
 *
 * `permissions` is not sent today; when the API starts returning a resolved
 * permission set it is picked up automatically (see `rbac/resolve.ts`) and
 * takes precedence over the role preset.
 */
export type TenantUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: TenantRole | "SUPER_ADMIN";
  is_active: boolean;
  tenant: number | null;
  created_at: string;
  updated_at: string;
  permissions?: string[] | Record<string, string> | null;
  /** Employee record linked to this login, when one exists. */
  employee?: EmployeeRef | null;
};

export type EmployeeRef = {
  id: string;
  employee_id: string;
  department: number | null;
  branch: number | null;
  designation: number | null;
  reporting_manager: string | null;
};

export type TenantSession = {
  user: TenantUser;
  tenantHost: string;
};

export type TenantOrganization = {
  id: number;
  name: string;
  short_name: string;
  phone: string;
  email: string | null;
  timezone: string;
  currency: string;
  language: string;
  is_active: boolean;
};

export type TenantCompanySetting = {
  id: number;
  timezone: string;
  currency: string;
  language: string;
  attendance_method: string;
};

export type WorkspaceDashboard = {
  tenant_name: string;
  schema_name: string;
  on_trial: boolean | null;
  organization: TenantOrganization | null;
  settings: TenantCompanySetting | null;
  counts: {
    employees: number;
    members: number;
    branches: number;
    departments: number;
  };
};

export type TenantInfo = {
  id: number | null;
  schema_name: string;
  name: string;
  on_trial: boolean | null;
  paid_until: string | null;
  created_on: string | null;
};

/* ---------------------------------------------------------------- structure */

export type Branch = {
  id: number;
  organization: number;
  name: string;
  code: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_head_office: boolean;
  is_active: boolean;
};

export type Department = {
  id: number;
  organization: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
};

export type Designation = {
  id: number;
  organization: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
};

/* ---------------------------------------------------------------- employees */

export const EMPLOYEE_STATUSES = [
  "ACTIVE",
  "ON_LEAVE",
  "SUSPENDED",
  "TRANSFERRED",
  "RESIGNED",
  "RETIRED",
  "TERMINATED",
] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export type EmploymentType =
  | "PERMANENT"
  | "CONTRACT"
  | "INTERN"
  | "PART_TIME"
  | "TEMPORARY"
  | "CONSULTANT";

export type Employee = {
  id: string;
  organization: number;
  employee_id: string;
  /** Resolved from the profile by the API; empty when no profile exists. */
  full_name: string;
  user: string | null;
  branch: number | null;
  department: number | null;
  designation: number | null;
  employment_type: EmploymentType;
  joining_date: string;
  probation_end: string | null;
  status: EmployeeStatus;
  official_email: string | null;
  official_phone: string | null;
  reporting_manager: string | null;
  photo: string | null;
  created_at: string;
  updated_at: string;
  profile?: EmployeeProfile | null;
  documents?: EmployeeDocument[];
};

export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof GENDERS)[number];

export const MARITAL_STATUSES = [
  "SINGLE",
  "MARRIED",
  "DIVORCED",
  "WIDOWED",
] as const;
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type EmployeeProfile = {
  id: number;
  employee: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  gender: Gender;
  dob: string;
  blood_group: string | null;
  marital_status: MaritalStatus;
  nationality: string;
  citizenship_number: string | null;
  pan_number: string | null;
  passport_number: string | null;
};

/** Personal details written alongside a new employee. */
export type EmployeeProfileInput = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: Gender;
  dob: string;
  blood_group?: string;
  marital_status?: MaritalStatus;
};

/** Login provisioned with a new employee, instead of linking an existing one. */
export type EmployeeAccountInput = {
  email: string;
  password: string;
  role: TenantRole;
};

export type EmployeeInput = {
  employee_id: string;
  joining_date: string;
  employment_type: EmploymentType;
  status: EmployeeStatus;
  official_email?: string | null;
  official_phone?: string | null;
  branch?: number | null;
  department?: number | null;
  designation?: number | null;
  reporting_manager?: string | null;
  probation_end?: string | null;
  profile: EmployeeProfileInput;
  /** Mutually exclusive: link an existing login or create one. */
  user?: string | null;
  account?: EmployeeAccountInput;
};

export type EmployeeDocument = {
  id: number;
  employee: string;
  title?: string;
  document_type?: string;
  file?: string | null;
  issued_date?: string | null;
  expiry_date?: string | null;
};

/* --------------------------------------------------------------- attendance */

export const ATTENDANCE_STATUSES = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "HALF_DAY",
  "LEAVE",
  "HOLIDAY",
  "WEEKEND",
  "WORK_FROM_HOME",
  "ON_DUTY",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export type AttendanceRecord = {
  id: string;
  employee: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  worked_minutes: number;
  late_minutes: number;
  early_leave_minutes: number;
  overtime_minutes: number;
  status: AttendanceStatus;
  remarks: string | null;
};

export type CheckInResponse = {
  message: string;
  attendance: AttendanceRecord;
};

/* -------------------------------------------------------------------- leave */

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type LeaveType = {
  id: number;
  organization: number;
  name: string;
  days_per_year: number;
  requires_approval: boolean;
  carry_forward: boolean;
  encashable: boolean;
  is_active: boolean;
};

export type LeaveRequest = {
  id: string;
  employee: string;
  leave_type: number;
  from_date: string;
  to_date: string;
  reason: string;
  attachment: string | null;
  status: LeaveStatus;
  applied_at: string;
  updated_at: string;
};

export type LeaveRequestInput = {
  leave_type: number;
  from_date: string;
  to_date: string;
  reason: string;
};

/* ------------------------------------------------------------------ payroll */

export type PayrollStatus = "DRAFT" | "APPROVED" | "LOCKED" | "PAID";

export type PayrollRun = {
  id: number;
  employee: string;
  year: number;
  month: number;
  gross_salary: string;
  total_allowance: string;
  total_deduction: string;
  tax: string;
  net_salary: string;
  status: PayrollStatus;
  generated_at: string;
};
