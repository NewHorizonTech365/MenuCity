import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUserLocation } from '../hooks/useUserLocation';
import { formatRestaurantDistance, getRestaurantDistanceKm, getRestaurantOpenStatus } from '../lib/restaurantProduct';
import { useData } from '../providers/DataProvider';
import { colors, radius, shadows, spacing, typography } from '../styles/theme';
import type { Restaurant } from '../types/Restaurant';
import FadeInImage from './ui/FadeInImage';
import OfflineBanner from './ui/OfflineBanner';
import PressableScale from './ui/PressableScale';
import RestaurantTile from './ui/RestaurantTile';
import StateView from './ui/StateView';

const lubumbashiRegion = { latitude: -11.6647, longitude: 27.4794, latitudeDelta: 0.12, longitudeDelta: 0.12 };
type MappedRestaurant = { restaurant: Restaurant; latitude: number; longitude: number };

export default function RestaurantsMap() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { restaurants, isLoading, isOffline } = useData();
  const { coordinates, isLocating, requestLocation } = useUserLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList<MappedRestaurant>>(null);
  const cardWidth = Math.min(width - spacing.xl, 348);
  const mapped = useMemo(() => restaurants
    .map((restaurant) => ({ restaurant, latitude: Number(restaurant.latitude), longitude: Number(restaurant.longitude) }))
    .filter(({ latitude, longitude }) => Number.isFinite(latitude) && Number.isFinite(longitude)), [restaurants]);

  useEffect(() => {
    if (!mapReady || !mapped.length) return;
    mapRef.current?.fitToCoordinates(
      mapped.map(({ latitude, longitude }) => ({ latitude, longitude })),
      { edgePadding: { top: 160, right: 46, bottom: 250, left: 46 }, animated: true },
    );
  }, [mapReady, mapped]);

  useEffect(() => {
    if (!mapReady || !coordinates) return;
    mapRef.current?.animateToRegion({ ...coordinates, latitudeDelta: 0.055, longitudeDelta: 0.055 }, 450);
  }, [coordinates, mapReady]);

  const openRestaurant = useCallback((restaurant: Restaurant) => {
    router.push({ pathname: '/restaurants/[id]', params: { id: restaurant.id } });
  }, [router]);

  const focusRestaurant = useCallback((item: MappedRestaurant, index: number, syncList = true) => {
    setSelectedId(item.restaurant.id);
    mapRef.current?.animateToRegion({ latitude: item.latitude, longitude: item.longitude, latitudeDelta: 0.045, longitudeDelta: 0.045 }, 320);
    if (syncList) listRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const locate = async () => {
    const result = await requestLocation();
    if (!result) Alert.alert('Position indisponible', 'Autorisez MenuCity à utiliser votre position pendant l’utilisation de l’application.');
  };

  if (mapped.length === 0) {
    if (!isLoading && restaurants.length) {
      return (
        <ScrollView style={styles.fallback} contentContainerStyle={styles.fallbackContent} showsVerticalScrollIndicator={false}>
          <StateView title="Adresses disponibles" message="Les positions précises sont en préparation. Vous pouvez déjà ouvrir chaque fiche restaurant." icon="location-outline" />
          <View style={styles.fallbackList}>
            {restaurants.map((restaurant) => <RestaurantTile key={restaurant.id} restaurant={restaurant} variant="list" onPress={() => openRestaurant(restaurant)} />)}
          </View>
        </ScrollView>
      );
    }
    return (
      <View style={styles.empty}>
        <StateView title={isLoading ? 'Chargement de la carte…' : 'Carte en préparation'} message={isLoading ? undefined : 'Les restaurants seront affichés dès que leurs coordonnées seront disponibles.'} icon="map-outline" loading={isLoading} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={lubumbashiRegion}
        loadingEnabled
        loadingBackgroundColor={colors.backgroundAlt}
        loadingIndicatorColor={colors.primary}
        showsCompass
        showsUserLocation={Boolean(coordinates)}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onMapReady={() => setMapReady(true)}
      >
        {mapped.map((item, index) => (
          <Marker
            key={item.restaurant.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            title={item.restaurant.nom}
            description={item.restaurant.adresse}
            pinColor={(selectedId || mapped[0]?.restaurant.id) === item.restaurant.id ? colors.primaryDark : colors.primary}
            onPress={() => focusRestaurant(item, index)}
          />
        ))}
      </MapView>

      <View pointerEvents="box-none" style={[styles.top, { top: insets.top + spacing.sm }]}>
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}><Ionicons name="map" size={21} color={colors.primary} /></View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Carte des restaurants</Text>
            <Text style={styles.subtitle}>{mapped.length} adresse{mapped.length > 1 ? 's' : ''} à explorer à Lubumbashi</Text>
          </View>
        </View>
        <OfflineBanner visible={isOffline} />
      </View>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={coordinates ? 'Recentrer sur ma position' : 'Utiliser ma position'}
        haptic="selection"
        disabled={isLocating}
        onPress={() => void locate()}
        style={[styles.locateButton, { top: insets.top + 94 }]}
      >
        {isLocating ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name={coordinates ? 'locate' : 'navigate-outline'} size={22} color={colors.primary} />}
      </PressableScale>

      <FlatList
        ref={listRef}
        horizontal
        data={mapped}
        keyExtractor={(item) => item.restaurant.id}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + spacing.sm}
        contentContainerStyle={styles.carouselContent}
        style={[styles.carousel, { bottom: 84 }]}
        getItemLayout={(_data, index) => ({ length: cardWidth + spacing.sm, offset: (cardWidth + spacing.sm) * index, index })}
        onMomentumScrollEnd={(event) => {
          const index = Math.max(0, Math.min(mapped.length - 1, Math.round(event.nativeEvent.contentOffset.x / (cardWidth + spacing.sm))));
          const item = mapped[index];
          if (item) focusRestaurant(item, index, false);
        }}
        renderItem={({ item }) => {
          const status = getRestaurantOpenStatus(item.restaurant);
          const distance = formatRestaurantDistance(getRestaurantDistanceKm(coordinates, item.restaurant));
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir ${item.restaurant.nom}`}
              onPress={() => openRestaurant(item.restaurant)}
              style={({ pressed }) => [styles.restaurantCard, { width: cardWidth }, pressed && styles.pressed]}
            >
              <FadeInImage accessible={false} source={{ uri: item.restaurant.image }} style={styles.image} resizeMode="cover" />
              <View style={styles.cardCopy}>
                <Text style={styles.cardCuisine} numberOfLines={1}>{item.restaurant.cuisine}</Text>
                <Text style={styles.restaurantName} numberOfLines={1}>{item.restaurant.nom}</Text>
                <View style={styles.cardMetaRow}>
                  <View style={[styles.statusDot, { backgroundColor: status.isOpen ? colors.success : colors.textMuted }]} />
                  <Text style={[styles.restaurantMeta, status.isOpen && styles.restaurantOpen]} numberOfLines={1}>{status.label}</Text>
                  {distance ? <Text style={styles.distance}>· {distance}</Text> : null}
                </View>
                <Text style={styles.address} numberOfLines={1}>{item.restaurant.quartier || item.restaurant.adresse}</Text>
              </View>
              <Ionicons name="arrow-forward" size={19} color={colors.primary} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  fallback: { flex: 1, backgroundColor: colors.background },
  fallbackContent: { padding: spacing.lg, paddingBottom: 110, gap: spacing.lg },
  fallbackList: { gap: spacing.sm },
  empty: { flex: 1, justifyContent: 'center', backgroundColor: colors.background },
  top: { position: 'absolute', left: spacing.md, right: spacing.md, gap: spacing.xs },
  headerCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.raised },
  headerIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, marginTop: 2 },
  locateButton: { position: 'absolute', right: spacing.md, width: 48, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.raised },
  carousel: { position: 'absolute', left: 0, right: 0 },
  carouselContent: { gap: spacing.sm, paddingHorizontal: spacing.md },
  restaurantCard: { minHeight: 108, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.raised },
  image: { width: 82, height: 82, borderRadius: radius.lg, backgroundColor: colors.backgroundAlt },
  cardCopy: { minWidth: 0, flex: 1 },
  cardCuisine: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase' },
  restaurantName: { color: colors.text, fontFamily: typography.bold, fontSize: 16, marginTop: 1 },
  cardMetaRow: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: radius.pill },
  restaurantMeta: { flexShrink: 1, color: colors.textMuted, fontFamily: typography.semiBold, fontSize: 10 },
  restaurantOpen: { color: colors.success },
  distance: { color: colors.textSecondary, fontFamily: typography.semiBold, fontSize: 10 },
  address: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11, marginTop: 4 },
  pressed: { opacity: 0.82 },
});
