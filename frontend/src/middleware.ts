import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TENANT_COOKIE } from "@/modules/tenant/config";
import { hostnameFromHeader, isPlatformHostname } from "@/shared/config/hosts";

function isAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isAsset(pathname) || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const hostname = hostnameFromHeader(request.headers.get("host"));
  const tenantPortal = hostname.length > 0 && !isPlatformHostname(hostname);

  if (!tenantPortal) {
    return NextResponse.next();
  }

  const hasSession =
    request.cookies.has(TENANT_COOKIE.access) ||
    request.cookies.has(TENANT_COOKIE.refresh);

  const isLogin = pathname === "/login" || pathname === "/app/login";

  if (!hasSession && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (hasSession && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const rewrite = request.nextUrl.clone();
  if (pathname === "/" || pathname === "") {
    rewrite.pathname = "/app";
    return NextResponse.rewrite(rewrite);
  }
  if (pathname === "/login") {
    rewrite.pathname = "/app/login";
    return NextResponse.rewrite(rewrite);
  }
  if (!pathname.startsWith("/app")) {
    rewrite.pathname = `/app${pathname}`;
    return NextResponse.rewrite(rewrite);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
