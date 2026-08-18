import { NextResponse } from "next/server";
import { djangoFetch } from "@/modules/tenant/server/django";
import { clearTenantSession, readTenantCookies } from "@/modules/tenant/server/cookies";

export async function POST() {
  const session = await readTenantCookies();
  if (session.host && session.refresh) {
    try {
      await djangoFetch("/api/auth/logout/", {
        method: "POST",
        host: session.host,
        access: session.access,
        body: { refresh: session.refresh },
      });
    } catch {
      // still clear local session
    }
  }
  await clearTenantSession();
  return NextResponse.json({ detail: "Signed out." });
}
