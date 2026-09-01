import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const profiles = pgTable(
  "profiles",
  {
    userId: text("user_id").primaryKey(),
    phone: text("phone").notNull().default(""),
    bio: text("bio").notNull().default(""),
    avatarUrl: text("avatar_url"),
    avatarKey: text("avatar_key"),
    coverUrl: text("cover_url"),
    coverKey: text("cover_key"),
    role: text("role").notNull().default("user"),
    restaurantsVisited: integer("restaurants_visited").notNull().default(0),
    points: integer("points").notNull().default(0),
    reviewsCount: integer("reviews_count").notNull().default(0),
    preferredCuisines: text("preferred_cuisines").array().notNull().default(sql`ARRAY[]::text[]`),
    recentVisits: jsonb("recent_visits").$type<Array<{ id: string; name: string; cuisine: string; date: string }>>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("profiles_role_check", sql`${table.role} in ('user', 'admin')`),
    check("profiles_non_negative_check", sql`${table.restaurantsVisited} >= 0 and ${table.points} >= 0 and ${table.reviewsCount} >= 0`),
  ],
);

export const restaurants = pgTable(
  "restaurants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    cuisine: text("cuisine").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull().default(""),
    mainImageUrl: text("main_image_url").notNull().default(""),
    mainImageKey: text("main_image_key"),
    logoUrl: text("logo_url").notNull().default(""),
    logoKey: text("logo_key"),
    averageRating: numeric("average_rating", { precision: 2, scale: 1 }).notNull().default("0"),
    priceRange: text("price_range").notNull().default(""),
    description: text("description").notNull().default(""),
    openingHours: text("opening_hours").notNull().default(""),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    specialties: text("specialties").array().notNull().default(sql`ARRAY[]::text[]`),
    status: text("status").notNull().default("draft"),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("restaurants_slug_unique").on(table.slug),
    index("restaurants_status_idx").on(table.status),
    index("restaurants_cuisine_idx").on(table.cuisine),
    check("restaurants_status_check", sql`${table.status} in ('draft', 'published', 'archived')`),
    check("restaurants_rating_check", sql`${table.averageRating} >= 0 and ${table.averageRating} <= 5`),
  ],
);

export const restaurantPhotos = pgTable(
  "restaurant_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    storageKey: text("storage_key"),
    altText: text("alt_text").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("restaurant_photos_restaurant_idx").on(table.restaurantId, table.sortOrder)],
);

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    priceAmount: numeric("price_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("USD"),
    isAvailable: boolean("is_available").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("menu_items_restaurant_idx").on(table.restaurantId, table.sortOrder),
    check("menu_items_price_check", sql`${table.priceAmount} >= 0`),
    check("menu_items_currency_check", sql`char_length(${table.currency}) = 3`),
  ],
);

export const menuItemPhotos = pgTable(
  "menu_item_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    menuItemId: uuid("menu_item_id").notNull().references(() => menuItems.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    storageKey: text("storage_key"),
    altText: text("alt_text").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("menu_item_photos_item_idx").on(table.menuItemId, table.sortOrder)],
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inviterUserId: text("inviter_user_id").notNull(),
    restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "restrict" }),
    inviteeEmail: text("invitee_email").notNull(),
    inviteeName: text("invitee_name").notNull().default(""),
    message: text("message").notNull().default(""),
    proposedAt: timestamp("proposed_at", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("invitations_inviter_idx").on(table.inviterUserId, table.createdAt),
    check("invitations_status_check", sql`${table.status} in ('pending', 'accepted', 'declined', 'cancelled')`),
  ],
);

export type ProfileRow = typeof profiles.$inferSelect;
export type RestaurantRow = typeof restaurants.$inferSelect;
export type RestaurantPhotoRow = typeof restaurantPhotos.$inferSelect;
export type MenuItemRow = typeof menuItems.$inferSelect;
export type MenuItemPhotoRow = typeof menuItemPhotos.$inferSelect;
export type InvitationRow = typeof invitations.$inferSelect;
