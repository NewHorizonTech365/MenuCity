// providers/DataProvider.tsx
import React, { createContext, useCallback, useEffect, useState } from "react";
import { restaurantsLubumbashi } from "../data/restaurants";
import { loadJson, saveJson, STORAGE_KEYS } from "../lib/storage";
import type { Restaurant } from "../types/Restaurant";
import * as Crypto from "expo-crypto";
import { supabase } from "../lib/supabase";

/**
 * DataContext: expose restaurants + fonctions CRUD
 *
 * IMPORTANT:
 *  - Le "menu" est un tableau dans chaque restaurant (pas un type séparé).
 *  - Un menuItem = { id, nom, description?, prix, photosMenu? }
 */

type MenuItem = {
  id: string;
  nom: string;
  description?: string;
  prix?: string;
  photosMenu?: string[];
};

type DataContextType = {
  restaurants: Restaurant[];
  reload: () => Promise<void>;
  addRestaurant: (r: Partial<Restaurant>) => Promise<Restaurant>;
  updateRestaurant: (id: string, patch: Partial<Restaurant>) => Promise<Restaurant | null>;
  deleteRestaurant: (id: string) => Promise<void>;

  addMenuItem: (restaurantId: string, item: Partial<MenuItem>) => Promise<MenuItem | null>;
  updateMenuItem: (restaurantId: string, itemId: string, patch: Partial<MenuItem>) => Promise<MenuItem | null>;
  deleteMenuItem: (restaurantId: string, itemId: string) => Promise<void>;

  exportData: () => Promise<string>;
  importData: (json: string) => Promise<void>;
};

export const DataContext = createContext<DataContextType | null>(null);

// Génération d’ID sécurisée
const genId = () => Crypto.randomUUID();

/**
 * Normalise les données du seed (restaurantsLubumbashi)
 */
const normalizeSeed = (seed: Restaurant[]): Restaurant[] => {
  return seed.map((r) => {
    const menu = (r.menu || []).map((mi) => {
      const safeId =
        typeof mi.id === "string" && mi.id.trim() && mi.id !== "1" ? mi.id : genId();

      return {
        id: safeId,
        nom: mi.nom || "Plat",
        description: mi.description || "",
        prix: mi.prix || "",
        photosMenu: mi.photosMenu || [],
      };
    });

    return { ...r, menu };
  });
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  /**
   * Sauvegarde dans AsyncStorage + met l’état à jour
   */
  const persist = useCallback(async (next: Restaurant[]) => {
    setRestaurants(next);
    try {
      await saveJson(STORAGE_KEYS.RESTAURANTS, next);
    } catch (e) {
      console.error("DataProvider.persist error:", e);
    }
  }, []);

  /**
   * Charge depuis AsyncStorage OU seed de base
   */
  const seedOrLoad = useCallback(async () => {
    try {
      const stored = await loadJson(STORAGE_KEYS.RESTAURANTS);

      if (stored && Array.isArray(stored)) {
        setRestaurants(stored);
      } else {
        const normalized = normalizeSeed(restaurantsLubumbashi);
        await saveJson(STORAGE_KEYS.RESTAURANTS, normalized);
        setRestaurants(normalized);
      }
    } catch (e) {
      console.error("DataProvider.seedOrLoad error:", e);

      const fallback = normalizeSeed(restaurantsLubumbashi);
      setRestaurants(fallback);
    }
  }, []);

  useEffect(() => {
    seedOrLoad();
  }, [seedOrLoad]);

  const reload = async () => {
    await seedOrLoad();
  };

  const loadRestaurantsFromSupabase = async () => {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    console.log("RESTOS SUPABASE:", data);
  };

  // -------------------------------------------------------------
  // RESTAURANTS CRUD
  // -------------------------------------------------------------

  const addRestaurant = async (r: Partial<Restaurant>) => {
    const newR: Restaurant = {
      id: genId(),
      nom: r.nom || "Nouveau Restaurant",
      cuisine: r.cuisine || "Divers",
      adresse: r.adresse || "",
      telephone: r.telephone || "",
      image: r.image || "",
      logo: r.logo || "",
      photos: r.photos || [],
      note: r.note ?? 4.0,
      prixMoyen: r.prixMoyen || "",
      description: r.description || "",
      horaires: r.horaires || "",
      specialites: r.specialites || [],
      menu: (r.menu || []).map((mi) => ({
        id: genId(),
        nom: mi.nom || "Plat",
        description: mi.description || "",
        prix: mi.prix || "0 USD",
        photosMenu: mi.photosMenu || [],
      })),
    };

    const next = [newR, ...restaurants];
    await persist(next);
    return newR;
  };

  const updateRestaurant = async (id: string, patch: Partial<Restaurant>) => {
    const next = restaurants.map((r) => (r.id === id ? { ...r, ...patch } : r));
    await persist(next);
    return next.find((r) => r.id === id) || null;
  };

  const deleteRestaurant = async (id: string) => {
    const next = restaurants.filter((r) => r.id !== id);
    await persist(next);
  };

  // -------------------------------------------------------------
  // MENU ITEMS CRUD
  // -------------------------------------------------------------

const addMenuItem = async (
  restaurantId: string,
  item: Partial<{
    id: string;
    nom: string;
    description?: string;
    prix?: string;
    photosMenu?: string[];
  }>
) => {
  const restIndex = restaurants.findIndex((r) => r.id === restaurantId);
  if (restIndex === -1) return null;

  const rest = restaurants[restIndex];

  const currentMenu = Array.isArray(rest.menu) ? rest.menu : [];

  const newItem = {
    id: genId(),
    nom: item.nom || "Plat",
    description: item.description || "",
    prix: item.prix || "0 USD",
    photosMenu: item.photosMenu || [],
  };

  const updatedRestaurant = {
    ...rest,
    menu: [newItem, ...currentMenu],
  };

  const next = [...restaurants];
  next[restIndex] = updatedRestaurant;

  await persist(next);

  return newItem;
};

  const updateMenuItem = async (restaurantId: string, itemId: string, patch: Partial<MenuItem>) => {
    const rest = restaurants.find((r) => r.id === restaurantId);
    if (!rest || !rest.menu) return null;

    rest.menu = rest.menu.map((mi) => (mi.id === itemId ? { ...mi, ...patch } : mi));

    await persist([...restaurants]);
    return rest.menu.find((mi) => mi.id === itemId) || null;
  };

  const deleteMenuItem = async (restaurantId: string, itemId: string) => {
    const rest = restaurants.find((r) => r.id === restaurantId);
    if (!rest || !rest.menu) return;

    rest.menu = rest.menu.filter((mi) => mi.id !== itemId);
    await persist([...restaurants]);
  };

  // -------------------------------------------------------------
  // IMPORT / EXPORT JSON
  // -------------------------------------------------------------

  const exportData = async () => {
    return JSON.stringify({ restaurants }, null, 2);
  };

  const importData = async (json: string) => {
    const parsed = JSON.parse(json);
    if (!parsed?.restaurants || !Array.isArray(parsed.restaurants)) {
      throw new Error("JSON invalide : propriété 'restaurants' manquante.");
    }

    const normalized = normalizeSeed(parsed.restaurants);
    await saveJson(STORAGE_KEYS.RESTAURANTS, normalized);
    setRestaurants(normalized);
  };

  return (
    <DataContext.Provider
      value={{
        restaurants,
        reload,
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        exportData,
        importData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

/**
 * Hook pour consommer le DataContext
 */
export const useData = () => {
  const ctx = React.useContext(DataContext);
  if (!ctx) {
    throw new Error("useData doit être utilisé à l’intérieur d’un <DataProvider>");
  }
  return ctx;
};
