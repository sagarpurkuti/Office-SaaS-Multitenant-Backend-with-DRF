export type ApiErrorBody = {
  error?: string;
  detail?: string;
  non_field_errors?: string[];
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(messageFromBody(status, body));
    this.status = status;
    this.body = body;
  }
}

export function messageFromBody(status: number, body: ApiErrorBody): string {
  if (typeof body.error === "string" && body.error) return body.error;
  if (typeof body.detail === "string" && body.detail) return body.detail;
  if (Array.isArray(body.non_field_errors) && body.non_field_errors.length) {
    return body.non_field_errors.join(", ");
  }
  return `Request failed (${status})`;
}

/**
 * Flattens a DRF validation body into `field -> message`.
 *
 * Nested serializers are keyed with a dot, so `{"profile": {"dob": [...]}}`
 * becomes `{"profile.dob": "..."}` and a form can look messages up directly.
 */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};

  const messages: Record<string, string> = {};
  const walk = (value: unknown, path: string[]) => {
    if (!path.length && (value === null || typeof value !== "object")) return;
    if (Array.isArray(value)) {
      const text = value.filter((item) => typeof item === "string").join(" ");
      if (text) messages[path.join(".")] = text;
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, nested] of Object.entries(value)) {
        walk(nested, [...path, key]);
      }
      return;
    }
    if (typeof value === "string") messages[path.join(".")] = value;
  };

  walk(error.body, []);
  return messages;
}

export async function parseJsonBody(res: Response): Promise<ApiErrorBody | unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}
