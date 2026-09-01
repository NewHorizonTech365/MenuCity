import { verifyToken } from "@clerk/backend";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { createDatabase } from "../db/client";
import { profiles } from "../db/schema";
import type { AppEnv } from "../env";
import { fail } from "../lib/http";

const bearerToken = (value?: string) => {
  if (!value?.startsWith("Bearer ")) return null;
  return value.slice("Bearer ".length).trim() || null;
};

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = bearerToken(c.req.header("Authorization"));
  if (!token) return fail(c, 401, "authentication_required", "Une connexion est requise.");

  try {
    const authorizedParties = c.env.CLERK_AUTHORIZED_PARTIES
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const verified = await verifyToken(token, {
      jwtKey: c.env.CLERK_JWT_KEY,
      ...(authorizedParties?.length ? { authorizedParties } : {}),
    });
    if (!verified.sub) {
      return fail(c, 401, "invalid_session", "La session est invalide.");
    }

    const db = createDatabase(c.env.DATABASE_URL);
    let [profile] = await db.select().from(profiles).where(eq(profiles.userId, verified.sub)).limit(1);
    if (!profile) {
      [profile] = await db.insert(profiles).values({ userId: verified.sub }).returning();
    }

    c.set("authUserId", verified.sub);
    c.set("profileRole", profile?.role === "admin" ? "admin" : "user");
    await next();
  } catch {
    return fail(c, 401, "invalid_session", "La session a expiré ou n’est pas valide.");
  }
});

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  if (c.get("profileRole") !== "admin") {
    return fail(c, 403, "admin_required", "Ce compte ne possède pas les droits administrateur.");
  }
  await next();
});
