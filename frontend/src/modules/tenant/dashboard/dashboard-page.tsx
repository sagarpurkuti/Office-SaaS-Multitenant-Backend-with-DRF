"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, Card, ErrorBanner, PageHeader } from "@/components/ui/card";
import { tenantWorkspaceApi } from "../api/workspace";
import { tenantQueryKeys } from "../api/query-keys";
import { useTenantAuth } from "../auth/tenant-auth-provider";
import { displayName } from "../auth/roles";

export function TenantDashboardPage() {
  const { user, tenantHost } = useTenantAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: tenantQueryKeys.workspace,
    queryFn: () => tenantWorkspaceApi.dashboard(),
  });

  return (
    <div>
      <PageHeader
        title={data?.organization?.name || data?.tenant_name || "Workspace"}
        description={
          user
            ? `Welcome back, ${displayName(user)}. Host ${tenantHost ?? "unknown"}.`
            : "Tenant workspace"
        }
      />

      {error ? <ErrorBanner message={(error as Error).message} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Employees" value={data?.counts.employees} loading={isLoading} />
        <StatCard label="Members" value={data?.counts.members} loading={isLoading} />
        <StatCard label="Branches" value={data?.counts.branches} loading={isLoading} />
        <StatCard label="Departments" value={data?.counts.departments} loading={isLoading} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Organization</h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading…</p>
          ) : data?.organization ? (
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Name" value={data.organization.name} />
              <Row label="Timezone" value={data.organization.timezone} />
              <Row label="Currency" value={data.organization.currency} />
              <Row label="Language" value={data.organization.language} />
              <Row
                label="Status"
                value={
                  <Badge tone={data.organization.is_active ? "green" : "slate"}>
                    {data.organization.is_active ? "Active" : "Inactive"}
                  </Badge>
                }
              />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No organization record has been seeded for this tenant yet.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold">Workspace</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Tenant" value={data?.tenant_name || "—"} />
            <Row
              label="Schema"
              value={
                <span className="font-mono text-xs">{data?.schema_name || "—"}</span>
              }
            />
            <Row
              label="Trial"
              value={
                data?.on_trial == null ? "—" : data.on_trial ? "Yes" : "No"
              }
            />
            <Row label="Your role" value={user?.role || "—"} />
            <Row label="Attendance" value={data?.settings?.attendance_method || "—"} />
          </dl>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{loading ? "…" : (value ?? 0)}</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}
