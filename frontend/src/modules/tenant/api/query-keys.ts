/**
 * Query key factory. Keys are hierarchical so a mutation can invalidate a whole
 * feature (`tenantQueryKeys.leave.all`) without knowing every filter in use.
 */
export const tenantQueryKeys = {
  all: ["tenant"] as const,
  session: ["tenant", "session"] as const,
  workspace: ["tenant", "workspace"] as const,
  tenantInfo: ["tenant", "info"] as const,

  employees: {
    all: ["tenant", "employees"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["tenant", "employees", "list", filters ?? {}] as const,
    detail: (id: string) => ["tenant", "employees", "detail", id] as const,
    me: ["tenant", "employees", "me"] as const,
    linkableUsers: ["tenant", "employees", "linkable-users"] as const,
  },

  organization: {
    all: ["tenant", "organization"] as const,
    profile: ["tenant", "organization", "profile"] as const,
    branches: ["tenant", "organization", "branches"] as const,
    departments: ["tenant", "organization", "departments"] as const,
    designations: ["tenant", "organization", "designations"] as const,
  },

  attendance: {
    all: ["tenant", "attendance"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["tenant", "attendance", "list", filters ?? {}] as const,
    today: ["tenant", "attendance", "today"] as const,
  },

  leave: {
    all: ["tenant", "leave"] as const,
    requests: (filters?: Record<string, unknown>) =>
      ["tenant", "leave", "requests", filters ?? {}] as const,
    types: ["tenant", "leave", "types"] as const,
  },

  payroll: {
    all: ["tenant", "payroll"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["tenant", "payroll", "list", filters ?? {}] as const,
  },
} as const;
