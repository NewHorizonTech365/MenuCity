import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDatabase } from "../db/client";
import { invitations, profiles, restaurants } from "../db/schema";
import type { AppEnv } from "../env";
import { invitationCreateSchema, profilePatchSchema } from "../contracts";
import { fail, ok } from "../lib/http";
import { toInvitation, toProfile } from "../lib/mappers";

export const meRoutes = new Hono<AppEnv>();

meRoutes.get("/me", async (c) => {
  const db = createDatabase(c.env.DATABASE_URL);
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, c.get("authUserId"))).limit(1);
  if (!profile) return fail(c, 404, "profile_not_found", "Profil introuvable.");
  return ok(c, toProfile(profile));
});

meRoutes.patch("/me", async (c) => {
  const parsed = profilePatchSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return fail(c, 422, "validation_error", "Les données du profil sont invalides.", parsed.error.flatten().fieldErrors);
  }
  const db = createDatabase(c.env.DATABASE_URL);
  const [profile] = await db
    .update(profiles)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(profiles.userId, c.get("authUserId")))
    .returning();
  if (!profile) return fail(c, 404, "profile_not_found", "Profil introuvable.");
  return ok(c, toProfile(profile));
});

meRoutes.get("/invitations", async (c) => {
  const db = createDatabase(c.env.DATABASE_URL);
  const rows = await db
    .select()
    .from(invitations)
    .where(eq(invitations.inviterUserId, c.get("authUserId")))
    .orderBy(desc(invitations.createdAt))
    .limit(100);
  return c.json({ data: rows.map(toInvitation), meta: { count: rows.length } });
});

meRoutes.post("/invitations", async (c) => {
  const parsed = invitationCreateSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return fail(c, 422, "validation_error", "L’invitation est invalide.", parsed.error.flatten().fieldErrors);
  }
  const db = createDatabase(c.env.DATABASE_URL);
  const [restaurant] = await db
    .select({ id: restaurants.id })
    .from(restaurants)
    .where(eq(restaurants.id, parsed.data.restaurantId))
    .limit(1);
  if (!restaurant) return fail(c, 404, "restaurant_not_found", "Restaurant introuvable.");

  const [created] = await db
    .insert(invitations)
    .values({
      ...parsed.data,
      proposedAt: new Date(parsed.data.proposedAt),
      inviterUserId: c.get("authUserId"),
    })
    .returning();
  return ok(c, toInvitation(created), 201);
});
