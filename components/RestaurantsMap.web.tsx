import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useData } from '../providers/DataProvider';
import { colors, layout, radius, spacing, typography } from '../styles/theme';
import OfflineBanner from './ui/OfflineBanner';
import RestaurantTile from './ui/RestaurantTile';
import StateView from './ui/StateView';

export default function RestaurantsMap() {
  const router = useRouter();
  const { restaurants, isLoading, isOffline } = useData();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.icon}><Ionicons name="map-outline" size={27} color={colors.primary} /></View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Carte des restaurants</Text>
            <Text style={styles.subtitle}>Ouvrez une adresse dans OpenStreetMap ou consultez sa fiche MenuCity.</Text>
          </View>
        </View>
        <OfflineBanner visible={isOffline} />
        {isLoading && restaurants.length === 0 ? <StateView title="Chargement de la carte…" loading /> : null}
        <View style={styles.grid}>
          {restaurants.map((restaurant) => {
            const query = Number.isFinite(Number(restaurant.latitude)) && Number.isFinite(Number(restaurant.longitude)) ? `${restaurant.latitude},${restaurant.longitude}` : restaurant.adresse;
            return (
              <View key={restaurant.id} style={styles.item}>
                <RestaurantTile restaurant={restaurant} variant="list" onPress={() => router.push({ pathname: '/restaurants/[id]', params: { id: restaurant.id } })} />
                <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(`https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`)} style={({ pressed }) => [styles.mapLink, pressed && styles.pressed]}>
                  <Ionicons name="navigate-outline" size={16} color={colors.primary} />
                  <Text style={styles.linkText}>Ouvrir l’itinéraire</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 58, height: 58, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 28 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.regular, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  item: { width: '100%', maxWidth: 560, gap: spacing.xs },
  mapLink: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  linkText: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 13 },
  pressed: { opacity: 0.72 },
});
