import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '../providers/DataProvider';
import { colors, radius, shadows, spacing, typography } from '../styles/theme';
import type { Restaurant } from '../types/Restaurant';
import OfflineBanner from './ui/OfflineBanner';
import StateView from './ui/StateView';

const lubumbashiRegion = { latitude: -11.6647, longitude: 27.4794, latitudeDelta: 0.12, longitudeDelta: 0.12 };

export default function RestaurantsMap() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { restaurants, isLoading, isOffline } = useData();
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const mapped = useMemo(() => restaurants
    .map((restaurant) => ({ restaurant, latitude: Number(restaurant.latitude), longitude: Number(restaurant.longitude) }))
    .filter(({ latitude, longitude }) => Number.isFinite(latitude) && Number.isFinite(longitude)), [restaurants]);

  if (!isLoading && mapped.length === 0) {
    return (
      <View style={styles.empty}>
        <StateView title="Carte en préparation" message="Les restaurants seront affichés dès que leurs coordonnées seront disponibles." icon="map-outline" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={lubumbashiRegion} showsUserLocation={false} showsMyLocationButton={false} toolbarEnabled={false}>
        {mapped.map(({ restaurant, latitude, longitude }) => (
          <Marker key={restaurant.id} coordinate={{ latitude, longitude }} title={restaurant.nom} description={restaurant.adresse} pinColor={colors.primary} onPress={() => setSelected(restaurant)} />
        ))}
      </MapView>

      <View style={[styles.top, { top: insets.top + spacing.sm, pointerEvents: 'box-none' }]}>
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}><Ionicons name="map" size={21} color={colors.primary} /></View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Carte des restaurants</Text>
            <Text style={styles.subtitle}>{mapped.length} adresse{mapped.length > 1 ? 's' : ''} géolocalisée{mapped.length > 1 ? 's' : ''}</Text>
          </View>
        </View>
        <OfflineBanner visible={isOffline} />
      </View>

      {selected ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Ouvrir ${selected.nom}`} onPress={() => router.push({ pathname: '/restaurants/[id]', params: { id: selected.id } })} style={({ pressed }) => [styles.restaurantCard, pressed && styles.pressed]}>
          <Image source={{ uri: selected.image }} style={styles.image} resizeMode="cover" />
          <View style={styles.cardCopy}>
            <Text style={styles.restaurantName} numberOfLines={1}>{selected.nom}</Text>
            <Text style={styles.restaurantMeta} numberOfLines={1}>{selected.cuisine} · {selected.note.toFixed(1)} ★</Text>
            <Text style={styles.address} numberOfLines={1}>{selected.adresse}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
        </Pressable>
      ) : (
        <View style={styles.tip}><Ionicons name="hand-left-outline" size={18} color={colors.textSecondary} /><Text style={styles.tipText}>Touchez un repère pour voir le restaurant</Text></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  empty: { flex: 1, justifyContent: 'center', backgroundColor: colors.background },
  top: { position: 'absolute', left: spacing.md, right: spacing.md, gap: spacing.xs },
  headerCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.raised },
  headerIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, marginTop: 2 },
  restaurantCard: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: 88, minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.raised },
  image: { width: 70, height: 70, borderRadius: radius.md, backgroundColor: colors.backgroundAlt },
  cardCopy: { flex: 1 },
  restaurantName: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  restaurantMeta: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 12, marginTop: 3 },
  address: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, marginTop: 4 },
  tip: { position: 'absolute', bottom: 92, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tipText: { color: colors.textSecondary, fontFamily: typography.semiBold, fontSize: 12 },
  pressed: { opacity: 0.82 },
});
