/**
 * Turns the signed-in user into an access profile the UI can query.
 *
 * Precedence:
 *   1. `user.permissions` from the API — authoritative, reflects any custom
 *      role configuration the tenant admin has made.
 *   2. The role preset in `role-presets.ts` — used while the API has no
 *      permission endpoint.
 *
 * `source` is surfaced so the roles screen can be honest about which one is in
 * play. Either way this is presentation logic only: the API must run the same
 * checks server-side.
 */

import { isTenantRole, tenantRoleLabel, type TenantRole } from "../config";
import type { TenantUser } from "../types";
import {
  EMPTY_GRANTS,
  parseGrants,
  type PermissionGrants,
} from "./grants";
import { presetFor } from "./role-presets";

export type GrantSource = "server" | "role-preset" | "none";

export type AccessProfile = {
  role: TenantRole | null;
  roleLabel: string;
  grants: PermissionGrants;
  source: GrantSource;
};

export const ANONYMOUS_ACCESS: AccessProfile = {
  role: null,
  roleLabel: "Signed out",
  grants: EMPTY_GRANTS,
  source: "none",
};

function hasServerPermissions(user: TenantUser): boolean {
  const value = user.permissions;
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  return Object.keys(value).length > 0;
}

export function resolveAccessProfile(
  user: TenantUser | null | undefined,
): AccessProfile {
  if (!user || !user.is_active) return ANONYMOUS_ACCESS;

  const role = isTenantRole(user.role) ? user.role : null;

  if (hasServerPermissions(user)) {
    return {
      role,
      roleLabel: tenantRoleLabel(user.role),
      grants: parseGrants(user.permissions),
      source: "server",
    };
  }

  if (!role) return ANONYMOUS_ACCESS;

  return {
    role,
    roleLabel: tenantRoleLabel(role),
    grants: presetFor(role),
    source: "role-preset",
  };
}
