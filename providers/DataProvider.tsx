import * as Crypto from "expo-crypto";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { restaurantsLubumbashi } from "../data/restaurants";
import { apiRequest, isApiConfigured } from "../lib/api";
import { loadJson, saveJson, STORAGE_KEYS } from "../lib/storage";
import type { InvitationDto, MenuItemDto, RestaurantDto } from "../types/Api";
import type { Restaurant } from "../types/Restaurant";
import { useAuth } from "./AuthProvider";

type MenuItem = NonNullable<Restaurant["menu"]>[number];

export type InvitationInput = {
  restaurantId: string;
  inviteEmail: string;
  inviteNom: string;
  message: string;
  dateProposee: string;
  heureProposee: string;
};

type DataContextType = {
  restaurants: Restaurant[];
  archivedRestaurants: Restaurant[];
  isLoading: boolean;
  isOffline: boolean;
  reload: () => Promise<void>;
  getRestaurant: (id: string) => Promise<Restaurant | null>;
  createInvitation: (input: InvitationInput) => Promise<InvitationDto>;
  addRestaurant: (restaurant: Partial<Restaurant>) => Promise<Restaurant>;
  updateRestaurant: (id: string, patch: Partial<Restaurant>) => Promise<Restaurant | null>;
  deleteRestaurant: (id: string) => Promise<void>;
  restoreRestaurant: (id: string) => Promise<Restaurant | null>;
  addMenuItem: (restaurantId: string, item: Partial<MenuItem>) => Promise<MenuItem | null>;
  updateMenuItem: (restaurantId: string, itemId: string, patch: Partial<MenuItem>) => Promise<MenuItem | null>;
  deleteMenuItem: (restaurantId: string, itemId: string) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<void>;
};

export const DataContext = createContext<DataContextType | null>(null);

const formatPrice = (amount: number, currency: string) => `${amount.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${currency}`;
const coordinateKey = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const seedRestaurants = new Map(restaurantsLubumbashi.map((restaurant) => [coordinateKey(restaurant.nom), restaurant]));
const withFallbackProductData = (restaurant: Restaurant): Restaurant => {
  const fallback = seedRestaurants.get(coordinateKey(restaurant.nom));
  const latitude = Number(restaurant.latitude);
  const longitude = Number(restaurant.longitude);
  return {
    ...fallback,
    ...restaurant,
    latitude: Number.isFinite(latitude) ? latitude : fallback?.latitude,
    longitude: Number.isFinite(longitude) ? longitude : fallback?.longitude,
    openingPeriods: restaurant.openingPeriods ?? fallback?.openingPeriods,
    services: restaurant.services ?? fallback?.services ?? [],
    paymentMethods: restaurant.paymentMethods ?? fallback?.paymentMethods ?? [],
    isVerified: restaurant.isVerified ?? fallback?.isVerified ?? false,
  };
};

const dtoToRestaurant = (dto: RestaurantDto): Restaurant => ({
  id: dto.id,
  nom: dto.name,
  cuisine: dto.cuisine,
  adresse: dto.address,
  telephone: dto.phone,
  image: dto.mainImageUrl,
  logo: dto.logoUrl,
  photos: dto.photos?.map((photo) => photo.url) || (dto.mainImageUrl ? [dto.mainImageUrl] : []),
  note: dto.averageRating,
  prixMoyen: dto.priceRange,
  description: dto.description,
  horaires: dto.openingHours,
  latitude: dto.latitude ?? undefined,
  longitude: dto.longitude ?? undefined,
  specialites: dto.specialties,
  status: dto.status,
  menu: dto.menu?.map((item) => ({
    id: item.id,
    nom: item.name,
    description: item.description,
    prix: formatPrice(item.priceAmount, item.currency),
    photosMenu: item.photos.map((photo) => photo.url),
  })),
});

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `restaurant-${Crypto.randomUUID().slice(0, 8)}`;

const restaurantPayload = (restaurant: Partial<Restaurant>, current?: Restaurant) => {
  const merged = { ...current, ...restaurant };
  return {
    slug: slugify(merged.nom || "restaurant"),
    name: merged.nom || "Nouveau restaurant",
    cuisine: merged.cuisine || "Divers",
    address: merged.adresse || "Adresse à compléter",
    phone: merged.telephone || "",
    mainImageUrl: merged.image || "",
    logoUrl: merged.logo || "",
    averageRating: merged.note ?? 0,
    priceRange: merged.prixMoyen || "",
    description: merged.description || "",
    openingHours: merged.horaires || "",
    latitude: merged.latitude ?? null,
    longitude: merged.longitude ?? null,
    specialties: merged.specialites || [],
    status: merged.status || "published" as const,
  };
};

const priceAmount = (value?: string) => {
  const parsed = Number((value || "0").replace(/[^0-9,.-]/g, "").replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const currencyFromPrice = (value?: string) => {
  const match = (value || "").toUpperCase().match(/\b(USD|CDF|EUR)\b/);
  return match?.[1] || "USD";
};

const menuPayload = (item: Partial<MenuItem>, sortOrder = 0) => ({
  name: item.nom || "Plat",
  description: item.description || "",
  priceAmount: priceAmount(item.prix),
  currency: currencyFromPrice(item.prix),
  isAvailable: true,
  sortOrder,
});

const seedFallback = () => restaurantsLubumbashi.map((restaurant) => ({
  ...restaurant,
  menu: restaurant.menu?.map((item) => ({ ...item, id: item.id || Crypto.randomUUID() })),
}));

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAuthToken, isDevelopmentSession, user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const restaurantsRef = useRef<Restaurant[]>([]);
  const [archivedRestaurants, setArchivedRestaurants] = useState<Restaurant[]>([]);
  const archivedRestaurantsRef = useRef<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    restaurantsRef.current = restaurants;
  }, [restaurants]);

  useEffect(() => {
    archivedRestaurantsRef.current = archivedRestaurants;
  }, [archivedRestaurants]);

  const loadFallback = useCallback(async () => {
    const [stored, storedArchived] = await Promise.all([
      loadJson(STORAGE_KEYS.RESTAURANTS).catch(() => null),
      loadJson(STORAGE_KEYS.ARCHIVED_RESTAURANTS).catch(() => null),
    ]);
    const source = Array.isArray(stored) ? (stored as Restaurant[]) : seedFallback();
    const fallback = source.filter((restaurant) => restaurant.status !== 'archived').map(withFallbackProductData);
    const archivedRows = [
      ...source.filter((restaurant) => restaurant.status === 'archived'),
      ...(Array.isArray(storedArchived) ? storedArchived as Restaurant[] : []),
    ].map(withFallbackProductData).filter((restaurant, index, rows) => rows.findIndex((row) => row.id === restaurant.id) === index);
    restaurantsRef.current = fallback;
    archivedRestaurantsRef.current = archivedRows;
    setRestaurants(fallback);
    setArchivedRestaurants(archivedRows);
    return fallback;
  }, []);

  const commitLocalRestaurants = useCallback(async (next: Restaurant[]) => {
    restaurantsRef.current = next;
    setRestaurants(next);
    await saveJson(STORAGE_KEYS.RESTAURANTS, next);
  }, []);

  const commitLocalArchivedRestaurants = useCallback(async (next: Restaurant[]) => {
    archivedRestaurantsRef.current = next;
    setArchivedRestaurants(next);
    await saveJson(STORAGE_KEYS.ARCHIVED_RESTAURANTS, next);
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isDevelopmentSession || !isApiConfigured) {
        await loadFallback();
        setIsOffline(false);
        return;
      }
      const isAdmin = user?.role === "admin";
      const rows = await apiRequest<RestaurantDto[]>(isAdmin ? "/v1/admin/restaurants" : "/v1/restaurants", {
        ...(isAdmin ? { getToken: getAuthToken } : {}),
      });
      const normalized = rows.map(dtoToRestaurant).map(withFallbackProductData);
      const activeRows = normalized.filter((restaurant) => restaurant.status !== 'archived');
      const archivedRows = normalized.filter((restaurant) => restaurant.status === 'archived');
      restaurantsRef.current = activeRows;
      setRestaurants(activeRows);
      if (isAdmin) {
        archivedRestaurantsRef.current = archivedRows;
        setArchivedRestaurants(archivedRows);
      }
      setIsOffline(false);
      if (!isAdmin) await saveJson(STORAGE_KEYS.RESTAURANTS, activeRows);
    } catch (error) {
      console.warn("Catalogue distant indisponible, cache public utilisé.", error instanceof Error ? error.message : error);
      setIsOffline(true);
      await loadFallback();
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, isDevelopmentSession, loadFallback, user?.role]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const getRestaurant = useCallback(async (id: string) => {
    if (isDevelopmentSession || !isApiConfigured) {
      return restaurantsRef.current.find((restaurant) => restaurant.id === id)
        || archivedRestaurantsRef.current.find((restaurant) => restaurant.id === id)
        || null;
    }
    try {
      const dto = await apiRequest<RestaurantDto>(`/v1/restaurants/${encodeURIComponent(id)}`);
      const detail = withFallbackProductData(dtoToRestaurant(dto));
      setRestaurants((current) => current.map((restaurant) => (restaurant.id === id ? detail : restaurant)));
      return detail;
    } catch {
      return restaurantsRef.current.find((restaurant) => restaurant.id === id) || null;
    }
  }, [isDevelopmentSession]);

  const createInvitation = async (input: InvitationInput) => {
    const dateMatch = input.dateProposee.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const timeMatch = input.heureProposee.trim().match(/^(\d{1,2})(?:h|:)(\d{2})$/i);
    if (!dateMatch || !timeMatch) throw new Error("Utilisez les formats JJ/MM/AAAA et HHhMM.");
    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const year = Number(dateMatch[3]);
    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    const proposedDate = new Date(year, month - 1, day, hour, minute);
    const isValid =
      proposedDate.getFullYear() === year &&
      proposedDate.getMonth() === month - 1 &&
      proposedDate.getDate() === day &&
      proposedDate.getHours() === hour &&
      proposedDate.getMinutes() === minute;
    if (!isValid) throw new Error("La date proposée est invalide.");
    if (isDevelopmentSession) {
      return {
        id: Crypto.randomUUID(),
        restaurantId: input.restaurantId,
        inviteeEmail: input.inviteEmail,
        inviteeName: input.inviteNom,
        message: input.message,
        proposedAt: proposedDate.toISOString(),
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      };
    }
    return apiRequest<InvitationDto>("/v1/invitations", {
      method: "POST",
      getToken: getAuthToken,
      body: {
        restaurantId: input.restaurantId,
        inviteeEmail: input.inviteEmail,
        inviteeName: input.inviteNom,
        message: input.message,
        proposedAt: proposedDate.toISOString(),
      },
    });
  };

  const addRestaurant = async (restaurant: Partial<Restaurant>) => {
    if (isDevelopmentSession) {
      const created: Restaurant = {
        id: Crypto.randomUUID(),
        nom: restaurant.nom || "Nouveau restaurant",
        cuisine: restaurant.cuisine || "Divers",
        adresse: restaurant.adresse || "Adresse a completer",
        telephone: restaurant.telephone || "",
        image: restaurant.image || "",
        logo: restaurant.logo || "",
        photos: restaurant.photos || [],
        note: restaurant.note ?? 0,
        prixMoyen: restaurant.prixMoyen || "",
        description: restaurant.description || "",
        horaires: restaurant.horaires || "",
        openingPeriods: restaurant.openingPeriods,
        specialites: restaurant.specialites || [],
        quartier: restaurant.quartier,
        commune: restaurant.commune,
        repere: restaurant.repere,
        prixMoyenCdf: restaurant.prixMoyenCdf,
        services: restaurant.services || [],
        paymentMethods: restaurant.paymentMethods || [],
        isVerified: restaurant.isVerified ?? false,
        lastVerifiedAt: restaurant.lastVerifiedAt,
        status: restaurant.status || 'published',
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        menu: restaurant.menu?.map((item) => ({ ...item, id: item.id || Crypto.randomUUID() })) || [],
      };
      await commitLocalRestaurants([created, ...restaurantsRef.current]);
      return created;
    }
    const created = await apiRequest<RestaurantDto>("/v1/admin/restaurants", {
      method: "POST",
      getToken: getAuthToken,
      body: restaurantPayload(restaurant),
    });
    const normalized = dtoToRestaurant(created);
    setRestaurants((current) => [normalized, ...current]);
    return normalized;
  };

  const updateRestaurant = async (id: string, patch: Partial<Restaurant>) => {
    const current = restaurantsRef.current.find((restaurant) => restaurant.id === id);
    if (!current) return null;
    if (isDevelopmentSession) {
      const normalized = { ...current, ...patch, id };
      await commitLocalRestaurants(restaurantsRef.current.map((restaurant) => restaurant.id === id ? normalized : restaurant));
      return normalized;
    }
    const updated = await apiRequest<RestaurantDto>(`/v1/admin/restaurants/${encodeURIComponent(id)}`, {
      method: "PATCH",
      getToken: getAuthToken,
      body: restaurantPayload(patch, current),
    });
    const normalized = dtoToRestaurant(updated);
    setRestaurants((rows) => rows.map((restaurant) => (restaurant.id === id ? normalized : restaurant)));
    return normalized;
  };

  const deleteRestaurant = async (id: string) => {
    const current = restaurantsRef.current.find((restaurant) => restaurant.id === id);
    if (!current) return;
    const archived = { ...current, status: 'archived' as const };
    if (isDevelopmentSession) {
      await Promise.all([
        commitLocalRestaurants(restaurantsRef.current.filter((restaurant) => restaurant.id !== id)),
        commitLocalArchivedRestaurants([archived, ...archivedRestaurantsRef.current.filter((restaurant) => restaurant.id !== id)]),
      ]);
      return;
    }
    await apiRequest<void>(`/v1/admin/restaurants/${encodeURIComponent(id)}`, { method: "DELETE", getToken: getAuthToken });
    setRestaurants((current) => current.filter((restaurant) => restaurant.id !== id));
    archivedRestaurantsRef.current = [archived, ...archivedRestaurantsRef.current.filter((restaurant) => restaurant.id !== id)];
    setArchivedRestaurants(archivedRestaurantsRef.current);
  };

  const restoreRestaurant = async (id: string) => {
    const current = archivedRestaurantsRef.current.find((restaurant) => restaurant.id === id);
    if (!current) return null;
    if (isDevelopmentSession) {
      const restored = { ...current, status: 'published' as const };
      await Promise.all([
        commitLocalArchivedRestaurants(archivedRestaurantsRef.current.filter((restaurant) => restaurant.id !== id)),
        commitLocalRestaurants([restored, ...restaurantsRef.current.filter((restaurant) => restaurant.id !== id)]),
      ]);
      return restored;
    }
    const updated = await apiRequest<RestaurantDto>(`/v1/admin/restaurants/${encodeURIComponent(id)}`, {
      method: "PATCH",
      getToken: getAuthToken,
      body: restaurantPayload({ ...current, status: 'published' }, current),
    });
    const restored = dtoToRestaurant(updated);
    archivedRestaurantsRef.current = archivedRestaurantsRef.current.filter((restaurant) => restaurant.id !== id);
    setArchivedRestaurants(archivedRestaurantsRef.current);
    restaurantsRef.current = [restored, ...restaurantsRef.current.filter((restaurant) => restaurant.id !== id)];
    setRestaurants(restaurantsRef.current);
    return restored;
  };

  const addMenuItem = async (restaurantId: string, item: Partial<MenuItem>) => {
    if (isDevelopmentSession) {
      const normalized: MenuItem = {
        id: Crypto.randomUUID(),
        nom: item.nom || "Plat",
        description: item.description || "",
        prix: item.prix || "0 USD",
        photosMenu: item.photosMenu || [],
      };
      await commitLocalRestaurants(restaurantsRef.current.map((restaurant) => restaurant.id === restaurantId
        ? { ...restaurant, menu: [normalized, ...(restaurant.menu || [])] }
        : restaurant));
      return normalized;
    }
    const created = await apiRequest<MenuItemDto>(`/v1/admin/restaurants/${encodeURIComponent(restaurantId)}/menu-items`, {
      method: "POST",
      getToken: getAuthToken,
      body: menuPayload(item),
    });
    const normalized: MenuItem = {
      id: created.id,
      nom: created.name,
      description: created.description,
      prix: formatPrice(created.priceAmount, created.currency),
      photosMenu: created.photos.map((photo) => photo.url),
    };
    setRestaurants((current) => current.map((restaurant) => restaurant.id === restaurantId
      ? { ...restaurant, menu: [normalized, ...(restaurant.menu || [])] }
      : restaurant));
    return normalized;
  };

  const updateMenuItem = async (restaurantId: string, itemId: string, patch: Partial<MenuItem>) => {
    const restaurant = restaurantsRef.current.find((row) => row.id === restaurantId);
    const current = restaurant?.menu?.find((item) => item.id === itemId);
    if (!current) return null;
    if (isDevelopmentSession) {
      const normalized = { ...current, ...patch, id: itemId };
      await commitLocalRestaurants(restaurantsRef.current.map((row) => row.id === restaurantId
        ? { ...row, menu: row.menu?.map((item) => item.id === itemId ? normalized : item) }
        : row));
      return normalized;
    }
    const updated = await apiRequest<MenuItemDto>(`/v1/admin/menu-items/${encodeURIComponent(itemId)}`, {
      method: "PATCH",
      getToken: getAuthToken,
      body: menuPayload({ ...current, ...patch }),
    });
    const normalized: MenuItem = {
      id: updated.id,
      nom: updated.name,
      description: updated.description,
      prix: formatPrice(updated.priceAmount, updated.currency),
      photosMenu: updated.photos.map((photo) => photo.url),
    };
    setRestaurants((currentRows) => currentRows.map((row) => row.id === restaurantId
      ? { ...row, menu: row.menu?.map((item) => item.id === itemId ? normalized : item) }
      : row));
    return normalized;
  };

  const deleteMenuItem = async (restaurantId: string, itemId: string) => {
    if (isDevelopmentSession) {
      await commitLocalRestaurants(restaurantsRef.current.map((restaurant) => restaurant.id === restaurantId
        ? { ...restaurant, menu: restaurant.menu?.filter((item) => item.id !== itemId) }
        : restaurant));
      return;
    }
    await apiRequest<void>(`/v1/admin/menu-items/${encodeURIComponent(itemId)}`, { method: "DELETE", getToken: getAuthToken });
    setRestaurants((current) => current.map((restaurant) => restaurant.id === restaurantId
      ? { ...restaurant, menu: restaurant.menu?.filter((item) => item.id !== itemId) }
      : restaurant));
  };

  const exportData = async () => JSON.stringify({ restaurants }, null, 2);
  const importData = async (_json: string) => {
    throw new Error("L’import direct local est désactivé. Utilisez les migrations Neon contrôlées.");
  };

  const value: DataContextType = {
    restaurants,
    archivedRestaurants,
    isLoading,
    isOffline,
    reload,
    getRestaurant,
    createInvitation,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    restoreRestaurant,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    exportData,
    importData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = React.useContext(DataContext);
  if (!context) throw new Error("useData doit être utilisé dans DataProvider.");
  return context;
};
