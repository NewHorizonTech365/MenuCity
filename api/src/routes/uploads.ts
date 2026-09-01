import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { uploadScopeSchema } from "../contracts";
import { createDatabase } from "../db/client";
import { menuItemPhotos, menuItems, profiles, restaurantPhotos, restaurants } from "../db/schema";
import type { AppEnv } from "../env";
import { fail, ok } from "../lib/http";
import { matchesImageSignature, readBodyWithinLimit } from "../lib/media";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const uploadRoutes = new Hono<AppEnv>();

uploadRoutes.put("/:scope/:ownerId", async (c) => {
  const media = c.env.MEDIA;
  if (!media) {
    return fail(c, 503, "media_storage_unavailable", "L’envoi d’images n’est pas activé.");
  }

  const parsedScope = uploadScopeSchema.safeParse(c.req.param("scope"));
  if (!parsedScope.success) return fail(c, 404, "upload_scope_not_found", "Type de média inconnu.");

  const scope = parsedScope.data;
  const ownerId = c.req.param("ownerId");
  const isProfile = scope === "profile-avatar" || scope === "profile-cover";
  const isAdminScope = !isProfile;
  if (isProfile && ownerId !== "me" && ownerId !== c.get("authUserId")) {
    return fail(c, 403, "upload_forbidden", "Vous ne pouvez pas modifier ce profil.");
  }
  if (isAdminScope && c.get("profileRole") !== "admin") {
    return fail(c, 403, "admin_required", "Les droits administrateur sont requis.");
  }

  const contentType = c.req.header("Content-Type")?.split(";")[0].trim().toLowerCase() ?? "";
  const extension = EXTENSIONS[contentType];
  if (!extension) return fail(c, 415, "unsupported_media_type", "Formats acceptés : JPEG, PNG et WebP.");

  const contentLength = c.req.header("Content-Length");
  const declaredLength = contentLength ? Number(contentLength) : null;
  if (declaredLength !== null && (!Number.isFinite(declaredLength) || declaredLength <= 0 || declaredLength > MAX_UPLOAD_BYTES)) {
    return fail(c, 413, "upload_too_large", "L’image doit peser au maximum 5 Mo.");
  }
  const body = await readBodyWithinLimit(c.req.raw.body, MAX_UPLOAD_BYTES);
  if (!body?.byteLength) {
    return fail(c, 413, "upload_too_large", "L’image doit peser au maximum 5 Mo.");
  }
  if (!matchesImageSignature(contentType, body)) {
    return fail(c, 415, "invalid_media_content", "Le contenu du fichier ne correspond pas à une image valide.");
  }

  const db = createDatabase(c.env.DATABASE_URL);
  const userId = c.get("authUserId");
  let prefix = `profiles/${userId}`;
  let previousKey: string | null = null;

  if (scope.startsWith("restaurant-")) {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, ownerId)).limit(1);
    if (!restaurant) return fail(c, 404, "restaurant_not_found", "Restaurant introuvable.");
    prefix = `restaurants/${restaurant.id}`;
    if (scope === "restaurant-main") previousKey = restaurant.mainImageKey;
    if (scope === "restaurant-logo") previousKey = restaurant.logoKey;
  }
  if (scope === "menu-item-photo") {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, ownerId)).limit(1);
    if (!item) return fail(c, 404, "menu_item_not_found", "Plat introuvable.");
    prefix = `menu-items/${item.id}`;
  }
  if (scope === "profile-avatar" || scope === "profile-cover") {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    previousKey = scope === "profile-avatar" ? profile?.avatarKey ?? null : profile?.coverKey ?? null;
  }

  const key = `${prefix}/${crypto.randomUUID()}.${extension}`;
  const baseUrl = new URL(c.req.url).origin;
  const url = `${baseUrl}/media/${key}`;

  await media.put(key, body, {
    httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { scope, ownerId, uploadedBy: userId },
  });

  try {
    if (scope === "profile-avatar") {
      await db.update(profiles).set({ avatarUrl: url, avatarKey: key, updatedAt: new Date() }).where(eq(profiles.userId, userId));
    } else if (scope === "profile-cover") {
      await db.update(profiles).set({ coverUrl: url, coverKey: key, updatedAt: new Date() }).where(eq(profiles.userId, userId));
    } else if (scope === "restaurant-main") {
      await db.update(restaurants).set({ mainImageUrl: url, mainImageKey: key, updatedBy: userId, updatedAt: new Date() }).where(eq(restaurants.id, ownerId));
    } else if (scope === "restaurant-logo") {
      await db.update(restaurants).set({ logoUrl: url, logoKey: key, updatedBy: userId, updatedAt: new Date() }).where(eq(restaurants.id, ownerId));
    } else if (scope === "restaurant-photo") {
      const [created] = await db.insert(restaurantPhotos).values({ restaurantId: ownerId, url, storageKey: key }).returning();
      return ok(c, { id: created.id, url, key }, 201);
    } else {
      const [created] = await db.insert(menuItemPhotos).values({ menuItemId: ownerId, url, storageKey: key }).returning();
      return ok(c, { id: created.id, url, key }, 201);
    }
  } catch (error) {
    await media.delete(key);
    throw error;
  }

  if (previousKey && previousKey !== key) c.executionCtx.waitUntil(media.delete(previousKey));
  return ok(c, { url, key }, 201);
});

uploadRoutes.delete("/restaurant-photo/:id", async (c) => {
  if (c.get("profileRole") !== "admin") return fail(c, 403, "admin_required", "Les droits administrateur sont requis.");
  const db = createDatabase(c.env.DATABASE_URL);
  const [deleted] = await db.delete(restaurantPhotos).where(eq(restaurantPhotos.id, c.req.param("id"))).returning();
  if (!deleted) return fail(c, 404, "media_not_found", "Média introuvable.");
  if (deleted.storageKey && c.env.MEDIA) c.executionCtx.waitUntil(c.env.MEDIA.delete(deleted.storageKey));
  return c.body(null, 204);
});

uploadRoutes.delete("/menu-item-photo/:id", async (c) => {
  if (c.get("profileRole") !== "admin") return fail(c, 403, "admin_required", "Les droits administrateur sont requis.");
  const db = createDatabase(c.env.DATABASE_URL);
  const [deleted] = await db.delete(menuItemPhotos).where(and(eq(menuItemPhotos.id, c.req.param("id")))).returning();
  if (!deleted) return fail(c, 404, "media_not_found", "Média introuvable.");
  if (deleted.storageKey && c.env.MEDIA) c.executionCtx.waitUntil(c.env.MEDIA.delete(deleted.storageKey));
  return c.body(null, 204);
});
