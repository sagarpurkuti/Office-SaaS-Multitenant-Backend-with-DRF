import { NextRequest, NextResponse } from "next/server";
import { ApiError, parseJsonBody, type ApiErrorBody } from "@/shared/api/errors";
import { djangoApiBase } from "@/shared/config/env";
import { isValidTenantHost } from "@/modules/tenant/lib/host";
import {
  clearTenantSession,
  readTenantCookies,
  writeTenantSession,
} from "@/modules/tenant/server/cookies";
import { djangoRefresh } from "@/modules/tenant/server/django";

export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(request, ctx);
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(request, ctx);
}

export async function PUT(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(request, ctx);
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(request, ctx);
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(request, ctx);
}

async function proxy(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const session = await readTenantCookies();
  if (!session.host || !isValidTenantHost(session.host)) {
    return NextResponse.json({ error: "No tenant session." }, { status: 401 });
  }

  const { path } = await ctx.params;
  const djangoPath = `/${(path || []).join("/")}`;
  const search = request.nextUrl.search;
  const hasBody = !["GET", "HEAD"].includes(request.method);
  const incomingBody = hasBody ? await request.text() : undefined;

  async function forward(access: string | null) {
    const headers = new Headers();
    headers.set("Accept", "application/json");
    headers.set("Host", session.host!);
    headers.set("X-Forwarded-Host", session.host!);
    headers.set("X-Tenant-Host", session.host!);
    if (access) headers.set("Authorization", `Bearer ${access}`);
    const contentType = request.headers.get("content-type");
    if (contentType && hasBody) headers.set("Content-Type", contentType);

    const slashPath = djangoPath.endsWith("/") || djangoPath.includes("?") ? djangoPath : `${djangoPath}/`;
    return fetch(`${djangoApiBase()}${slashPath}${search}`, {
      method: request.method,
      headers,
      body: incomingBody,
      cache: "no-store",
    });
  }

  let access = session.access;
  let res = await forward(access);

  if (res.status === 401 && session.refresh) {
    try {
      const tokens = await djangoRefresh(session.host, session.refresh);
      access = tokens.access;
      await writeTenantSession({
        access: tokens.access,
        refresh: tokens.refresh || session.refresh,
        host: session.host,
      });
      res = await forward(access);
    } catch {
      await clearTenantSession();
      return NextResponse.json({ error: "Session expired." }, { status: 401 });
    }
  }

  const payload = await parseJsonBody(res);
  if (!res.ok) {
    return NextResponse.json(payload as ApiErrorBody, { status: res.status });
  }
  return NextResponse.json(payload, { status: res.status });
}
