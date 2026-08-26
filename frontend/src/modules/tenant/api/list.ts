import { ApiError } from "@/shared/api/errors";

type Paginated<T> = { results: T[]; count?: number };

/**
 * DRF list endpoints return a bare array today, but turn into
 * `{ count, results }` the moment pagination is switched on. Normalising here
 * keeps every feature module immune to that change.
 */
export function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "results" in payload) {
    const results = (payload as Paginated<T>).results;
    if (Array.isArray(results)) return results;
  }
  return [];
}

/** Builds a query string, skipping empty values. */
export function queryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

/**
 * Treats "not found" as an empty result instead of an error — used for
 * endpoints like `attendance/today` that 404 when nothing exists yet.
 */
export async function orNullOn404<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** Same idea for endpoints a role may simply not be allowed to read. */
export async function orNullOnForbidden<T>(
  promise: Promise<T>,
): Promise<T | null> {
  try {
    return await promise;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
      return null;
    }
    throw err;
  }
}
