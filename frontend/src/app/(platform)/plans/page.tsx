"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { platformApi } from "@/lib/platform-api";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
} from "@/components/ui/card";

export default function PlansPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["plans"],
    queryFn: () => platformApi.plans.list(),
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [monthly, setMonthly] = useState("0");
  const [yearly, setYearly] = useState("0");
  const [maxUsers, setMaxUsers] = useState("50");

  const create = useMutation({
    mutationFn: () =>
      platformApi.plans.create({
        name,
        code: code.toUpperCase(),
        monthly_price: monthly,
        yearly_price: yearly,
        max_users: Number(maxUsers) || 0,
        max_storage_mb: 500,
        max_api_calls: 100000,
        features: { attendance: true, payroll: true, leave: true },
        is_active: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans"] });
      setOpen(false);
      setName("");
      setCode("");
    },
  });

  return (
    <div>
      <PageHeader
        title="Plans"
        description="Commercial plans assigned during tenant provisioning."
        actions={
          <Button onClick={() => setOpen((v) => !v)}>
            {open ? "Cancel" : "New plan"}
          </Button>
        }
      />

      {error ? <ErrorBanner message={(error as Error).message} /> : null}
      {create.error ? (
        <ErrorBanner
          message={
            create.error instanceof ApiError
              ? create.error.message
              : (create.error as Error).message
          }
        />
      ) : null}

      {open ? (
        <Card className="mb-6 max-w-lg">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="STARTER"
                required
              />
              <FieldError message="Unique machine code, e.g. STARTER." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="monthly">Monthly price</Label>
                <Input
                  id="monthly"
                  value={monthly}
                  onChange={(e) => setMonthly(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="yearly">Yearly price</Label>
                <Input
                  id="yearly"
                  value={yearly}
                  onChange={(e) => setYearly(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="users">Max users</Label>
              <Input
                id="users"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving…" : "Create plan"}
            </Button>
          </form>
        </Card>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : !data?.length ? (
        <EmptyState>No plans yet.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((plan) => (
            <Card key={plan.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{plan.name}</h2>
                  <p className="font-mono text-xs text-slate-500">{plan.code}</p>
                </div>
                <Badge tone={plan.is_active ? "green" : "slate"}>
                  {plan.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <dl className="mt-4 space-y-1 text-sm text-slate-600">
                <div className="flex justify-between">
                  <dt>Monthly</dt>
                  <dd>{plan.monthly_price}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Yearly</dt>
                  <dd>{plan.yearly_price}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Max users</dt>
                  <dd>{plan.max_users || "∞"}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
