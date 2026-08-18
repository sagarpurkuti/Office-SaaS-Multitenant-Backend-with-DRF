export const TENANT_COOKIE = {
  access: "tenant_access",
  refresh: "tenant_refresh",
  host: "tenant_host",
} as const;

export const TENANT_ROUTES = {
  login: "/login",
  home: "/",
  bff: "/api/tenant",
} as const;

export const TENANT_ROLES = [
  "OWNER",
  "HR",
  "MANAGER",
  "ACCOUNTANT",
  "EMPLOYEE",
] as const;

export type TenantRole = (typeof TENANT_ROLES)[number];
