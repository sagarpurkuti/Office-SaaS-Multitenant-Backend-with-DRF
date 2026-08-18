import { cookies } from "next/headers";
import { TENANT_COOKIE } from "../config";
import { isProduction } from "@/shared/config/env";

const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;
const HOST_MAX_AGE = REFRESH_MAX_AGE;

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction(),
    path: "/",
  };
}

export async function readTenantCookies() {
  const jar = await cookies();
  return {
    access: jar.get(TENANT_COOKIE.access)?.value ?? null,
    refresh: jar.get(TENANT_COOKIE.refresh)?.value ?? null,
    host: jar.get(TENANT_COOKIE.host)?.value ?? null,
  };
}

export async function writeTenantSession(params: {
  access: string;
  refresh: string;
  host: string;
}) {
  const jar = await cookies();
  const base = cookieBase();
  jar.set(TENANT_COOKIE.access, params.access, { ...base, maxAge: ACCESS_MAX_AGE });
  jar.set(TENANT_COOKIE.refresh, params.refresh, { ...base, maxAge: REFRESH_MAX_AGE });
  jar.set(TENANT_COOKIE.host, params.host, { ...base, maxAge: HOST_MAX_AGE });
}

export async function clearTenantSession() {
  const jar = await cookies();
  const base = cookieBase();
  jar.set(TENANT_COOKIE.access, "", { ...base, maxAge: 0 });
  jar.set(TENANT_COOKIE.refresh, "", { ...base, maxAge: 0 });
  jar.set(TENANT_COOKIE.host, "", { ...base, maxAge: 0 });
}
