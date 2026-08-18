import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
  getStoredUser,
} from "./auth-storage";
import type { ApiErrorBody, LoginResponse } from "./types";

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    const message =
      body.error ||
      body.detail ||
      (Array.isArray(body.non_field_errors)
        ? body.non_field_errors.join(", ")
        : null) ||
      `Request failed (${status})`;
    super(message);
    this.status = status;
    this.body = body;
  }
}

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "https://office-saas-api.onrender.com").replace(
    /\/$/,
    "",
  );
  // return (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(
  //   /\/$/,
  //   "",
  // );
}

async function parseBody(res: Response): Promise<ApiErrorBody | unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${apiBase()}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    clearSession();
    return null;
  }
  const data = (await res.json()) as { access: string; refresh?: string };
  const user = getStoredUser();
  if (user) {
    setSession(data.access, data.refresh || refresh, user);
  }
  return data.access;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);
  if (body !== undefined) headers.set("Content-Type", "application/json");

  if (auth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const doFetch = () =>
    fetch(`${apiBase()}${path.startsWith("/") ? path : `/${path}`}`, {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 401 && auth) {
    const next = await refreshAccessToken();
    if (next) {
      headers.set("Authorization", `Bearer ${next}`);
      res = await doFetch();
    }
  }

  if (!res.ok) {
    const errBody = (await parseBody(res)) as ApiErrorBody;
    throw new ApiError(res.status, errBody);
  }

  if (res.status === 204) return undefined as T;
  return (await parseBody(res)) as T;
}

export async function loginRequest(email: string, password: string) {
  return apiRequest<LoginResponse>("/api/auth/login/", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
}

export async function logoutRequest() {
  const refresh = getRefreshToken();
  if (!refresh) return;
  try {
    await apiRequest("/api/auth/logout/", {
      method: "POST",
      body: { refresh },
    });
  } catch {
    // ignore
  }
}
