import { NextResponse } from "next/server";
import { ApiError } from "@/shared/api/errors";
import { djangoRefresh } from "@/modules/tenant/server/django";
import {
  clearTenantSession,
  readTenantCookies,
  writeTenantSession,
} from "@/modules/tenant/server/cookies";

export async function POST() {
  const session = await readTenantCookies();
  if (!session.host || !session.refresh) {
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
    return NextResponse.json({ ok: true });
  } catch (err) {
    await clearTenantSession();
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ error: "Session expired." }, { status: 401 });
  }
}
