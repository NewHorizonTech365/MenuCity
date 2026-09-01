import { and, asc, eq, ilike, or } from "drizzle-orm";
import { Hono } from "hono";
import { createDatabase } from "../db/client";
import { menuItemPhotos, menuItems, restaurantPhotos, restaurants } from "../db/schema";
import type { AppEnv } from "../env";
import { fail, ok } from "../lib/http";
import { toMedia, toMenuItem, toRestaurantSummary } from "../lib/mappers";

export const publicRoutes = new Hono<AppEnv>();

publicRoutes.get("/restaurants", async (c) => {
  const db = createDatabase(c.env.DATABASE_URL);
  const query = c.req.query("query")?.trim().slice(0, 120);
  const cuisine = c.req.query("cuisine")?.trim().slice(0, 120);
  const conditions = [eq(restaurants.status, "published")];

  if (query) {
    const pattern = `%${query}%`;
    conditions.push(
      or(
        ilike(restaurants.name, pattern),
        ilike(restaurants.cuisine, pattern),
        ilike(restaurants.description, pattern),
      )!,
    );
  }
  if (cuisine) conditions.push(ilike(restaurants.cuisine, `%${cuisine}%`));

  const rows = await db
    .select()
    .from(restaurants)
    .where(and(...conditions))
    .orderBy(asc(restaurants.name))
    .limit(100);

  return c.json({ data: rows.map(toRestaurantSummary), meta: { count: rows.length } });
});

publicRoutes.get("/restaurants/:id", async (c) => {
  const db = createDatabase(c.env.DATABASE_URL);
  const id = c.req.param("id");
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, id), eq(restaurants.status, "published")))
    .limit(1);

  if (!restaurant) return fail(c, 404, "restaurant_not_found", "Restaurant introuvable.");

  const [photos, items] = await Promise.all([
    db.select().from(restaurantPhotos).where(eq(restaurantPhotos.restaurantId, id)).orderBy(asc(restaurantPhotos.sortOrder)),
    db.select().from(menuItems).where(and(eq(menuItems.restaurantId, id), eq(menuItems.isAvailable, true))).orderBy(asc(menuItems.sortOrder)),
  ]);

  const itemIds = items.map((item) => item.id);
  const itemPhotos = itemIds.length
    ? await db.query.menuItemPhotos.findMany({
        where: (table, { inArray }) => inArray(table.menuItemId, itemIds),
        orderBy: (table, { asc: orderAsc }) => [orderAsc(table.sortOrder)],
      })
    : [];

  return ok(c, {
    ...toRestaurantSummary(restaurant),
    photos: photos.map(toMedia),
    menu: items.map((item) => toMenuItem(item, itemPhotos)),
  });
});
