import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../../styles/theme';
import type { Restaurant } from '../../types/Restaurant';
import FadeInImage from './FadeInImage';
import PressableScale from './PressableScale';

type TileVariant = 'featured' | 'horizontal' | 'list' | 'deck';

interface RestaurantTileProps {
  restaurant: Restaurant;
  onPress: () => void;
  variant?: TileVariant;
}

export default function RestaurantTile({ restaurant, onPress, variant = 'horizontal' }: RestaurantTileProps) {
  if (variant === 'featured') {
    return (
      <PressableScale accessibilityRole="button" accessibilityLabel={`Ouvrir ${restaurant.nom}`} haptic="soft" onPress={onPress} style={styles.featured}>
        <FadeInImage accessible={false} source={{ uri: restaurant.image }} style={styles.featuredImage} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(36,25,21,0.9)']} style={styles.gradient} />
        <View style={styles.featuredBody}>
          <Text style={styles.eyebrow}>{restaurant.cuisine}</Text>
          <Text style={styles.featuredTitle} numberOfLines={2}>{restaurant.nom}</Text>
          <View style={styles.metaLight}>
            <Ionicons name="star" size={15} color="#F7C65A" />
            <Text style={styles.metaLightText}>{restaurant.note.toFixed(1)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaLightText}>{restaurant.prixMoyen}</Text>
          </View>
        </View>
      </PressableScale>
    );
  }

  const isList = variant === 'list';
  const isDeck = variant === 'deck';
  return (
    <PressableScale accessibilityRole="button" accessibilityLabel={`Ouvrir ${restaurant.nom}`} haptic="soft" onPress={onPress} style={[styles.card, isList && styles.listCard, isDeck && styles.deckCard]}>
      <View style={[styles.imageWrap, isList && styles.listImageWrap, isDeck && styles.deckImageWrap]}>
        <FadeInImage accessible={false} source={{ uri: restaurant.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={13} color="#F2B84B" />
          <Text style={styles.rating}>{restaurant.note.toFixed(1)}</Text>
        </View>
      </View>
      <View style={[styles.body, isList && styles.listBody, isDeck && styles.deckBody]}>
        <Text style={[styles.title, isDeck && styles.deckTitle]} numberOfLines={1}>{restaurant.nom}</Text>
        <Text style={styles.cuisine} numberOfLines={1}>{restaurant.cuisine} · {restaurant.prixMoyen}</Text>
        {(isList || isDeck) ? (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={15} color={colors.primary} />
            <Text style={styles.address} numberOfLines={isDeck ? 2 : 1}>{restaurant.adresse}</Text>
          </View>
        ) : null}
        {isDeck ? <Text style={styles.description} numberOfLines={3}>{restaurant.description}</Text> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  featured: { height: 235, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.backgroundAlt, ...shadows.raised },
  featuredImage: { width: '100%', height: '100%' },
  gradient: { ...StyleSheet.absoluteFillObject, top: '24%' },
  featuredBody: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md },
  eyebrow: { color: '#FFE0C2', fontFamily: typography.semiBold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  featuredTitle: { color: colors.white, fontFamily: typography.bold, fontSize: 21, lineHeight: 26, marginTop: 3 },
  metaLight: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  metaLightText: { color: colors.white, fontFamily: typography.semiBold, fontSize: 13 },
  metaDot: { color: '#E8D9CF' },
  card: { width: 230, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.soft },
  listCard: { width: '100%', height: 112, flexDirection: 'row', padding: 6 },
  deckCard: { width: '100%', borderRadius: radius.lg },
  imageWrap: { height: 124, backgroundColor: colors.backgroundAlt },
  listImageWrap: { width: 100, height: 100, borderRadius: radius.md, overflow: 'hidden' },
  deckImageWrap: { height: 238 },
  image: { width: '100%', height: '100%' },
  ratingBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.scrim },
  rating: { color: colors.white, fontFamily: typography.semiBold, fontSize: 12 },
  body: { padding: spacing.md },
  listBody: { flex: 1, justifyContent: 'center', paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  deckBody: { padding: spacing.md },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  deckTitle: { fontSize: 20, lineHeight: 25 },
  cuisine: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, marginTop: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.xs },
  address: { flex: 1, color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 17 },
  description: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 18, marginTop: spacing.xs },
});
