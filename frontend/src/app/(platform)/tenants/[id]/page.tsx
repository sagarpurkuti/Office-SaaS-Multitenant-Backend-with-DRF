"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { platformApi } from "@/lib/platform-api";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Card,
  ErrorBanner,
  PageHeader,
} from "@/components/ui/card";

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const qc = useQueryClient();
  const [resetInfo, setResetInfo] = useState<{
    email?: string;
    password: string;
  } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tenant", id],
    queryFn: () => platformApi.tenants.get(id),
  });

  const suspend = useMutation({
    mutationFn: () => platformApi.tenants.suspend(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenant", id] }),
  });
  const activate = useMutation({
    mutationFn: () => platformApi.tenants.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenant", id] }),
  });
  const resetPassword = useMutation({
    mutationFn: () => platformApi.tenants.resetPassword(id),
    onSuccess: (res) =>
      setResetInfo({ email: res.email, password: res.new_password }),
  });

  const actionError =
    suspend.error || activate.error || resetPassword.error;

  return (
    <div>
      <PageHeader
        title={data?.name || "Tenant"}
        description={data ? `schema: ${data.schema_name}` : "Loading…"}
        actions={
          <Link href="/tenants">
            <Button variant="secondary">Back</Button>
          </Link>
        }
      />

      {error ? <ErrorBanner message={(error as Error).message} /> : null}
      {actionError ? (
        <ErrorBanner
          message={
            actionError instanceof ApiError
              ? actionError.message
              : (actionError as Error).message
          }
        />
      ) : null}

      {isLoading || !data ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="font-semibold">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Domain</dt>
                <dd>{data.domain?.domain || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">On trial</dt>
                <dd>{data.on_trial ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Created</dt>
                <dd>{data.created_on}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Subscription</dt>
                <dd>
                  {data.subscription ? (
                    <Badge
                      tone={
                        data.subscription.status === "ACTIVE"
                          ? "green"
                          : data.subscription.status === "SUSPENDED"
                            ? "amber"
                            : "teal"
                      }
                    >
                      {data.subscription.status}
                      {data.subscription.plan
                        ? ` · ${data.subscription.plan.name}`
                        : ""}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="font-semibold">Actions</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={activate.isPending}
                onClick={() => activate.mutate()}
              >
                Activate
              </Button>
              <Button
                variant="secondary"
                disabled={suspend.isPending}
                onClick={() => suspend.mutate()}
              >
                Suspend
              </Button>
              <Button
                variant="danger"
                disabled={resetPassword.isPending}
                onClick={() => {
                  if (
                    confirm(
                      "Generate a new temporary password for the tenant owner?",
                    )
                  ) {
                    resetPassword.mutate();
                  }
                }}
              >
                Reset owner password
              </Button>
            </div>
            {resetInfo ? (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
                <p className="font-medium text-amber-900">New password</p>
                {resetInfo.email ? (
                  <p className="mt-1 font-mono text-amber-950">
                    {resetInfo.email}
                  </p>
                ) : null}
                <p className="mt-1 font-mono text-amber-950">
                  {resetInfo.password}
                </p>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </div>
  );
}
