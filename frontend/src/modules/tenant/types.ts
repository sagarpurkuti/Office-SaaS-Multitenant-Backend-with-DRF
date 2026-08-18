import type { TenantRole } from "./config";

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
