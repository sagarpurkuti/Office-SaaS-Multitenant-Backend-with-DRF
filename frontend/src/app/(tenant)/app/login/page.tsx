"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTenantAuth } from "@/modules/tenant/auth/tenant-auth-provider";
import { TENANT_ROUTES } from "@/modules/tenant/config";
import { platformOrigin } from "@/shared/config/hosts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, Input, Label } from "@/components/ui/input";
import { ApiError } from "@/shared/api/errors";

export default function TenantLoginPage() {
  const { user, loading, login, tenantHost } = useTenantAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hostLabel, setHostLabel] = useState("");

  useEffect(() => {
    setHostLabel(window.location.host);
  }, []);

  useEffect(() => {
    if (!loading && user) router.replace(TENANT_ROUTES.home);
  }, [loading, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
          Saas HRM
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Tenant workspace
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Signing into{" "}
          <span className="font-mono text-slate-700">{hostLabel || tenantHost || "this subdomain"}</span>
          . Use a user that belongs to this tenant.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <FieldError message={error} /> : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
{/* 
        <p className="mt-4 text-center text-xs text-slate-500">
          Platform operator?{" "}
          <a href={`${platformOrigin()}/login`} className="text-indigo-700 hover:underline">
            SaaS Manager login
          </a>
        </p> */}
      </Card>
    </div>
  );
}
