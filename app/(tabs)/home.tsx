import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import BrandMark from '../../components/ui/BrandMark';
import CatalogSkeleton from '../../components/ui/CatalogSkeleton';
import Chip from '../../components/ui/Chip';
import OfflineBanner from '../../components/ui/OfflineBanner';
import PressableScale from '../../components/ui/PressableScale';
import RestaurantTile from '../../components/ui/RestaurantTile';
import SearchField from '../../components/ui/SearchField';
import SectionHeader from '../../components/ui/SectionHeader';
import StateView from '../../components/ui/StateView';
import { useAuth } from '../../providers/AuthProvider';
import { useData } from '../../providers/DataProvider';
import { colors, layout, spacing, typography } from '../../styles/theme';

const categories = ['Tous', 'Congolaise', 'Africaine', 'Grillades', 'Fast-food', 'Poisson'];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const enterHeader = FadeInUp.duration(210).reduceMotion(ReduceMotion.System);
const enterSearch = FadeInUp.duration(210).delay(45).reduceMotion(ReduceMotion.System);
const enterContent = FadeInUp.duration(230).delay(90).reduceMotion(ReduceMotion.System);
const suggestionAnimations = [0, 1, 2, 3, 4].map((index) => FadeInUp.duration(190).delay(index * 35).reduceMotion(ReduceMotion.System));

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { restaurants, isLoading, isOffline, reload } = useData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tous');

  const visibleRestaurants = useMemo(() => {
    if (category === 'Tous') return restaurants;
    const selected = normalize(category);
    return restaurants.filter((restaurant) => normalize(restaurant.cuisine).includes(selected));
  }, [category, restaurants]);

  const openDiscover = () => {
    const trimmed = query.trim();
    router.push(trimmed ? { pathname: '/restaurants', params: { q: trimmed } } : '/restaurants');
  };

  const openRestaurant = (id: string) => router.push({ pathname: '/restaurants/[id]', params: { id } });
  const featured = visibleRestaurants[0];
  const suggestions = visibleRestaurants.slice(featured ? 1 : 0);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Animated.View entering={enterHeader} style={styles.topRow}>
            <BrandMark />
            <PressableScale accessibilityRole="button" accessibilityLabel={isAuthenticated ? 'Ouvrir le profil' : 'Se connecter'} haptic="selection" onPress={() => router.push('/profile')} style={styles.profileButton}>
              <Ionicons name={isAuthenticated ? 'person' : 'person-outline'} size={20} color={colors.primary} />
            </PressableScale>
          </Animated.View>

          <Animated.View entering={enterHeader} style={styles.intro}>
            <Text style={styles.heading}>{user?.nom ? `Bonjour ${user.nom.split(' ')[0]} 👋` : 'Bonjour 👋'}</Text>
            <Text style={styles.lead}>Quelle table allez-vous découvrir aujourd’hui à Lubumbashi ?</Text>
          </Animated.View>

          <Animated.View entering={enterSearch}>
            <SearchField value={query} onChangeText={setQuery} onSubmit={openDiscover} />
          </Animated.View>
          <OfflineBanner visible={isOffline} />

          <FlatList style={styles.categoryList} horizontal data={categories} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} renderItem={({ item }) => <Chip label={item} selected={category === item} onPress={() => setCategory(item)} />} />

          {isLoading && restaurants.length === 0 ? (
            <CatalogSkeleton variant="home" />
          ) : featured ? (
            <Animated.View key={featured.id} entering={enterContent} style={styles.section}>
              <SectionHeader eyebrow="Notre sélection" title="À découvrir aujourd’hui" actionLabel="Tout voir" onAction={openDiscover} />
              <RestaurantTile restaurant={featured} variant="featured" onPress={() => openRestaurant(featured.id)} />
            </Animated.View>
          ) : (
            <StateView title="Aucun restaurant ici" message="Essayez une autre catégorie ou actualisez le catalogue." actionLabel="Actualiser" onAction={() => void reload()} />
          )}

          {suggestions.length ? (
            <Animated.View entering={enterContent} style={styles.section}>
              <SectionHeader title="Les tables de la ville" actionLabel="Explorer" onAction={openDiscover} />
              <FlatList horizontal data={suggestions} keyExtractor={(item) => item.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tiles} renderItem={({ item, index }) => (
                <Animated.View entering={suggestionAnimations[Math.min(index, 4)]}>
                  <RestaurantTile restaurant={item} onPress={() => openRestaurant(item.id)} />
                </Animated.View>
              )} />
            </Animated.View>
          ) : null}

          <PressableScale accessibilityRole="button" accessibilityLabel="Voir les restaurants sur la carte" haptic="selection" onPress={() => router.push('/map')} style={styles.mapCallout}>
            <View style={styles.mapIcon}><Ionicons name="map-outline" size={24} color={colors.primary} /></View>
            <View style={styles.mapCopy}>
              <Text style={styles.mapTitle}>Voir les restaurants sur la carte</Text>
              <Text style={styles.mapText}>Repérez rapidement une adresse dans Lubumbashi.</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </PressableScale>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 108 },
  page: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.screenPadding, gap: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 },
  profileButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  intro: { marginTop: 2 },
  heading: { color: colors.text, fontFamily: typography.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.5 },
  lead: { maxWidth: 520, color: colors.textSecondary, fontFamily: typography.regular, fontSize: 14, lineHeight: 20, marginTop: 4 },
  categoryList: { flexGrow: 0, height: 42 },
  chips: { alignItems: 'center', gap: spacing.xs, paddingRight: spacing.md },
  section: { gap: spacing.sm },
  tiles: { gap: spacing.sm, paddingRight: spacing.md, paddingBottom: spacing.xs },
  mapCallout: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  mapIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  mapCopy: { flex: 1 },
  mapTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 15 },
  mapText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 17, marginTop: 3 },
});
