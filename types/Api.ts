export type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    requestId: string;
    fields?: Record<string, string[]>;
  };
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

export type RestaurantDto = {
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
  photos?: MediaDto[];
  menu?: MenuItemDto[];
};

export type ProfileDto = {
  userId: string;
  phone: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  role: "user" | "admin";
  restaurantsVisited: number;
  points: number;
  reviewsCount: number;
  preferredCuisines: string[];
  recentVisits: { id: string; name: string; cuisine: string; date: string }[];
  createdAt: string;
  updatedAt: string;
};

export type InvitationDto = {
  id: string;
  restaurantId: string;
  inviteeEmail: string;
  inviteeName: string;
  message: string;
  proposedAt: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};
