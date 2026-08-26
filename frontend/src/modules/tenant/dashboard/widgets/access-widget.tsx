"use client";

import { Badge } from "@/components/ui/card";
import {
  PERMISSION_CATALOG,
  SCOPE_SHORT_LABELS,
  grantedPermissions,
  splitPermission,
  useRbac,
} from "../../rbac";
import { WidgetCard } from "./widget-card";

/**
 * Makes the user's effective access legible: which role, how many permissions,
 * and where those permissions came from.
 */
export function AccessWidget() {
  const { roleLabel, grants, source, can } = useRbac();
  const permissions = grantedPermissions(grants);

  const byResource = new Map<string, number>();
  for (const permission of permissions) {
    const { resource } = splitPermission(permission);
    byResource.set(resource, (byResource.get(resource) ?? 0) + 1);
  }

  const topResources = [...byResource.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <WidgetCard
      title="Your access"
      description={`${permissions.length} permissions granted.`}
      action={
        can("role.view") ? { href: "/settings/roles", label: "Roles" } : undefined
      }
    >
      <p className="text-sm font-medium text-slate-800">{roleLabel}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {topResources.map(([resource, count]) => {
          const label =
            PERMISSION_CATALOG[resource as keyof typeof PERMISSION_CATALOG]
              ?.label ?? resource;
          return (
            <Badge key={resource} tone="slate">
              {label} · {count}
            </Badge>
          );
        })}
      </div>

      <dl className="mt-4 space-y-1.5 text-xs text-slate-500">
        <div className="flex justify-between gap-3">
          <dt>Employee data reach</dt>
          <dd className="font-medium text-slate-700">
            {scopeLabel(grants["employee.view"])}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Leave approval reach</dt>
          <dd className="font-medium text-slate-700">
            {scopeLabel(grants["leave.approve"])}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Source</dt>
          <dd className="font-medium text-slate-700">
            {source === "server" ? "Tenant configuration" : "Role default"}
          </dd>
        </div>
      </dl>
    </WidgetCard>
  );
}

function scopeLabel(scope: string | undefined): string {
  if (!scope) return "None";
  return SCOPE_SHORT_LABELS[scope as keyof typeof SCOPE_SHORT_LABELS] ?? scope;
}
