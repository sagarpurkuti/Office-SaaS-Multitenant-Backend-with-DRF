"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platform-api";
import { Badge, Card, ErrorBanner, PageHeader } from "@/components/ui/card";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => platformApi.dashboard(),
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Platform health and recent operator activity."
      />
      {error ? (
        <ErrorBanner message={(error as Error).message} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total tenants</p>
          <p className="mt-2 text-3xl font-semibold">
            {isLoading ? "…" : data?.total_tenants ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Active subscriptions</p>
          <p className="mt-2 text-3xl font-semibold">
            {isLoading ? "…" : data?.active_subscriptions ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Revenue (placeholder)</p>
          <p className="mt-2 text-3xl font-semibold">
            {isLoading ? "…" : data?.total_revenue ?? "0.00"}
          </p>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent audit events</h2>
          <Link href="/audit" className="text-sm text-teal-700 hover:underline">
            View all
          </Link>
        </div>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : !data?.recent_audit_events?.length ? (
          <p className="text-sm text-slate-500">No audit events yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.recent_audit_events.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{ev.action}</p>
                  <p className="text-slate-500">
                    {ev.user_email || "system"}
                    {ev.target ? ` · ${ev.target}` : ""}
                  </p>
                </div>
                <Badge>{new Date(ev.timestamp).toLocaleString()}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
