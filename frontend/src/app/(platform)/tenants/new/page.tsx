"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { platformApi } from "@/lib/platform-api";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Card, ErrorBanner, PageHeader } from "@/components/ui/card";

export default function NewTenantPage() {
  const router = useRouter();
  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: () => platformApi.plans.list(),
  });

  const [name, setName] = useState("");
  const [schemaName, setSchemaName] = useState("");
  const [domain, setDomain] = useState("demo.localhost");
  const [planId, setPlanId] = useState<number | "">("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      platformApi.tenants.create({
        name,
        schema_name: schemaName,
        domain,
        plan_id: Number(planId),
        company_email: companyEmail || undefined,
        company_phone: companyPhone || undefined,
      }),
    onSuccess: (tenant) => {
      if (tenant.support_email && tenant.support_password) {
        setCredentials({
          email: tenant.support_email,
          password: tenant.support_password,
        });
      } else {
        router.push(`/tenants/${tenant.id}`);
      }
    },
  });

  const activePlans = (plansQuery.data || []).filter((p) => p.is_active);

  return (
    <div>
      <PageHeader
        title="Provision tenant"
        description="Creates schema, domain, trial subscription, seed data, and owner user."
        actions={
          <Link href="/tenants">
            <Button variant="secondary">Back</Button>
          </Link>
        }
      />

      {mutation.error ? (
        <ErrorBanner
          message={
            mutation.error instanceof ApiError
              ? mutation.error.message
              : (mutation.error as Error).message
          }
        />
      ) : null}

      {credentials ? (
        <Card className="border-teal-200 bg-teal-50">
          <h2 className="text-lg font-semibold text-teal-950">
            Tenant created
          </h2>
          <p className="mt-1 text-sm text-teal-900">
            Save these owner credentials now — the password is shown only once.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-teal-800">Email</dt>
              <dd className="font-mono">{credentials.email}</dd>
            </div>
            <div>
              <dt className="text-teal-800">Password</dt>
              <dd className="font-mono">{credentials.password}</dd>
            </div>
          </dl>
          <Button
            className="mt-4"
            onClick={() => router.push("/tenants")}
          >
            Go to tenants
          </Button>
        </Card>
      ) : (
        <Card className="max-w-xl">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div>
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="schema">Schema name</Label>
              <Input
                id="schema"
                value={schemaName}
                onChange={(e) =>
                  setSchemaName(e.target.value.toLowerCase().replace(/\s+/g, "_"))
                }
                placeholder="demo1"
                required
              />
              <FieldError message="Lowercase alphanumeric / underscores only." />
            </div>
            <div>
              <Label htmlFor="domain">Primary domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase())}
                required
              />
            </div>
            <div>
              <Label htmlFor="plan">Plan</Label>
              <select
                id="plan"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={planId}
                onChange={(e) =>
                  setPlanId(e.target.value ? Number(e.target.value) : "")
                }
                required
              >
                <option value="">Select a plan</option>
                {activePlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
              {!activePlans.length && !plansQuery.isLoading ? (
                <p className="mt-1 text-xs text-amber-700">
                  No active plans.{" "}
                  <Link href="/plans" className="underline">
                    Create one first
                  </Link>
                  .
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="email">Company / owner email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Company phone (optional)</Label>
              <Input
                id="phone"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={mutation.isPending || !planId}>
              {mutation.isPending ? "Provisioning…" : "Provision tenant"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
