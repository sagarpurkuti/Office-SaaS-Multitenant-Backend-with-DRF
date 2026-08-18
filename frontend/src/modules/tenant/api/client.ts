import { ApiError, parseJsonBody, type ApiErrorBody } from "@/shared/api/errors";
import { TENANT_ROUTES } from "../config";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);
  if (body !== undefined) headers.set("Content-Type", "application/json");

  const res = await fetch(path, {
    ...rest,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    const refreshed = await fetch(`${TENANT_ROUTES.bff}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshed.ok) {
      const retry = await fetch(path, {
        ...rest,
        headers,
        credentials: "include",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (!retry.ok) {
        const errBody = (await parseJsonBody(retry)) as ApiErrorBody;
        throw new ApiError(retry.status, errBody);
      }
      if (retry.status === 204) return undefined as T;
      return (await parseJsonBody(retry)) as T;
    }
  }

  if (!res.ok) {
    const errBody = (await parseJsonBody(res)) as ApiErrorBody;
    throw new ApiError(res.status, errBody);
  }
  if (res.status === 204) return undefined as T;
  return (await parseJsonBody(res)) as T;
}

export const tenantBff = {
  login: (email: string, password: string) =>
    request<{ user: import("../types").TenantUser; tenantHost: string }>(
      `${TENANT_ROUTES.bff}/auth/login/`,
      { method: "POST", body: { email, password } },
    ),
  logout: () =>
    request<{ detail: string }>(`${TENANT_ROUTES.bff}/auth/logout/`, {
      method: "POST",
    }),
  session: () =>
    request<import("../types").TenantSession>(`${TENANT_ROUTES.bff}/session/`),
  django: <T>(djangoPath: string, options: RequestOptions = {}) => {
    const clean = djangoPath.startsWith("/") ? djangoPath.slice(1) : djangoPath;
    return request<T>(`${TENANT_ROUTES.bff}/proxy/${clean}`, options);
  },
};
