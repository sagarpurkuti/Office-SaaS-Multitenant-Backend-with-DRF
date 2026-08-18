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

export async function parseJsonBody(res: Response): Promise<ApiErrorBody | unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}
