import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import type { AppEnv } from "../env";
import { requireAdmin } from "./auth";

describe("requireAdmin", () => {
  it("returns a normalized 403 for a regular user", async () => {
    const app = new Hono<AppEnv>();
    app.use("*", async (context, next) => {
      context.set("requestId", "test-request");
      context.set("authUserId", "user_123");
      context.set("profileRole", "user");
      await next();
    });
    app.use("/admin", requireAdmin);
    app.get("/admin", (context) => context.json({ data: true }));

    const response = await app.request("/admin");
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "admin_required",
        message: "Ce compte ne possède pas les droits administrateur.",
        requestId: "test-request",
      },
    });
  });
});
