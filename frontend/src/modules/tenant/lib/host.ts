/** Normalize a tenant hostname registered in django-tenants Domain.domain. */
export function normalizeTenantHost(raw: string): string {
  let value = raw.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "");
  value = value.split("/")[0] ?? value;
  value = value.split(":")[0] ?? value;
  return value;
}

export function isValidTenantHost(host: string): boolean {
  return /^[a-z0-9][a-z0-9.-]*[a-z0-9]$|^[a-z0-9]$/i.test(host) && host.length <= 253;
}
