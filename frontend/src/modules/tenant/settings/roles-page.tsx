"use client";

import { useState } from "react";
import { Card, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  TENANT_ROLES,
  TENANT_ROLE_META,
  type TenantRole,
} from "../config";
import {
  PERMISSION_GROUPS,
  ROLE_PRESETS,
  RequirePermission,
  SCOPES,
  SCOPE_LABELS,
  grantedPermissions,
  serializeGrants,
  useRbac,
  type PermissionGrants,
  type PermissionKey,
  type Scope,
} from "../rbac";

export function RolesPage() {
  return (
    <RequirePermission permission="role.view">
      <RolesContent />
    </RequirePermission>
  );
}

function RolesContent() {
  const { can, source } = useRbac();
  const editable = can("role.manage");

  const [role, setRole] = useState<TenantRole>("HR");
  const [drafts, setDrafts] = useState<Record<TenantRole, PermissionGrants>>(
    () => ({ ...ROLE_PRESETS }),
  );
  const [copied, setCopied] = useState(false);

  const draft = drafts[role];
  const meta = TENANT_ROLE_META[role];
  const granted = grantedPermissions(draft).length;

  const update = (next: PermissionGrants) => {
    setDrafts((current) => ({ ...current, [role]: next }));
    setCopied(false);
  };

  const toggle = (permission: PermissionKey, enabled: boolean) => {
    const next = { ...draft };
    if (enabled) next[permission] = next[permission] ?? "organization";
    else delete next[permission];
    update(next);
  };

  const setScope = (permission: PermissionKey, scope: Scope) => {
    update({ ...draft, [permission]: scope });
  };

  const reset = () => update({ ...ROLE_PRESETS[role] });

  const copyConfiguration = async () => {
    const payload = JSON.stringify(
      { role, permissions: serializeGrants(draft) },
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Roles & permissions"
        description="What each role in this tenant is allowed to do, and how far its data access reaches."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={copyConfiguration}>
              {copied ? "Copied" : "Copy configuration"}
            </Button>
            {editable ? (
              <Button variant="secondary" onClick={reset}>
                Reset to default
              </Button>
            ) : null}
          </div>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label
              htmlFor="role-select"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Role
            </label>
            <Select
              id="role-select"
              className="w-64"
              value={role}
              onChange={(event) => setRole(event.target.value as TenantRole)}
            >
              {TENANT_ROLES.map((value) => (
                <option key={value} value={value}>
                  {TENANT_ROLE_META[value].label}
                </option>
              ))}
            </Select>
          </div>
          <p className="max-w-md text-sm text-slate-500">{meta.description}</p>
          <p className="ml-auto text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{granted}</span>{" "}
            permissions granted
          </p>
        </div>
      </Card>

      <p className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {source === "server"
          ? "Your own access comes from the tenant configuration returned by the API."
          : "The API does not expose a permission endpoint yet, so these are the role defaults compiled into the workspace. Edits here are a preview: copy the configuration to seed the backend."}
      </p>

      <div className="space-y-4">
        {PERMISSION_GROUPS.map((group) => (
          <Card key={group.resource}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-semibold text-slate-900">{group.label}</h2>
              <p className="text-xs text-slate-500">{group.description}</p>
            </div>

            <ul className="mt-4 divide-y divide-slate-100">
              {group.permissions.map((permission) => {
                const scope = draft[permission.key];
                const enabled = Boolean(scope);
                return (
                  <li
                    key={permission.key}
                    className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                  >
                    <label className="flex flex-1 items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={enabled}
                        disabled={!editable}
                        onChange={(event) =>
                          toggle(permission.key, event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700/30 disabled:opacity-50"
                      />
                      <span>
                        <span className="font-medium text-slate-800">
                          {permission.label}
                        </span>
                        <span className="ml-2 font-mono text-xs text-slate-400">
                          {permission.key}
                        </span>
                      </span>
                    </label>

                    <Select
                      className="w-52"
                      value={scope ?? ""}
                      disabled={!editable || !enabled}
                      onChange={(event) =>
                        setScope(permission.key, event.target.value as Scope)
                      }
                      aria-label={`Scope for ${permission.key}`}
                    >
                      {!enabled ? <option value="">No access</option> : null}
                      {SCOPES.map((value) => (
                        <option key={value} value={value}>
                          {SCOPE_LABELS[value]}
                        </option>
                      ))}
                    </Select>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
