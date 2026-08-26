/**
 * Canonical permission catalogue for the tenant HRMS.
 *
 * A permission is always `<resource>.<action>`. What a permission *reaches* is
 * expressed separately as a scope (see `scopes.ts`), so `attendance.view` granted
 * at `team` and at `organization` is the same capability over different data.
 *
 * This catalogue is the single source of truth: role presets, the navigation
 * registry, dashboard widgets and the role admin screen are all derived from it.
 */

export const PERMISSION_CATALOG = {
  organization: {
    label: "Organization",
    description: "Company profile, settings and structure.",
    actions: {
      view: "View organization",
      update: "Update organization",
    },
  },
  branch: {
    label: "Branches",
    description: "Offices and locations.",
    actions: {
      view: "View branches",
      create: "Create branches",
      update: "Update branches",
      delete: "Delete branches",
    },
  },
  department: {
    label: "Departments",
    description: "Departments inside the organization.",
    actions: {
      view: "View departments",
      create: "Create departments",
      update: "Update departments",
      delete: "Delete departments",
    },
  },
  designation: {
    label: "Designations",
    description: "Job titles and grades.",
    actions: {
      view: "View designations",
      create: "Create designations",
      update: "Update designations",
      delete: "Delete designations",
    },
  },
  employee: {
    label: "Employees",
    description: "Employee records and organizational assignment.",
    actions: {
      view: "View employees",
      create: "Create employees",
      update: "Update employees",
      delete: "Deactivate or delete employees",
      assign: "Assign department, branch, manager and role",
    },
  },
  employee_document: {
    label: "Employee documents",
    description: "Contracts, certificates and personal files.",
    actions: {
      view: "View employee documents",
      manage: "Upload and remove employee documents",
    },
  },
  attendance: {
    label: "Attendance",
    description: "Daily attendance, check-in and corrections.",
    actions: {
      view: "View attendance",
      mark: "Check in and check out",
      update: "Correct attendance records",
      approve: "Approve or reject attendance appeals",
      appeal: "Submit attendance corrections",
    },
  },
  leave: {
    label: "Leave",
    description: "Leave requests, approvals and balances.",
    actions: {
      view: "View leave requests",
      apply: "Apply for leave",
      approve: "Approve leave requests",
      reject: "Reject leave requests",
      manage: "Configure leave types, policies and balances",
    },
  },
  payroll: {
    label: "Payroll",
    description: "Payroll runs and payslips.",
    actions: {
      view: "View payroll",
      create: "Create payroll runs",
      update: "Update payroll runs",
      process: "Generate and process payroll",
      approve: "Approve or lock payroll",
    },
  },
  salary: {
    label: "Salary",
    description: "Salary structures, components and amounts.",
    actions: {
      view: "View salary information",
      create: "Create salary structures",
      update: "Update salary components",
    },
  },
  salary_statement: {
    label: "Salary statements",
    description: "Payslips and downloadable statements.",
    actions: {
      view: "View salary statements",
      download: "Download salary statements",
    },
  },
  reports: {
    label: "Reports",
    description: "Operational and financial reporting.",
    actions: {
      view: "View reports",
      export: "Export reports",
    },
  },
  role: {
    label: "Roles and permissions",
    description: "Role configuration for this tenant.",
    actions: {
      view: "View roles and permissions",
      manage: "Change role permissions",
    },
  },
  audit: {
    label: "Audit log",
    description: "Record of sensitive actions.",
    actions: {
      view: "View audit log",
    },
  },
  profile: {
    label: "My profile",
    description: "Self-service profile access.",
    actions: {
      view: "View own profile",
      update: "Update own profile",
    },
  },
} as const;

export type PermissionResource = keyof typeof PERMISSION_CATALOG;

type ActionsOf<R extends PermissionResource> =
  keyof (typeof PERMISSION_CATALOG)[R]["actions"] & string;

/** Every valid permission string, e.g. `"employee.view"`. */
export type PermissionKey = {
  [R in PermissionResource]: `${R}.${ActionsOf<R>}`;
}[PermissionResource];

export const PERMISSION_RESOURCES = Object.keys(
  PERMISSION_CATALOG,
) as PermissionResource[];

export const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_RESOURCES.flatMap(
  (resource) =>
    Object.keys(PERMISSION_CATALOG[resource].actions).map(
      (action) => `${resource}.${action}` as PermissionKey,
    ),
);

const PERMISSION_SET = new Set<string>(ALL_PERMISSIONS);

export function isPermissionKey(value: string): value is PermissionKey {
  return PERMISSION_SET.has(value);
}

export function splitPermission(permission: PermissionKey): {
  resource: PermissionResource;
  action: string;
} {
  const [resource, action] = permission.split(".");
  return { resource: resource as PermissionResource, action: action ?? "" };
}

/** Human label for a permission, used by the role admin screen. */
export function permissionLabel(permission: PermissionKey): string {
  const { resource, action } = splitPermission(permission);
  const actions = PERMISSION_CATALOG[resource].actions as Record<string, string>;
  return actions[action] ?? permission;
}

export type PermissionGroup = {
  resource: PermissionResource;
  label: string;
  description: string;
  permissions: { key: PermissionKey; label: string }[];
};

/** Catalogue reshaped for checkbox-matrix rendering. */
export const PERMISSION_GROUPS: PermissionGroup[] = PERMISSION_RESOURCES.map(
  (resource) => {
    const entry = PERMISSION_CATALOG[resource];
    return {
      resource,
      label: entry.label,
      description: entry.description,
      permissions: Object.entries(entry.actions).map(([action, label]) => ({
        key: `${resource}.${action}` as PermissionKey,
        label: label as string,
      })),
    };
  },
);
