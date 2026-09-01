import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, radius, spacing, typography } from '../styles/theme';
import type { Restaurant } from '../types/Restaurant';
import RestaurantLocationMap from './RestaurantLocationMap';
import AppButton from './ui/AppButton';
import SectionHeader from './ui/SectionHeader';

interface RestaurantDetailsProps { restaurant: Restaurant; onInvite: () => void }

export default function RestaurantDetails({ restaurant, onInvite }: RestaurantDetailsProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const latitude = Number(restaurant.latitude);
  const longitude = Number(restaurant.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const mapLatitude = hasCoordinates ? latitude : -11.6647;
  const mapLongitude = hasCoordinates ? longitude : 27.4794;
  const cardWidth = Math.min(width * 0.72, 310);

  const openDirections = () => {
    const destination = hasCoordinates ? `${latitude},${longitude}` : restaurant.adresse;
    void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`);
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: 98 + insets.bottom }]}>
        <View style={styles.hero}>
          <Image source={{ uri: restaurant.image }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient colors={['rgba(36,25,21,0.08)', 'rgba(36,25,21,0.75)']} style={StyleSheet.absoluteFill} />
          <Pressable accessibilityRole="button" accessibilityLabel="Revenir en arrière" onPress={() => router.back()} style={[styles.back, { top: insets.top + spacing.sm }]}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <View style={styles.heroCopy}>
            <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
            <Text style={styles.name}>{restaurant.nom}</Text>
            <View style={styles.heroMeta}><Ionicons name="star" size={16} color="#F7C65A" /><Text style={styles.heroMetaText}>{restaurant.note.toFixed(1)}</Text><Text style={styles.heroDot}>•</Text><Text style={styles.heroMetaText}>{restaurant.prixMoyen}</Text></View>
          </View>
        </View>

        <View style={styles.page}>
          <Text style={styles.description}>{restaurant.description}</Text>
          <View style={styles.quickInfo}>
            <View style={styles.infoItem}><Ionicons name="time-outline" size={19} color={colors.primary} /><Text style={styles.infoText}>{restaurant.horaires}</Text></View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}><Ionicons name="call-outline" size={19} color={colors.primary} /><Text style={styles.infoText}>{restaurant.telephone || 'Non renseigné'}</Text></View>
          </View>

          {restaurant.photos.length ? (
            <View style={styles.section}>
              <SectionHeader title="L’ambiance en images" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
                {restaurant.photos.map((photo, index) => <Image key={`${photo}-${index}`} source={{ uri: photo }} style={[styles.galleryImage, { width: cardWidth }]} resizeMode="cover" />)}
              </ScrollView>
            </View>
          ) : null}

          {restaurant.menu?.length ? (
            <View style={styles.section}>
              <SectionHeader eyebrow="À la carte" title="Le menu" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
                {restaurant.menu.map((dish, index) => {
                  const image = dish.photosMenu?.[0] || restaurant.photos[0] || restaurant.image;
                  return <View key={dish.id || `${dish.nom}-${index}`} style={[styles.dishCard, { width: Math.min(width * 0.58, 260) }]}><Image source={{ uri: image }} style={styles.dishImage} resizeMode="cover" /><View style={styles.dishCopy}><Text style={styles.dishName} numberOfLines={1}>{dish.nom}</Text>{dish.description ? <Text style={styles.dishDescription} numberOfLines={2}>{dish.description}</Text> : null}<Text style={styles.price}>{dish.prix}</Text></View></View>;
                })}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionHeader title="Localisation" />
            <View style={styles.map}><RestaurantLocationMap latitude={mapLatitude} longitude={mapLongitude} title={restaurant.nom} description={restaurant.adresse} hasValidCoords={hasCoordinates} /></View>
            <View style={styles.addressCard}>
              <View style={styles.addressIcon}><Ionicons name="location-outline" size={21} color={colors.primary} /></View>
              <View style={styles.addressCopy}><Text style={styles.addressLabel}>Adresse</Text><Text style={styles.address}>{restaurant.adresse}</Text></View>
              <Pressable accessibilityRole="link" accessibilityLabel="Ouvrir l’itinéraire" onPress={openDirections} style={({ pressed }) => [styles.directionButton, pressed && styles.pressed]}><Ionicons name="navigate-outline" size={20} color={colors.primary} /></Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <AppButton label="Inviter un ami" icon={<Ionicons name="person-add-outline" size={20} color={colors.white} />} onPress={onInvite} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { backgroundColor: colors.background },
  hero: { height: 410, overflow: 'hidden', backgroundColor: colors.backgroundAlt },
  heroImage: { width: '100%', height: '100%' },
  back: { position: 'absolute', left: spacing.md, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.scrim },
  heroCopy: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.xl },
  cuisine: { color: '#FFD6BC', fontFamily: typography.semiBold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  name: { color: colors.white, fontFamily: typography.bold, fontSize: 31, lineHeight: 37, marginTop: 4 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  heroMetaText: { color: colors.white, fontFamily: typography.semiBold, fontSize: 13 },
  heroDot: { color: colors.border },
  page: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: spacing.lg, gap: spacing.xl },
  description: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 15, lineHeight: 23 },
  quickInfo: { flexDirection: 'row', alignItems: 'stretch', paddingVertical: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  infoItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: spacing.sm },
  infoText: { color: colors.text, fontFamily: typography.semiBold, fontSize: 12, textAlign: 'center' },
  infoDivider: { width: 1, backgroundColor: colors.border },
  section: { gap: spacing.md },
  horizontal: { gap: spacing.md, paddingRight: spacing.md },
  galleryImage: { height: 190, borderRadius: radius.lg, backgroundColor: colors.backgroundAlt },
  dishCard: { overflow: 'hidden', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  dishImage: { width: '100%', height: 135, backgroundColor: colors.backgroundAlt },
  dishCopy: { padding: spacing.md },
  dishName: { color: colors.text, fontFamily: typography.bold, fontSize: 15 },
  dishDescription: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 17, marginTop: 4 },
  price: { color: colors.primary, fontFamily: typography.bold, fontSize: 14, marginTop: spacing.xs },
  map: { overflow: 'hidden', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  addressCard: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  addressIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  addressCopy: { flex: 1 },
  addressLabel: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 11 },
  address: { color: colors.text, fontFamily: typography.semiBold, fontSize: 13, lineHeight: 18, marginTop: 2 },
  directionButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  pressed: { opacity: 0.72 },
});
