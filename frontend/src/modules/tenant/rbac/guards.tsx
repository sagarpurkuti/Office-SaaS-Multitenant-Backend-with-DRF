"use client";

import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRbac } from "./rbac-provider";
import type { PermissionKey } from "./permissions";
import { SCOPE_LABELS, SCOPE_SHORT_LABELS, type Scope } from "./scopes";

type CanProps = {
  /** Render children only when this permission is held. */
  permission?: PermissionKey;
  /** Or when any one of these is held. */
  anyOf?: readonly PermissionKey[];
  /** Minimum reach required; defaults to `own`. */
  scope?: Scope;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * Hides UI the user has no permission for. This is an affordance, not a
 * control: the API is what actually enforces access.
 */
export function Can({
  permission,
  anyOf,
  scope,
  children,
  fallback = null,
}: CanProps) {
  const { can, canAny } = useRbac();

  const allowed = permission
    ? can(permission, scope)
    : anyOf
      ? canAny(anyOf, scope)
      : false;

  return <>{allowed ? children : fallback}</>;
}

/**
 * Page-level guard. Renders an explicit denial instead of an empty screen so a
 * user who lands on a deep link understands why.
 */
export function RequirePermission({
  permission,
  anyOf,
  scope,
  children,
}: CanProps) {
  const { can, canAny } = useRbac();

  const allowed = permission
    ? can(permission, scope)
    : anyOf
      ? canAny(anyOf, scope)
      : false;

  if (!allowed) return <AccessDenied />;
  return <>{children}</>;
}

export function AccessDenied({
  message = "Your role does not include access to this area. Ask your organization admin if you need it.",
}: {
  message?: string;
}) {
  return (
    <Card className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-50">
        <ShieldAlert className="h-5 w-5 text-amber-700" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        You do not have access
      </h2>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </Card>
  );
}

/**
 * Tells the user which slice of data they are looking at, so a manager is never
 * left wondering why the list is short.
 */
export function ScopeNotice({
  scope,
  noun = "records",
}: {
  scope: Scope | null;
  noun?: string;
}) {
  if (!scope || scope === "organization") return null;
  return (
    <p className="mb-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
      Showing {noun} within your scope:{" "}
      <span className="font-medium text-slate-700">{SCOPE_LABELS[scope]}</span>.
    </p>
  );
}

export function ScopeBadge({ scope }: { scope: Scope | null }) {
  if (!scope) return null;
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
      {SCOPE_SHORT_LABELS[scope]}
    </span>
  );
}
