import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import InviteFriendSheet, { type InvitePayload } from '../../components/InviteFriendSheet';
import RestaurantDeck from '../../components/RestaurantDeck';
import CatalogSkeleton from '../../components/ui/CatalogSkeleton';
import Chip from '../../components/ui/Chip';
import OfflineBanner from '../../components/ui/OfflineBanner';
import RestaurantTile from '../../components/ui/RestaurantTile';
import SearchField from '../../components/ui/SearchField';
import SegmentedControl from '../../components/ui/SegmentedControl';
import StateView from '../../components/ui/StateView';
import { useAuth } from '../../providers/AuthProvider';
import { useData } from '../../providers/DataProvider';
import { colors, layout, spacing, typography } from '../../styles/theme';
import type { Restaurant } from '../../types/Restaurant';

type ViewMode = 'swipe' | 'list';
const viewSegments: { key: ViewMode; label: string }[] = [{ key: 'swipe', label: 'Swipe' }, { key: 'list', label: 'Liste' }];
const categories = ['Tous', 'Congolaise', 'Africaine', 'Grillades', 'Fast-food', 'Poisson'];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const deckEntering = FadeInUp.duration(200).reduceMotion(ReduceMotion.System);
const listAnimations = [0, 1, 2, 3, 4, 5].map((index) => FadeInUp.duration(190).delay(index * 32).reduceMotion(ReduceMotion.System));

export default function RestaurantsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const { restaurants, createInvitation, isLoading, isOffline, reload } = useData();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState(typeof params.q === 'string' ? params.q : '');
  const [category, setCategory] = useState('Tous');
  const [viewMode, setViewMode] = useState<ViewMode>('swipe');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    const selected = normalize(category);
    return restaurants.filter((restaurant) => {
      const inCategory = category === 'Tous' || normalize(restaurant.cuisine).includes(selected);
      const searchable = normalize([restaurant.nom, restaurant.cuisine, restaurant.description, ...restaurant.specialites].join(' '));
      return inCategory && (!needle || searchable.includes(needle));
    });
  }, [category, query, restaurants]);

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
        <SearchField value={query} onChangeText={setQuery} />
        <OfflineBanner visible={isOffline} />
        <FlatList style={styles.categoryList} horizontal data={categories} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} renderItem={({ item }) => <Chip label={item} selected={category === item} onPress={() => setCategory(item)} />} />
        <SegmentedControl<ViewMode> segments={viewSegments} value={viewMode} onChange={setViewMode} />

        {isLoading && restaurants.length === 0 ? (
          <CatalogSkeleton variant={viewMode === 'swipe' ? 'deck' : 'list'} />
        ) : filtered.length === 0 ? (
          <StateView title="Aucun résultat" message="Modifiez votre recherche ou vos filtres." icon="search-outline" actionLabel="Réinitialiser" onAction={() => { setQuery(''); setCategory('Tous'); void reload(); }} />
        ) : viewMode === 'swipe' ? (
          <Animated.ScrollView entering={deckEntering} style={styles.results} contentContainerStyle={styles.deckScroll} showsVerticalScrollIndicator={false}>
            <RestaurantDeck restaurants={filtered} onOpen={openDetails} onInvite={openInvite} />
          </Animated.ScrollView>
        ) : (
          <FlatList style={styles.results} data={filtered} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list} renderItem={({ item, index }) => (
            <Animated.View entering={listAnimations[Math.min(index, 5)]}>
              <RestaurantTile restaurant={item} variant="list" onPress={() => openDetails(item)} />
            </Animated.View>
          )} />
        )}
      </View>

      <Modal visible={Boolean(selectedRestaurant)} animationType="slide" onRequestClose={() => setSelectedRestaurant(null)}>
        {selectedRestaurant ? <InviteFriendSheet restaurant={selectedRestaurant} onClose={() => setSelectedRestaurant(null)} onSendInvitation={persistInvitation} /> : null}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { flex: 1, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.screenPadding, paddingTop: 4, gap: spacing.sm },
  header: { gap: 1 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 25, lineHeight: 31 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12 },
  categoryList: { flexGrow: 0, height: 42 },
  chips: { alignItems: 'center', gap: spacing.xs, paddingRight: spacing.md },
  results: { flex: 1 },
  deckScroll: { paddingTop: 2, paddingBottom: 92 },
  list: { gap: spacing.sm, paddingTop: 2, paddingBottom: 96 },
});
