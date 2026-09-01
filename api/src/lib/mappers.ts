import type {
  InvitationRow,
  MenuItemPhotoRow,
  MenuItemRow,
  ProfileRow,
  RestaurantPhotoRow,
  RestaurantRow,
} from "../db/schema";
import type { MediaDto, MenuItemDto, RestaurantSummaryDto } from "../contracts";

export const toRestaurantSummary = (row: RestaurantRow): RestaurantSummaryDto => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  cuisine: row.cuisine,
  address: row.address,
  phone: row.phone,
  mainImageUrl: row.mainImageUrl,
  logoUrl: row.logoUrl,
  averageRating: Number(row.averageRating),
  priceRange: row.priceRange,
  description: row.description,
  openingHours: row.openingHours,
  latitude: row.latitude,
  longitude: row.longitude,
  specialties: row.specialties,
  status: row.status as RestaurantSummaryDto["status"],
});

export const toMedia = (row: RestaurantPhotoRow | MenuItemPhotoRow): MediaDto => ({
  id: row.id,
  url: row.url,
  altText: row.altText,
  sortOrder: row.sortOrder,
});

export const toMenuItem = (row: MenuItemRow, photos: MenuItemPhotoRow[] = []): MenuItemDto => ({
  id: row.id,
  name: row.name,
  description: row.description,
  priceAmount: Number(row.priceAmount),
  currency: row.currency,
  isAvailable: row.isAvailable,
  sortOrder: row.sortOrder,
  photos: photos.filter((photo) => photo.menuItemId === row.id).map(toMedia),
});

export const toProfile = (row: ProfileRow) => ({
  userId: row.userId,
  phone: row.phone,
  bio: row.bio,
  avatarUrl: row.avatarUrl,
  coverUrl: row.coverUrl,
  role: row.role === "admin" ? "admin" : "user",
  restaurantsVisited: row.restaurantsVisited,
  points: row.points,
  reviewsCount: row.reviewsCount,
  preferredCuisines: row.preferredCuisines,
  recentVisits: row.recentVisits,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const toInvitation = (row: InvitationRow) => ({
  id: row.id,
  restaurantId: row.restaurantId,
  inviteeEmail: row.inviteeEmail,
  inviteeName: row.inviteeName,
  message: row.message,
  proposedAt: row.proposedAt.toISOString(),
  status: row.status,
  createdAt: row.createdAt.toISOString(),
});
