import type { Restaurant, RestaurantOpeningPeriod } from '../types/Restaurant';

export type Coordinates = { latitude: number; longitude: number };

const timePattern = /(\d{1,2})\s*[h:]\s*(\d{2})\s*[-–]\s*(\d{1,2})\s*[h:]\s*(\d{2})/i;
const pricePattern = /(\d+(?:[.,]\d+)?)/g;

const timeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const periodsForDay = (restaurant: Restaurant, day: number): RestaurantOpeningPeriod[] => {
  const configured = restaurant.openingPeriods?.filter((period) => period.days.includes(day));
  if (configured?.length) return configured;
  const match = restaurant.horaires.match(timePattern);
  if (!match) return [];
  return [{
    days: [day],
    opensAt: `${match[1].padStart(2, '0')}:${match[2]}`,
    closesAt: `${match[3].padStart(2, '0')}:${match[4]}`,
  }];
};

export const getRestaurantOpenStatus = (restaurant: Restaurant, now = new Date()) => {
  const periods = periodsForDay(restaurant, now.getDay());
  if (!periods.length) return { isOpen: null, label: 'Horaires à confirmer', detail: restaurant.horaires || 'Non renseigné' } as const;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const active = periods.find((period) => {
    const opensAt = timeToMinutes(period.opensAt);
    let closesAt = timeToMinutes(period.closesAt);
    if (closesAt === 0 || closesAt <= opensAt) closesAt += 24 * 60;
    const comparableNow = currentMinutes < opensAt && closesAt > 24 * 60 ? currentMinutes + 24 * 60 : currentMinutes;
    return comparableNow >= opensAt && comparableNow < closesAt;
  });
  if (active) return { isOpen: true, label: 'Ouvert maintenant', detail: `Ferme à ${active.closesAt.replace(':', 'h')}` } as const;
  const next = periods[0];
  return { isOpen: false, label: 'Fermé actuellement', detail: `Ouvre à ${next.opensAt.replace(':', 'h')}` } as const;
};

export const getRestaurantDistanceKm = (from: Coordinates | null, restaurant: Restaurant) => {
  const latitude = Number(restaurant.latitude);
  const longitude = Number(restaurant.longitude);
  if (!from || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(latitude - from.latitude);
  const longitudeDelta = radians(longitude - from.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from.latitude)) * Math.cos(radians(latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatRestaurantDistance = (distanceKm: number | null) => {
  if (distanceKm === null) return null;
  if (distanceKm < 1) return `${Math.max(50, Math.round(distanceKm * 1000 / 50) * 50)} m`;
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0).replace('.', ',')} km`;
};

export const getRestaurantMinimumPrice = (restaurant: Restaurant) => {
  const values = restaurant.prixMoyen.match(pricePattern)?.map((value) => Number(value.replace(',', '.'))) || [];
  return values.length ? Math.min(...values) : null;
};

export const getRestaurantLocationLabel = (restaurant: Restaurant) => [restaurant.quartier, restaurant.commune]
  .filter(Boolean)
  .join(', ') || restaurant.adresse;

export const formatVerificationDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};
