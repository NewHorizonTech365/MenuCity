import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AppEnv } from "../env";

export const ok = <T>(c: Context<AppEnv>, data: T, status: ContentfulStatusCode = 200) =>
  c.json({ data }, status);

export const fail = (
  c: Context<AppEnv>,
  status: ContentfulStatusCode,
  code: string,
  message: string,
  fields?: Record<string, string[] | undefined>,
) =>
  c.json(
    {
      error: {
        code,
        message,
        requestId: c.get("requestId"),
        ...(fields ? { fields } : {}),
      },
    },
    status,
  );

export const getRequestId = (request: Request) =>
  request.headers.get("cf-ray") ?? request.headers.get("x-request-id") ?? crypto.randomUUID();
