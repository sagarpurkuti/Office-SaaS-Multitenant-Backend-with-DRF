import { apiRequest } from "./api";
import type {
  AuditEvent,
  DashboardData,
  ProvisionTenantPayload,
  SystemAnnouncement,
  Tenant,
  TenantPlan,
  TenantSubscription,
  User,
} from "./types";

export const platformApi = {
  me: () => apiRequest<User>("/api/auth/me/"),
  dashboard: () => apiRequest<DashboardData>("/api/platform/dashboard/"),
  tenants: {
    list: () => apiRequest<Tenant[]>("/api/platform/tenants/"),
    get: (id: number | string) =>
      apiRequest<Tenant>(`/api/platform/tenants/${id}/`),
    create: (payload: ProvisionTenantPayload) =>
      apiRequest<Tenant>("/api/platform/tenants/", {
        method: "POST",
        body: payload,
      }),
    suspend: (id: number | string) =>
      apiRequest<{ status: string }>(`/api/platform/tenants/${id}/suspend/`, {
        method: "POST",
      }),
    activate: (id: number | string) =>
      apiRequest<{ status: string }>(`/api/platform/tenants/${id}/activate/`, {
        method: "POST",
      }),
    resetPassword: (id: number | string) =>
      apiRequest<{ new_password: string; email?: string }>(
        `/api/platform/tenants/${id}/reset_password/`,
        { method: "POST" },
      ),
  },
  plans: {
    list: () => apiRequest<TenantPlan[]>("/api/platform/plans/"),
    create: (payload: Partial<TenantPlan>) =>
      apiRequest<TenantPlan>("/api/platform/plans/", {
        method: "POST",
        body: payload,
      }),
    update: (id: number | string, payload: Partial<TenantPlan>) =>
      apiRequest<TenantPlan>(`/api/platform/plans/${id}/`, {
        method: "PATCH",
        body: payload,
      }),
  },
  subscriptions: {
    list: () =>
      apiRequest<TenantSubscription[]>("/api/platform/subscriptions/"),
  },
  audit: {
    list: () => apiRequest<AuditEvent[]>("/api/platform/audit-events/"),
  },
  announcements: {
    list: () =>
      apiRequest<SystemAnnouncement[]>("/api/platform/announcements/"),
    create: (payload: Partial<SystemAnnouncement>) =>
      apiRequest<SystemAnnouncement>("/api/platform/announcements/", {
        method: "POST",
        body: payload,
      }),
    update: (id: number | string, payload: Partial<SystemAnnouncement>) =>
      apiRequest<SystemAnnouncement>(`/api/platform/announcements/${id}/`, {
        method: "PATCH",
        body: payload,
      }),
  },
};
