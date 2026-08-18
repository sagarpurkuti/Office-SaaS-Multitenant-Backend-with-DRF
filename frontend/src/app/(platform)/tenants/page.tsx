"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platform-api";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
} from "@/components/ui/card";

function statusTone(status?: string) {
  switch (status) {
    case "ACTIVE":
      return "green" as const;
    case "TRIAL":
      return "teal" as const;
    case "SUSPENDED":
      return "amber" as const;
    case "CANCELLED":
    case "EXPIRED":
      return "red" as const;
    default:
      return "slate" as const;
  }
}

export default function TenantsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => platformApi.tenants.list(),
  });

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="Provision and manage customer organizations."
        actions={
          <Link href="/tenants/new">
            <Button>Provision tenant</Button>
          </Link>
        }
      />
      {error ? <ErrorBanner message={(error as Error).message} /> : null}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading tenants…</p>
      ) : !data?.length ? (
        <EmptyState>
          No tenants yet.{" "}
          <Link href="/tenants/new" className="text-teal-700 underline">
            Provision the first one
          </Link>
          .
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Schema</th>
                <th className="px-4 py-3 font-medium">Domain</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <Link
                      href={`/tenants/${t.id}`}
                      className="font-medium text-teal-800 hover:underline"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{t.schema_name}</td>
                  <td className="px-4 py-3">{t.domain?.domain || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(t.subscription?.status)}>
                      {t.subscription?.status || (t.on_trial ? "TRIAL" : "—")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{t.created_on}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
