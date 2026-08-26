/**
 * Grant maps and the pure predicates used to test them.
 *
 * A grant map is `permission -> widest scope the holder may reach`. Everything
 * here is pure so it can run in a server component, in middleware, or in tests
 * without React.
 */

import {
  ALL_PERMISSIONS,
  isPermissionKey,
  type PermissionKey,
  type PermissionResource,
} from "./permissions";
import { isScope, scopeSatisfies, widestScope, type Scope } from "./scopes";

export type PermissionGrants = Partial<Record<PermissionKey, Scope>>;

/**
 * Authoring format for presets. Supports wildcards so a role reads like the
 * spec: `{ "employee.*": "organization" }`.
 */
export type GrantSpec = Record<string, Scope>;

const WILDCARD = "*";

/** Expand a wildcard spec into an explicit `permission -> scope` map. */
export function expandGrants(spec: GrantSpec): PermissionGrants {
  const grants: PermissionGrants = {};

  const apply = (permission: PermissionKey, scope: Scope) => {
    const current = grants[permission];
    grants[permission] = current ? widestScope(current, scope) : scope;
  };

  for (const [pattern, scope] of Object.entries(spec)) {
    if (pattern === WILDCARD || pattern === `${WILDCARD}.${WILDCARD}`) {
      for (const permission of ALL_PERMISSIONS) apply(permission, scope);
      continue;
    }

    const [resource, action] = pattern.split(".");
    if (action === WILDCARD) {
      const prefix = `${resource}.`;
      for (const permission of ALL_PERMISSIONS) {
        if (permission.startsWith(prefix)) apply(permission, scope);
      }
      continue;
    }

    if (isPermissionKey(pattern)) apply(pattern, scope);
  }

  return grants;
}

export function scopeOf(
  grants: PermissionGrants,
  permission: PermissionKey,
): Scope | null {
  return grants[permission] ?? null;
}

/**
 * Core check. `requiredScope` defaults to `own`, so `can(g, "leave.view")`
 * answers "may this user see any leave at all", while
 * `can(g, "leave.view", "organization")` answers "across the whole company".
 */
export function can(
  grants: PermissionGrants,
  permission: PermissionKey,
  requiredScope: Scope = "own",
): boolean {
  return scopeSatisfies(grants[permission], requiredScope);
}

export function canAny(
  grants: PermissionGrants,
  permissions: readonly PermissionKey[],
  requiredScope: Scope = "own",
): boolean {
  return permissions.some((permission) => can(grants, permission, requiredScope));
}

export function canAll(
  grants: PermissionGrants,
  permissions: readonly PermissionKey[],
  requiredScope: Scope = "own",
): boolean {
  return permissions.every((permission) => can(grants, permission, requiredScope));
}

export function grantedPermissions(grants: PermissionGrants): PermissionKey[] {
  return ALL_PERMISSIONS.filter((permission) => Boolean(grants[permission]));
}

export function grantsForResource(
  grants: PermissionGrants,
  resource: PermissionResource,
): PermissionGrants {
  const prefix = `${resource}.`;
  const subset: PermissionGrants = {};
  for (const permission of ALL_PERMISSIONS) {
    if (permission.startsWith(prefix) && grants[permission]) {
      subset[permission] = grants[permission];
    }
  }
  return subset;
}

/** Wire format shared with the backend: `["employee.view:organization", …]`. */
export function serializeGrants(grants: PermissionGrants): string[] {
  return grantedPermissions(grants).map(
    (permission) => `${permission}:${grants[permission]}`,
  );
}

/**
 * Accepts anything the API might realistically return and normalises it:
 * `["employee.view:team"]`, `["employee.view"]` (defaults to `own`) or
 * `{ "employee.view": "team" }`. Unknown keys and scopes are dropped rather
 * than trusted.
 */
export function parseGrants(input: unknown): PermissionGrants {
  const grants: PermissionGrants = {};
  if (!input) return grants;

  const assign = (rawKey: string, rawScope: unknown) => {
    const key = rawKey.trim();
    if (!isPermissionKey(key)) return;
    const scope: Scope = isScope(rawScope) ? rawScope : "own";
    const current = grants[key];
    grants[key] = current ? widestScope(current, scope) : scope;
  };

  if (Array.isArray(input)) {
    for (const entry of input) {
      if (typeof entry !== "string") continue;
      const [key, scope] = entry.split(":");
      assign(key, scope);
    }
    return grants;
  }

  if (typeof input === "object") {
    for (const [key, scope] of Object.entries(input as Record<string, unknown>)) {
      assign(key, scope);
    }
  }

  return grants;
}

export function mergeGrants(
  base: PermissionGrants,
  override: PermissionGrants,
): PermissionGrants {
  const merged: PermissionGrants = { ...base };
  for (const [key, scope] of Object.entries(override) as [
    PermissionKey,
    Scope,
  ][]) {
    const current = merged[key];
    merged[key] = current ? widestScope(current, scope) : scope;
  }
  return merged;
}

export const EMPTY_GRANTS: PermissionGrants = Object.freeze({});
