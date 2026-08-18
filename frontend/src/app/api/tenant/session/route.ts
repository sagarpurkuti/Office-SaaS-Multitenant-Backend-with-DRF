import { NextResponse } from "next/server";
import { ApiError } from "@/shared/api/errors";
import { djangoMe, djangoRefresh } from "@/modules/tenant/server/django";
import {
  clearTenantSession,
  readTenantCookies,
  writeTenantSession,
} from "@/modules/tenant/server/cookies";
import { isTenantWorkspaceUser } from "@/modules/tenant/auth/roles";

export async function GET() {
  const session = await readTenantCookies();
  if (!session.host) {
    return NextResponse.json({ error: "No tenant session." }, { status: 401 });
  }

  async function loadUser(access: string) {
    const user = await djangoMe(session.host!, access);
    if (!isTenantWorkspaceUser(user)) {
      await clearTenantSession();
      throw new ApiError(403, { error: "Not a tenant workspace user." });
    }
    return user;
  }

  try {
    if (session.access) {
      const user = await loadUser(session.access);
      return NextResponse.json({ user, tenantHost: session.host });
    }
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) {
      if (err instanceof ApiError) {
        return NextResponse.json(err.body, { status: err.status });
      }
      return NextResponse.json({ error: "Unable to load session." }, { status: 502 });
    }
  }

  if (!session.refresh) {
    await clearTenantSession();
    return NextResponse.json({ error: "No tenant session." }, { status: 401 });
  }

  try {
    const tokens = await djangoRefresh(session.host, session.refresh);
    await writeTenantSession({
      access: tokens.access,
      refresh: tokens.refresh || session.refresh,
      host: session.host,
    });
    const user = await loadUser(tokens.access);
    return NextResponse.json({ user, tenantHost: session.host });
  } catch (err) {
    await clearTenantSession();
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ error: "Session expired." }, { status: 401 });
  }
}
