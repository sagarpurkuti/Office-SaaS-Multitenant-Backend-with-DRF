"use client";

import { createContext, useContext, useMemo } from "react";
import { useTenantAuth } from "../auth/tenant-auth-provider";
import type { TenantRole } from "../config";
import {
  can as canGrant,
  canAll as canAllGrants,
  canAny as canAnyGrants,
  scopeOf as scopeOfGrant,
  type PermissionGrants,
} from "./grants";
import type { PermissionKey } from "./permissions";
import {
  ANONYMOUS_ACCESS,
  resolveAccessProfile,
  type GrantSource,
} from "./resolve";
import type { Scope } from "./scopes";

export type RbacValue = {
  role: TenantRole | null;
  roleLabel: string;
  grants: PermissionGrants;
  /** Where the grants came from — `role-preset` means the API has not sent any. */
  source: GrantSource;
  can: (permission: PermissionKey, scope?: Scope) => boolean;
  canAny: (permissions: readonly PermissionKey[], scope?: Scope) => boolean;
  canAll: (permissions: readonly PermissionKey[], scope?: Scope) => boolean;
  /** How far a permission reaches, or `null` when it is not granted. */
  scopeOf: (permission: PermissionKey) => Scope | null;
};

const RbacContext = createContext<RbacValue | null>(null);

function buildValue(profile = ANONYMOUS_ACCESS): RbacValue {
  const { grants } = profile;
  return {
    role: profile.role,
    roleLabel: profile.roleLabel,
    grants,
    source: profile.source,
    can: (permission, scope) => canGrant(grants, permission, scope),
    canAny: (permissions, scope) => canAnyGrants(grants, permissions, scope),
    canAll: (permissions, scope) => canAllGrants(grants, permissions, scope),
    scopeOf: (permission) => scopeOfGrant(grants, permission),
  };
}

/**
 * Derives the permission set from the authenticated user. Must be mounted
 * inside `TenantAuthProvider`.
 */
export function RbacProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTenantAuth();

  const value = useMemo(
    () => buildValue(resolveAccessProfile(user)),
    [user],
  );

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>;
}

export function useRbac(): RbacValue {
  const ctx = useContext(RbacContext);
  if (!ctx) throw new Error("useRbac must be used within RbacProvider");
  return ctx;
}

/** Shorthand for the common case: `const can = useCan(); can("leave.approve")`. */
export function useCan() {
  return useRbac().can;
}

export function useScopeOf(permission: PermissionKey): Scope | null {
  return useRbac().scopeOf(permission);
}
