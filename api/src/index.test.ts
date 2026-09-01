import { describe, expect, it } from "vitest";
import app from "./index";

describe("optional media storage", () => {
  it("keeps the Worker usable when no R2 binding is configured", async () => {
    const response = await app.request(
      "/media/profiles/example/avatar.jpg",
      undefined,
      {
        DATABASE_URL: "postgresql://unused",
        CLERK_JWT_KEY: "unused",
        ALLOWED_ORIGINS: "http://localhost:8081",
      },
    );

    expect(response.status).toBe(503);
    const payload = await response.json() as {
      error: { requestId: string };
    };
    expect(payload).toMatchObject({
      error: {
        code: "media_storage_unavailable",
        message: "Le stockage des médias n’est pas activé.",
      },
    });
    expect(payload.error.requestId).toEqual(expect.any(String));
  });
});
