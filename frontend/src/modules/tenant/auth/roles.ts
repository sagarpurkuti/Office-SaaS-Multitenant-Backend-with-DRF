import type { TenantUser } from "../types";
import { TENANT_ROLES } from "../config";

export function isTenantWorkspaceUser(user: TenantUser | null | undefined): boolean {
  if (!user || !user.is_active) return false;
  if (user.role === "SUPER_ADMIN") return false;
  if (user.tenant == null) return false;
  return (TENANT_ROLES as readonly string[]).includes(user.role);
}

export function displayName(user: TenantUser): string {
  const name = `${user.first_name} ${user.last_name}`.trim();
  return name || user.email;
}
