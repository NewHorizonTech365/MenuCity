import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import InviteFriendSheet, { type InvitePayload } from '../../components/InviteFriendSheet';
import RestaurantDeck from '../../components/RestaurantDeck';
import RestaurantFiltersSheet, { type RestaurantFilters } from '../../components/RestaurantFiltersSheet';
import CatalogSkeleton from '../../components/ui/CatalogSkeleton';
import Chip from '../../components/ui/Chip';
import OfflineBanner from '../../components/ui/OfflineBanner';
import PressableScale from '../../components/ui/PressableScale';
import RestaurantTile from '../../components/ui/RestaurantTile';
import SearchField from '../../components/ui/SearchField';
import SegmentedControl from '../../components/ui/SegmentedControl';
import StateView from '../../components/ui/StateView';
import { useAuth } from '../../providers/AuthProvider';
import { useData } from '../../providers/DataProvider';
import { useUserLocation } from '../../hooks/useUserLocation';
import { getRestaurantDistanceKm, getRestaurantMinimumPrice, getRestaurantOpenStatus } from '../../lib/restaurantProduct';
import { colors, layout, radius, spacing, typography } from '../../styles/theme';
import type { Restaurant } from '../../types/Restaurant';

type ViewMode = 'swipe' | 'list';
const viewSegments: { key: ViewMode; label: string }[] = [{ key: 'swipe', label: 'Swipe' }, { key: 'list', label: 'Liste' }];
const categories = ['Tous', 'Congolaise', 'Africaine', 'Grillades', 'Fast-food', 'Poisson'];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const deckEntering = FadeInUp.duration(200).reduceMotion(ReduceMotion.System);
const listAnimations = [0, 1, 2, 3, 4, 5].map((index) => FadeInUp.duration(190).delay(index * 32).reduceMotion(ReduceMotion.System));
const initialFilters: RestaurantFilters = { openNow: false, nearMe: false, budget: 'all', quartier: 'Tous' };

export default function RestaurantsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const { restaurants, createInvitation, isLoading, isOffline, reload } = useData();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState(typeof params.q === 'string' ? params.q : '');
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState('Tous');
  const [viewMode, setViewMode] = useState<ViewMode>('swipe');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [filters, setFilters] = useState<RestaurantFilters>(initialFilters);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const { coordinates, isLocating, requestLocation } = useUserLocation();

  const distanceById = useMemo(() => new Map(restaurants.map((restaurant) => [
    restaurant.id,
    getRestaurantDistanceKm(coordinates, restaurant),
  ])), [coordinates, restaurants]);

  const quartiers = useMemo(() => [...new Set(restaurants.map((restaurant) => restaurant.quartier).filter((value): value is string => Boolean(value)))].sort(), [restaurants]);

  const filtered = useMemo(() => {
    const needle = normalize(deferredQuery.trim());
    const selected = normalize(category);
    const rows = restaurants.filter((restaurant) => {
      const inCategory = category === 'Tous' || normalize(restaurant.cuisine).includes(selected);
      const searchable = normalize([restaurant.nom, restaurant.cuisine, restaurant.description, ...restaurant.specialites].join(' '));
      const openMatches = !filters.openNow || getRestaurantOpenStatus(restaurant).isOpen === true;
      const distance = distanceById.get(restaurant.id);
      const nearbyMatches = !filters.nearMe || (distance !== null && distance !== undefined && distance <= 8);
      const quartierMatches = filters.quartier === 'Tous' || restaurant.quartier === filters.quartier;
      const price = getRestaurantMinimumPrice(restaurant);
      const budgetMatches = filters.budget === 'all'
        || (price !== null && filters.budget === 'economical' && price <= 15)
        || (price !== null && filters.budget === 'standard' && price > 15 && price < 25)
        || (price !== null && filters.budget === 'premium' && price >= 25);
      return inCategory && openMatches && nearbyMatches && quartierMatches && budgetMatches && (!needle || searchable.includes(needle));
    });
    if (filters.nearMe) rows.sort((left, right) => (distanceById.get(left.id) ?? Number.MAX_VALUE) - (distanceById.get(right.id) ?? Number.MAX_VALUE));
    return rows;
  }, [category, deferredQuery, distanceById, filters, restaurants]);

  const activeFilterCount = Number(filters.openNow) + Number(filters.nearMe) + Number(filters.budget !== 'all') + Number(filters.quartier !== 'Tous');

  const enableNearby = async () => {
    if (coordinates) return true;
    const located = await requestLocation();
    if (!located) Alert.alert('Position indisponible', 'Autorisez la localisation pour afficher les restaurants situés à moins de 8 km.');
    return Boolean(located);
  };

  const resetFilters = () => {
    setQuery('');
    setCategory('Tous');
    setFilters(initialFilters);
  };

  const openDetails = (restaurant: Restaurant) => router.push({ pathname: '/restaurants/[id]', params: { id: restaurant.id } });
  const openInvite = (restaurant: Restaurant) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    setSelectedRestaurant(restaurant);
  };
  const persistInvitation = async (payload: InvitePayload) => { await createInvitation(payload); };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Découvrir</Text>
          <Text style={styles.subtitle}>{filtered.length} adresse{filtered.length > 1 ? 's' : ''} à parcourir</Text>
        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchField}><SearchField value={query} onChangeText={setQuery} /></View>
          <PressableScale accessibilityRole="button" accessibilityLabel={`Ouvrir les filtres${activeFilterCount ? `, ${activeFilterCount} actif${activeFilterCount > 1 ? 's' : ''}` : ''}`} haptic="selection" onPress={() => setFiltersVisible(true)} style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}>
            <Ionicons name="options-outline" size={21} color={activeFilterCount ? colors.white : colors.primary} />
            {activeFilterCount ? <View style={styles.filterCount}><Text style={styles.filterCountText}>{activeFilterCount}</Text></View> : null}
          </PressableScale>
        </View>
        <OfflineBanner visible={isOffline} />
        {activeFilterCount ? (
          <View style={styles.activeFilters}>
            <Text style={styles.activeFiltersText}>{activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}</Text>
            <PressableScale accessibilityRole="button" accessibilityLabel="Effacer les filtres" onPress={() => setFilters(initialFilters)} style={styles.clearFilters}><Text style={styles.clearFiltersText}>Effacer</Text></PressableScale>
          </View>
        ) : null}
        <FlatList style={styles.categoryList} horizontal data={categories} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} renderItem={({ item }) => <Chip label={item} selected={category === item} onPress={() => setCategory(item)} />} />
        <SegmentedControl<ViewMode> segments={viewSegments} value={viewMode} onChange={setViewMode} />

        {isLoading && restaurants.length === 0 ? (
          <CatalogSkeleton variant={viewMode === 'swipe' ? 'deck' : 'list'} />
        ) : filtered.length === 0 ? (
          <StateView title="Aucun résultat" message="Modifiez votre recherche, votre budget ou la zone choisie." icon="search-outline" actionLabel="Réinitialiser" onAction={() => { resetFilters(); void reload(); }} />
        ) : viewMode === 'swipe' ? (
          <Animated.ScrollView entering={deckEntering} style={styles.results} contentContainerStyle={styles.deckScroll} showsVerticalScrollIndicator={false}>
            <RestaurantDeck restaurants={filtered} onOpen={openDetails} onInvite={openInvite} distanceById={distanceById} />
          </Animated.ScrollView>
        ) : (
          <FlatList keyboardShouldPersistTaps="handled" style={styles.results} data={filtered} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list} renderItem={({ item, index }) => (
            <Animated.View entering={listAnimations[Math.min(index, 5)]} style={styles.listItem}>
              <RestaurantTile restaurant={item} variant="list" distanceKm={distanceById.get(item.id) ?? null} onPress={() => openDetails(item)} />
            </Animated.View>
          )} />
        )}
      </View>

      <Modal visible={Boolean(selectedRestaurant)} animationType="slide" onRequestClose={() => setSelectedRestaurant(null)}>
        {selectedRestaurant ? <InviteFriendSheet restaurant={selectedRestaurant} onClose={() => setSelectedRestaurant(null)} onSendInvitation={persistInvitation} /> : null}
      </Modal>
      <RestaurantFiltersSheet
        visible={filtersVisible}
        filters={filters}
        quartiers={quartiers}
        resultCount={filtered.length}
        isLocating={isLocating}
        onChange={setFilters}
        onEnableNearby={enableNearby}
        onClose={() => setFiltersVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { flex: 1, minHeight: 0, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.screenPadding, paddingTop: 4, gap: spacing.sm },
  header: { gap: 1 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 25, lineHeight: 31 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  searchField: { flex: 1 },
  filterButton: { width: 50, height: 50, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  filterButtonActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  filterCount: { position: 'absolute', right: -2, top: -3, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background, backgroundColor: colors.text },
  filterCountText: { color: colors.white, fontFamily: typography.bold, fontSize: 9 },
  activeFilters: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: spacing.sm, paddingRight: 4, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  activeFiltersText: { color: colors.primaryDark, fontFamily: typography.semiBold, fontSize: 11 },
  clearFilters: { minHeight: 30, justifyContent: 'center', paddingHorizontal: spacing.sm },
  clearFiltersText: { color: colors.primaryDark, fontFamily: typography.bold, fontSize: 11 },
  categoryList: { flexGrow: 0, height: 42 },
  chips: { alignItems: 'center', gap: spacing.xs, paddingRight: spacing.md },
  results: { flex: 1, minHeight: 0 },
  deckScroll: { paddingTop: 2, paddingBottom: 92 },
  list: { gap: spacing.sm, paddingTop: 2, paddingBottom: 96 },
  listItem: { width: '100%' },
});
