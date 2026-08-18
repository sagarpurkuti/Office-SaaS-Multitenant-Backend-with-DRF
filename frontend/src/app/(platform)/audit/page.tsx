"use client";

import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platform-api";
import {
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
} from "@/components/ui/card";

export default function AuditPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["audit"],
    queryFn: () => platformApi.audit.list(),
  });

  return (
    <div>
      <PageHeader
        title="Audit events"
        description="Immutable log of platform operator actions."
      />
      {error ? <ErrorBanner message={(error as Error).message} /> : null}
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : !data?.length ? (
        <EmptyState>No audit events.</EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((ev) => (
                <tr key={ev.id}>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(ev.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">{ev.action}</td>
                  <td className="px-4 py-3">{ev.user_email || "—"}</td>
                  <td className="px-4 py-3">{ev.target || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
