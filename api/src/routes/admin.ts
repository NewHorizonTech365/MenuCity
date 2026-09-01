import { and, asc, avg, count, eq, ne } from "drizzle-orm";
import { Hono } from "hono";
import {
  menuItemPatchSchema,
  menuItemWriteSchema,
  restaurantPatchSchema,
  restaurantWriteSchema,
} from "../contracts";
import { createDatabase } from "../db/client";
import { menuItems, restaurants } from "../db/schema";
import type { AppEnv } from "../env";
import { fail, ok } from "../lib/http";
import { toMenuItem, toRestaurantSummary } from "../lib/mappers";

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.get("/restaurants", async (c) => {
  const db = createDatabase(c.env.DATABASE_URL);
  const rows = await db.select().from(restaurants).where(ne(restaurants.status, "archived")).orderBy(asc(restaurants.name)).limit(200);
  return c.json({ data: rows.map(toRestaurantSummary), meta: { count: rows.length } });
});

adminRoutes.post("/restaurants", async (c) => {
  const parsed = restaurantWriteSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return fail(c, 422, "validation_error", "Le restaurant est invalide.", parsed.error.flatten().fieldErrors);
  }
  const db = createDatabase(c.env.DATABASE_URL);
  const [created] = await db
    .insert(restaurants)
    .values({
      ...parsed.data,
      averageRating: String(parsed.data.averageRating),
      createdBy: c.get("authUserId"),
      updatedBy: c.get("authUserId"),
    })
    .returning();
  return ok(c, toRestaurantSummary(created), 201);
});

adminRoutes.get("/restaurants/:id", async (c) => {
  const db = createDatabase(c.env.DATABASE_URL);
  const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, c.req.param("id"))).limit(1);
  if (!restaurant) return fail(c, 404, "restaurant_not_found", "Restaurant introuvable.");
  const items = await db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurant.id)).orderBy(asc(menuItems.sortOrder));
  return ok(c, { ...toRestaurantSummary(restaurant), menu: items.map((item) => toMenuItem(item)) });
});

adminRoutes.patch("/restaurants/:id", async (c) => {
  const parsed = restaurantPatchSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return fail(c, 422, "validation_error", "Le restaurant est invalide.", parsed.error.flatten().fieldErrors);
  }
  const { averageRating, ...rest } = parsed.data;
  const values = {
    ...rest,
    ...(averageRating === undefined ? {} : { averageRating: String(averageRating) }),
    updatedBy: c.get("authUserId"),
    updatedAt: new Date(),
  };
  const db = createDatabase(c.env.DATABASE_URL);
  const [updated] = await db.update(restaurants).set(values).where(eq(restaurants.id, c.req.param("id"))).returning();
  if (!updated) return fail(c, 404, "restaurant_not_found", "Restaurant introuvable.");
  return ok(c, toRestaurantSummary(updated));
});

adminRoutes.delete("/restaurants/:id", async (c) => {
  const db = createDatabase(c.env.DATABASE_URL);
  const [archived] = await db
    .update(restaurants)
    .set({ status: "archived", updatedBy: c.get("authUserId"), updatedAt: new Date() })
    .where(eq(restaurants.id, c.req.param("id")))
    .returning({ id: restaurants.id });
  if (!archived) return fail(c, 404, "restaurant_not_found", "Restaurant introuvable.");
  return c.body(null, 204);
});

adminRoutes.post("/restaurants/:id/menu-items", async (c) => {
  const parsed = menuItemWriteSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return fail(c, 422, "validation_error", "Le plat est invalide.", parsed.error.flatten().fieldErrors);
  }
  const db = createDatabase(c.env.DATABASE_URL);
  const [restaurant] = await db.select({ id: restaurants.id }).from(restaurants).where(and(eq(restaurants.id, c.req.param("id")), ne(restaurants.status, "archived"))).limit(1);
  if (!restaurant) return fail(c, 404, "restaurant_not_found", "Restaurant introuvable.");
  const [created] = await db
    .insert(menuItems)
    .values({ ...parsed.data, restaurantId: restaurant.id, priceAmount: String(parsed.data.priceAmount) })
    .returning();
  return ok(c, toMenuItem(created), 201);
});

adminRoutes.patch("/menu-items/:id", async (c) => {
  const parsed = menuItemPatchSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return fail(c, 422, "validation_error", "Le plat est invalide.", parsed.error.flatten().fieldErrors);
  }
  const { priceAmount, ...rest } = parsed.data;
  const values = {
    ...rest,
    ...(priceAmount === undefined ? {} : { priceAmount: String(priceAmount) }),
    updatedAt: new Date(),
  };
  const db = createDatabase(c.env.DATABASE_URL);
  const [updated] = await db.update(menuItems).set(values).where(eq(menuItems.id, c.req.param("id"))).returning();
  if (!updated) return fail(c, 404, "menu_item_not_found", "Plat introuvable.");
  return ok(c, toMenuItem(updated));
});

adminRoutes.delete("/menu-items/:id", async (c) => {
  const db = createDatabase(c.env.DATABASE_URL);
  const [updated] = await db
    .update(menuItems)
    .set({ isAvailable: false, updatedAt: new Date() })
    .where(eq(menuItems.id, c.req.param("id")))
    .returning({ id: menuItems.id });
  if (!updated) return fail(c, 404, "menu_item_not_found", "Plat introuvable.");
  return c.body(null, 204);
});

adminRoutes.get("/stats", async (c) => {
  const db = createDatabase(c.env.DATABASE_URL);
  const [[restaurantStats], [menuStats]] = await Promise.all([
    db.select({ total: count() }).from(restaurants).where(ne(restaurants.status, "archived")),
    db.select({ total: count(), averagePrice: avg(menuItems.priceAmount) }).from(menuItems).where(eq(menuItems.isAvailable, true)),
  ]);
  return ok(c, {
    restaurants: restaurantStats?.total ?? 0,
    menuItems: menuStats?.total ?? 0,
    averageMenuPrice: Number(menuStats?.averagePrice ?? 0),
  });
});
