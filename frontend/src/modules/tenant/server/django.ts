import { djangoApiBase } from "@/shared/config/env";
import { ApiError, parseJsonBody, type ApiErrorBody } from "@/shared/api/errors";
import type { TenantUser } from "../types";
import { isValidTenantHost } from "../lib/host";

type DjangoInit = {
  method?: string;
  host: string;
  access?: string | null;
  body?: unknown;
};

function assertHost(host: string) {
  if (!isValidTenantHost(host)) {
    throw new ApiError(400, { error: "Invalid tenant host." });
  }
}

function withSlash(path: string): string {
  const prefixed = path.startsWith("/") ? path : `/${path}`;
  if (prefixed.includes("?")) return prefixed;
  return prefixed.endsWith("/") ? prefixed : `${prefixed}/`;
}

export async function djangoFetch<T>(path: string, init: DjangoInit): Promise<T> {
  assertHost(init.host);
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Host", init.host);
  headers.set("X-Forwarded-Host", init.host);
  headers.set("X-Tenant-Host", init.host);
  if (init.access) headers.set("Authorization", `Bearer ${init.access}`);
  if (init.body !== undefined) headers.set("Content-Type", "application/json");

  const res = await fetch(`${djangoApiBase()}${withSlash(path)}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await parseJsonBody(res)) as ApiErrorBody;
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return (await parseJsonBody(res)) as T;
}

export async function djangoRefresh(host: string, refresh: string) {
  return djangoFetch<{ access: string; refresh?: string }>("/api/auth/refresh/", {
    method: "POST",
    host,
    body: { refresh },
  });
}

export async function djangoMe(host: string, access: string) {
  return djangoFetch<TenantUser>("/api/auth/me/", { host, access });
}
