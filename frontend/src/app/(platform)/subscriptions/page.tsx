"use client";

import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platform-api";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
} from "@/components/ui/card";

export default function SubscriptionsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => platformApi.subscriptions.list(),
  });

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Tenant plan assignments and lifecycle status."
      />
      {error ? <ErrorBanner message={(error as Error).message} /> : null}
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : !data?.length ? (
        <EmptyState>No subscriptions yet.</EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Tenant ID</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{s.tenant}</td>
                  <td className="px-4 py-3">{s.plan?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{s.start_date}</td>
                  <td className="px-4 py-3">{s.end_date || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
