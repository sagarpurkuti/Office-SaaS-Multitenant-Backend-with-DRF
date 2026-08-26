/**
 * Data scope for a permission.
 *
 * Two users can hold the same permission and still see different rows. A grant
 * is therefore `permission -> scope`, and scopes are ordered: a wider grant
 * always satisfies a narrower requirement.
 *
 *   own < team < department < branch < organization
 */

export const SCOPES = [
  "own",
  "team",
  "department",
  "branch",
  "organization",
] as const;

export type Scope = (typeof SCOPES)[number];

const SCOPE_RANK: Record<Scope, number> = {
  own: 1,
  team: 2,
  department: 3,
  branch: 4,
  organization: 5,
};

export const SCOPE_LABELS: Record<Scope, string> = {
  own: "Own records",
  team: "Direct reports",
  department: "Department",
  branch: "Branch",
  organization: "Whole organization",
};

export const SCOPE_SHORT_LABELS: Record<Scope, string> = {
  own: "Own",
  team: "Team",
  department: "Dept",
  branch: "Branch",
  organization: "Org",
};

export function isScope(value: unknown): value is Scope {
  return typeof value === "string" && value in SCOPE_RANK;
}

/** True when `granted` reaches at least as far as `required`. */
export function scopeSatisfies(
  granted: Scope | null | undefined,
  required: Scope = "own",
): boolean {
  if (!granted) return false;
  return SCOPE_RANK[granted] >= SCOPE_RANK[required];
}

export function widestScope(a: Scope, b: Scope): Scope {
  return SCOPE_RANK[a] >= SCOPE_RANK[b] ? a : b;
}

export function compareScopes(a: Scope, b: Scope): number {
  return SCOPE_RANK[a] - SCOPE_RANK[b];
}

/** `true` when the grant only covers the user's own rows. */
export function isSelfServiceScope(scope: Scope | null | undefined): boolean {
  return scope === "own";
}
