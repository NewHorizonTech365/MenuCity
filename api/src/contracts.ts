import { z } from "zod";

const nullableUrl = z.string().url().nullable().optional();

export const profilePatchSchema = z
  .object({
    phone: z.string().trim().max(32).optional(),
    bio: z.string().trim().max(500).optional(),
    avatarUrl: nullableUrl,
    coverUrl: nullableUrl,
    preferredCuisines: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  })
  .strict();

export const invitationCreateSchema = z.object({
  restaurantId: z.string().uuid(),
  inviteeEmail: z.string().trim().toLowerCase().email().max(320),
  inviteeName: z.string().trim().min(1).max(120),
  message: z.string().trim().max(1000).default(""),
  proposedAt: z.string().datetime({ offset: true }),
});

export const restaurantWriteSchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(160),
  cuisine: z.string().trim().min(2).max(120),
  address: z.string().trim().min(2).max(300),
  phone: z.string().trim().max(32).default(""),
  mainImageUrl: z.string().url().or(z.literal("")).default(""),
  logoUrl: z.string().url().or(z.literal("")).default(""),
  averageRating: z.number().min(0).max(5).default(0),
  priceRange: z.string().trim().max(80).default(""),
  description: z.string().trim().max(2000).default(""),
  openingHours: z.string().trim().max(300).default(""),
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
  specialties: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const restaurantPatchSchema = restaurantWriteSchema.partial().strict();

export const menuItemWriteSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).default(""),
  priceAmount: z.number().min(0).max(99_999_999),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()).default("USD"),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
});

export const menuItemPatchSchema = menuItemWriteSchema.partial().strict();

export const uploadScopeSchema = z.enum([
  "profile-avatar",
  "profile-cover",
  "restaurant-main",
  "restaurant-logo",
  "restaurant-photo",
  "menu-item-photo",
]);

export type RestaurantWriteInput = z.infer<typeof restaurantWriteSchema>;
export type MenuItemWriteInput = z.infer<typeof menuItemWriteSchema>;

export type RestaurantSummaryDto = {
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  address: string;
  phone: string;
  mainImageUrl: string;
  logoUrl: string;
  averageRating: number;
  priceRange: string;
  description: string;
  openingHours: string;
  latitude: number | null;
  longitude: number | null;
  specialties: string[];
  status: "draft" | "published" | "archived";
};

export type MediaDto = {
  id: string;
  url: string;
  altText: string;
  sortOrder: number;
};

export type MenuItemDto = {
  id: string;
  name: string;
  description: string;
  priceAmount: number;
  currency: string;
  isAvailable: boolean;
  sortOrder: number;
  photos: MediaDto[];
};

export type RestaurantDetailDto = RestaurantSummaryDto & {
  photos: MediaDto[];
  menu: MenuItemDto[];
};
