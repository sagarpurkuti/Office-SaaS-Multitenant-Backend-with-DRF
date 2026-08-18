export type UserRole =
  | "SUPER_ADMIN"
  | "OWNER"
  | "HR"
  | "MANAGER"
  | "ACCOUNTANT"
  | "EMPLOYEE";

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  tenant: number | null;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  access: string;
  refresh: string;
  user: User;
};

export type TenantPlan = {
  id: number;
  name: string;
  code: string;
  monthly_price: string;
  yearly_price: string;
  max_users: number;
  max_storage_mb: number;
  max_api_calls: number;
  features: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TenantDomain = {
  id: number;
  domain: string;
  is_primary: boolean;
  tenant: number;
};

export type TenantSubscription = {
  id: number;
  tenant: number;
  plan: TenantPlan | null;
  start_date: string;
  end_date: string | null;
  status: "TRIAL" | "ACTIVE" | "EXPIRED" | "SUSPENDED" | "CANCELLED";
  renewal_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Tenant = {
  id: number;
  schema_name: string;
  name: string;
  paid_until: string | null;
  on_trial: boolean;
  created_on: string;
  domain: TenantDomain | null;
  subscription: TenantSubscription | null;
  support_email?: string;
  support_password?: string;
};

export type ProvisionTenantPayload = {
  name: string;
  schema_name: string;
  domain: string;
  plan_id: number;
  company_email?: string;
  company_phone?: string;
};

export type AuditEvent = {
  id: number;
  user: string | null;
  user_email?: string;
  action: string;
  target: string | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
};

export type DashboardData = {
  total_tenants: number;
  active_subscriptions: number;
  total_revenue: string;
  recent_audit_events: AuditEvent[];
};

export type SystemAnnouncement = {
  id: number;
  title: string;
  message: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiErrorBody = {
  error?: string;
  detail?: string;
  non_field_errors?: string[];
  [key: string]: unknown;
};
