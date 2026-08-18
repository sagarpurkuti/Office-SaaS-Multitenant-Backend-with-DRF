import { NextResponse } from "next/server";
import { ApiError } from "@/shared/api/errors";
import { djangoFetch, djangoMe } from "@/modules/tenant/server/django";
import { writeTenantSession } from "@/modules/tenant/server/cookies";
import { normalizeTenantHost, isValidTenantHost } from "@/modules/tenant/lib/host";
import { isTenantWorkspaceUser } from "@/modules/tenant/auth/roles";
import { isPlatformHostname } from "@/shared/config/hosts";
import type { TenantUser } from "@/modules/tenant/types";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = (body.email || "").trim();
    const password = body.password || "";
    const tenantHost = normalizeTenantHost(request.headers.get("host") || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (!isValidTenantHost(tenantHost) || isPlatformHostname(tenantHost)) {
      return NextResponse.json(
        {
          error:
            "Open this login on your tenant subdomain, for example http://demo.localhost:3000/login",
        },
        { status: 400 },
      );
    }

    const tokens = await djangoFetch<{
      access: string;
      refresh: string;
      user: TenantUser;
    }>("/api/auth/login/", {
      method: "POST",
      host: tenantHost,
      body: { email, password },
    });

    if (!isTenantWorkspaceUser(tokens.user)) {
      return NextResponse.json(
        { error: "This account cannot access the tenant workspace. Use a tenant user." },
        { status: 403 },
      );
    }

    await writeTenantSession({
      access: tokens.access,
      refresh: tokens.refresh,
      host: tenantHost,
    });

    const user = await djangoMe(tenantHost, tokens.access);
    return NextResponse.json({ user, tenantHost });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ error: "Unable to sign in." }, { status: 502 });
  }
}
