import { normalizeTenantHost } from "@/modules/tenant/lib/host";

const DEFAULT_PLATFORM_HOSTS = ["localhost", "127.0.0.1", "::1"];

export function hostnameFromHeader(hostHeader: string | null | undefined): string {
  return normalizeTenantHost(hostHeader || "");
}

export function platformHosts(): string[] {
  const extra = (process.env.NEXT_PUBLIC_PLATFORM_HOSTS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return [...DEFAULT_PLATFORM_HOSTS, ...extra];
}

export function isPlatformHostname(hostname: string): boolean {
  return platformHosts().includes(hostname.toLowerCase());
}

export function platformOrigin(): string {
  return (process.env.NEXT_PUBLIC_PLATFORM_ORIGIN || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}
