import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { formatRestaurantDistance, getRestaurantOpenStatus } from '../../lib/restaurantProduct';
import { colors, radius, shadows, spacing, typography } from '../../styles/theme';
import type { Restaurant } from '../../types/Restaurant';
import FadeInImage from './FadeInImage';
import PressableScale from './PressableScale';

type TileVariant = 'featured' | 'horizontal' | 'list' | 'deck';

interface RestaurantTileProps {
  restaurant: Restaurant;
  onPress: () => void;
  variant?: TileVariant;
  distanceKm?: number | null;
}

export default function RestaurantTile({ restaurant, onPress, variant = 'horizontal', distanceKm = null }: RestaurantTileProps) {
  const openStatus = getRestaurantOpenStatus(restaurant);
  const distance = formatRestaurantDistance(distanceKm);

  if (variant === 'featured') {
    return (
      <PressableScale accessibilityRole="button" accessibilityLabel={`Ouvrir ${restaurant.nom}`} haptic="soft" onPress={onPress} style={styles.featured}>
        <FadeInImage accessible={false} source={{ uri: restaurant.image }} style={styles.featuredImage} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(36,25,21,0.9)']} style={styles.gradient} />
        <View style={styles.featuredStatus}><View style={[styles.statusDot, { backgroundColor: openStatus.isOpen === true ? colors.success : openStatus.isOpen === false ? colors.textMuted : colors.warning }]} /><Text style={styles.featuredStatusText}>{openStatus.isOpen === true ? 'Ouvert' : openStatus.isOpen === false ? 'Fermé' : 'À confirmer'}</Text></View>
        <View style={styles.featuredBody}>
          <Text style={styles.eyebrow}>{restaurant.cuisine}</Text>
          <Text style={styles.featuredTitle} numberOfLines={2}>{restaurant.nom}</Text>
          <View style={styles.metaLight}>
            <Ionicons name="star" size={15} color="#F7C65A" />
            <Text style={styles.metaLightText}>{restaurant.note.toFixed(1)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaLightText}>{restaurant.prixMoyen}</Text>
            {distance ? <><Text style={styles.metaDot}>•</Text><Text style={styles.metaLightText}>{distance}</Text></> : null}
          </View>
        </View>
      </PressableScale>
    );
  }

  const isList = variant === 'list';
  const isDeck = variant === 'deck';

  if (isList) {
    return (
      <PressableScale accessibilityRole="button" accessibilityLabel={`Ouvrir ${restaurant.nom}`} haptic="soft" onPress={onPress} style={styles.listCard}>
        <View style={styles.listImageWrap}>
          <FadeInImage accessible={false} source={{ uri: restaurant.image }} style={styles.image} resizeMode="cover" />
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#F7C65A" />
            <Text style={styles.rating}>{restaurant.note.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.listBody}>
          <View style={styles.listTopline}>
            <Text style={[styles.eyebrowDark, styles.listCuisine]} numberOfLines={1}>{restaurant.cuisine}</Text>
            <Text style={styles.priceText}>{restaurant.prixMoyen}</Text>
          </View>
          <Text style={styles.listTitle} numberOfLines={1}>{restaurant.nom}</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={colors.primary} />
            <Text style={styles.address} numberOfLines={1}>{restaurant.adresse}</Text>
          </View>
          <View style={styles.listFooter}>
            <View style={styles.inlineMeta}>
              <View style={[styles.statusDot, { backgroundColor: openStatus.isOpen ? colors.success : colors.textMuted }]} />
              <Text style={[styles.inlineMetaText, openStatus.isOpen && styles.openStatus]} numberOfLines={1}>{openStatus.label}</Text>
              {distance ? <Text style={styles.distanceText}>· {distance}</Text> : null}
            </View>
            <View style={styles.openButton}><Text style={styles.openText}>Voir</Text><Ionicons name="arrow-forward" size={14} color={colors.primary} /></View>
          </View>
        </View>
      </PressableScale>
    );
  }

  if (isDeck) {
    return (
      <PressableScale accessibilityRole="button" accessibilityLabel={`Ouvrir ${restaurant.nom}`} haptic="soft" onPress={onPress} style={styles.deckCard}>
        <View style={styles.deckImageWrap}>
          <FadeInImage accessible={false} source={{ uri: restaurant.image }} style={styles.image} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(20,16,14,0.58)']} style={styles.deckGradient} />
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color="#F7C65A" />
            <Text style={styles.rating}>{restaurant.note.toFixed(1)}</Text>
          </View>
          <View style={styles.priceBadge}><Text style={styles.priceBadgeText}>{restaurant.prixMoyen}</Text></View>
          <View style={styles.hoursBadge}><Ionicons name="time-outline" size={14} color={colors.white} /><Text style={styles.hoursText}>{restaurant.horaires}</Text></View>
        </View>
        <View style={styles.deckBody}>
          <Text style={styles.eyebrowDark}>{restaurant.cuisine}</Text>
          <Text style={styles.deckTitle} numberOfLines={1}>{restaurant.nom}</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={15} color={colors.primary} />
            <Text style={styles.address} numberOfLines={1}>{restaurant.adresse}</Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>{restaurant.description}</Text>
          <View style={styles.deckStatusRow}>
            <View style={[styles.statusDot, { backgroundColor: openStatus.isOpen ? colors.success : colors.textMuted }]} />
            <Text style={[styles.inlineMetaText, openStatus.isOpen && styles.openStatus]}>{openStatus.label}</Text>
            {distance ? <Text style={styles.distanceText}>· {distance}</Text> : null}
          </View>
          {restaurant.specialites.length ? (
            <View style={styles.specialties}>
              {restaurant.specialites.slice(0, 2).map((specialty) => <View key={specialty} style={styles.specialty}><Text style={styles.specialtyText} numberOfLines={1}>{specialty}</Text></View>)}
            </View>
          ) : null}
        </View>
      </PressableScale>
    );
  }

  return (
    <PressableScale accessibilityRole="button" accessibilityLabel={`Ouvrir ${restaurant.nom}`} haptic="soft" onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <FadeInImage accessible={false} source={{ uri: restaurant.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={13} color="#F2B84B" />
          <Text style={styles.rating}>{restaurant.note.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{restaurant.nom}</Text>
        <Text style={styles.cuisine} numberOfLines={1}>{restaurant.cuisine} · {restaurant.prixMoyen}{distance ? ` · ${distance}` : ''}</Text>
        <View style={styles.compactStatus}><View style={[styles.statusDot, { backgroundColor: openStatus.isOpen ? colors.success : colors.textMuted }]} /><Text style={[styles.compactStatusText, openStatus.isOpen && styles.openStatus]}>{openStatus.label}</Text></View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  featured: { height: 235, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.backgroundAlt, ...shadows.raised },
  featuredImage: { width: '100%', height: '100%' },
  gradient: { ...StyleSheet.absoluteFillObject, top: '24%' },
  featuredBody: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md },
  featuredStatus: { position: 'absolute', top: spacing.sm, right: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.scrim },
  featuredStatusText: { color: colors.white, fontFamily: typography.semiBold, fontSize: 10 },
  eyebrow: { color: '#FFE0C2', fontFamily: typography.semiBold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  featuredTitle: { color: colors.white, fontFamily: typography.bold, fontSize: 21, lineHeight: 26, marginTop: 3 },
  metaLight: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  metaLightText: { color: colors.white, fontFamily: typography.semiBold, fontSize: 13 },
  metaDot: { color: '#E8D9CF' },
  card: { width: 230, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.soft },
  listCard: { width: '100%', height: 126, flexDirection: 'row', overflow: 'hidden', padding: 7, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.soft },
  deckCard: { width: '100%', overflow: 'hidden', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.raised },
  imageWrap: { height: 124, backgroundColor: colors.backgroundAlt },
  listImageWrap: { width: 112, height: 112, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.backgroundAlt },
  deckImageWrap: { height: 220, backgroundColor: colors.backgroundAlt },
  image: { width: '100%', height: '100%' },
  ratingBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.scrim },
  rating: { color: colors.white, fontFamily: typography.semiBold, fontSize: 12 },
  body: { padding: spacing.md },
  listBody: { minWidth: 0, flex: 1, justifyContent: 'center', paddingVertical: 2, paddingHorizontal: spacing.sm },
  listTopline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  eyebrowDark: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 10, letterSpacing: 0.7, textTransform: 'uppercase' },
  listCuisine: { flex: 1 },
  priceText: { color: colors.textSecondary, fontFamily: typography.semiBold, fontSize: 11 },
  listTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 17, marginTop: 3 },
  listFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs, marginTop: 7 },
  inlineMeta: { minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  inlineMetaText: { flex: 1, color: colors.textMuted, fontFamily: typography.regular, fontSize: 10 },
  openStatus: { color: colors.success },
  statusDot: { width: 6, height: 6, borderRadius: radius.pill },
  distanceText: { color: colors.textMuted, fontFamily: typography.semiBold, fontSize: 10 },
  openButton: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  openText: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 11 },
  deckBody: { padding: spacing.md, gap: 5 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  deckTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 20, lineHeight: 25 },
  cuisine: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, marginTop: 4 },
  compactStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  compactStatusText: { color: colors.textMuted, fontFamily: typography.semiBold, fontSize: 10 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.xs },
  address: { flex: 1, color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 17 },
  description: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 18, marginTop: 2 },
  deckStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  deckGradient: { ...StyleSheet.absoluteFillObject, top: '42%' },
  priceBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.92)' },
  priceBadgeText: { color: colors.text, fontFamily: typography.semiBold, fontSize: 11 },
  hoursBadge: { position: 'absolute', left: spacing.sm, bottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.scrim },
  hoursText: { color: colors.white, fontFamily: typography.semiBold, fontSize: 11 },
  specialties: { flexDirection: 'row', gap: 6, marginTop: 3 },
  specialty: { minWidth: 0, maxWidth: '48%', paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  specialtyText: { color: colors.primaryDark, fontFamily: typography.semiBold, fontSize: 10 },
});
