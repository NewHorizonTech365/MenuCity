import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUserLocation } from '../hooks/useUserLocation';
import { formatRestaurantDistance, formatVerificationDate, getRestaurantDistanceKm, getRestaurantOpenStatus } from '../lib/restaurantProduct';
import { colors, layout, radius, shadows, spacing, typography } from '../styles/theme';
import type { Restaurant } from '../types/Restaurant';
import RestaurantLocationMap from './RestaurantLocationMap';
import AppButton from './ui/AppButton';
import FadeInImage from './ui/FadeInImage';
import PressableScale from './ui/PressableScale';
import SectionHeader from './ui/SectionHeader';

interface RestaurantDetailsProps {
  restaurant: Restaurant;
  onInvite: () => void;
}

export default function RestaurantDetails({ restaurant, onInvite }: RestaurantDetailsProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const latitude = Number(restaurant.latitude);
  const longitude = Number(restaurant.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const mapLatitude = hasCoordinates ? latitude : -11.6647;
  const mapLongitude = hasCoordinates ? longitude : 27.4794;
  const galleryWidth = Math.min(Math.max(width - spacing.lg * 2, 260), 380);
  const dishWidth = Math.min(Math.max(width * 0.7, 238), 300);
  const { coordinates, isLocating, requestLocation } = useUserLocation();
  const openStatus = getRestaurantOpenStatus(restaurant);
  const distance = formatRestaurantDistance(getRestaurantDistanceKm(coordinates, restaurant));
  const verificationDate = formatVerificationDate(restaurant.lastVerifiedAt);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/restaurants'));

  const openDirections = () => {
    const destination = hasCoordinates ? `${latitude},${longitude}` : restaurant.adresse;
    void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`);
  };

  const openPhone = () => {
    const phone = restaurant.telephone.replace(/[^\d+]/g, '');
    if (phone) void Linking.openURL(`tel:${phone}`);
  };

  const openWhatsApp = () => {
    const phone = restaurant.telephone.replace(/\D/g, '');
    if (!phone) return;
    const message = `Bonjour, je vous contacte depuis MenuCity au sujet de ${restaurant.nom}.`;
    void Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  };

  const locateUser = async () => {
    const position = await requestLocation();
    if (!position) Alert.alert('Position indisponible', 'Autorisez la localisation pour calculer votre distance jusqu’au restaurant.');
  };

  const reportIncorrectInformation = async () => {
    const message = [
      `Signalement MenuCity — ${restaurant.nom}`,
      '',
      'Une information de cette fiche semble incorrecte :',
      '☐ Adresse ou position',
      '☐ Horaires',
      '☐ Téléphone',
      '☐ Menu ou prix',
      '☐ Restaurant fermé',
      '',
      `Identifiant : ${restaurant.id}`,
    ].join('\n');
    await Share.share({ title: `Signaler ${restaurant.nom}`, message });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 104 + insets.bottom }]}
      >
        <View style={styles.hero}>
          <FadeInImage accessible={false} source={{ uri: restaurant.image }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient colors={['rgba(14,14,16,0.3)', 'transparent', 'rgba(14,14,16,0.28)']} style={StyleSheet.absoluteFillObject} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Revenir en arrière"
            hitSlop={8}
            onPress={goBack}
            style={({ pressed }) => [styles.back, { top: insets.top + spacing.sm }, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.page}>
          <View style={styles.summaryCard}>
            <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
            <Text style={styles.name}>{restaurant.nom}</Text>
            <View style={styles.summaryMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={15} color={colors.gold} />
                <Text style={styles.metaText}>{restaurant.note.toFixed(1)}</Text>
              </View>
              <View style={styles.metaDivider} />
              <Text style={styles.priceRange}>{restaurant.prixMoyen}</Text>
            </View>
            <View style={styles.summaryAddress}>
              <Ionicons name="location-outline" size={17} color={colors.primary} />
              <Text style={styles.summaryAddressText} numberOfLines={2}>{restaurant.adresse}</Text>
            </View>
            <View style={[styles.trustBadge, restaurant.isVerified ? styles.trustVerified : styles.trustPending]}>
              <Ionicons name={restaurant.isVerified ? 'shield-checkmark' : 'information-circle-outline'} size={15} color={restaurant.isVerified ? colors.success : colors.warning} />
              <Text style={[styles.trustText, { color: restaurant.isVerified ? colors.success : colors.warning }]}>
                {restaurant.isVerified ? `Fiche vérifiée${verificationDate ? ` le ${verificationDate}` : ''}` : 'Informations à confirmer par le restaurant'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader eyebrow="Le restaurant" title="À propos" />
            <Text style={styles.description}>{restaurant.description}</Text>
            {restaurant.specialites.length ? (
              <View style={styles.specialties}>
                {restaurant.specialites.map((specialty) => (
                  <View key={specialty} style={styles.specialtyChip}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.quickGrid}>
            <View style={styles.quickCard}>
              <View style={[styles.quickIcon, openStatus.isOpen && styles.quickIconOpen]}><Ionicons name="time-outline" size={20} color={openStatus.isOpen ? colors.success : colors.primary} /></View>
              <Text style={[styles.quickLabel, openStatus.isOpen && styles.quickLabelOpen]}>{openStatus.label}</Text>
              <Text style={styles.quickValue} numberOfLines={2}>{openStatus.detail}</Text>
            </View>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={restaurant.telephone ? `Appeler ${restaurant.telephone}` : 'Téléphone non renseigné'}
              disabled={!restaurant.telephone}
              onPress={openPhone}
              style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
            >
              <View style={styles.quickIcon}><Ionicons name="call-outline" size={20} color={colors.primary} /></View>
              <Text style={styles.quickLabel}>Téléphone</Text>
              <Text style={styles.quickValue} numberOfLines={2}>{restaurant.telephone || 'Non renseigné'}</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <SectionHeader eyebrow="Infos pratiques" title="Pour décider rapidement" />
            <View style={styles.factsCard}>
              <FactRow icon="location-outline" label="Zone" value={[restaurant.quartier, restaurant.commune].filter(Boolean).join(', ') || restaurant.adresse} />
              {restaurant.repere ? <FactRow icon="flag-outline" label="Point de repère" value={restaurant.repere} /> : null}
              <FactRow icon="cash-outline" label="Budget indicatif" value={[restaurant.prixMoyen, restaurant.prixMoyenCdf].filter(Boolean).join(' · ')} />
              <Pressable accessibilityRole="button" onPress={() => void locateUser()} disabled={isLocating} style={({ pressed }) => [styles.factRow, pressed && styles.pressed]}>
                <View style={styles.factIcon}><Ionicons name="navigate-outline" size={18} color={colors.primary} /></View>
                <View style={styles.factCopy}><Text style={styles.factLabel}>Depuis votre position</Text><Text style={styles.factValue}>{distance || (isLocating ? 'Calcul en cours…' : 'Calculer la distance')}</Text></View>
                <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
              </Pressable>
            </View>
            {restaurant.services?.length ? (
              <View style={styles.tagGroup}><Text style={styles.tagGroupTitle}>Services</Text><View style={styles.specialties}>{restaurant.services.map((service) => <View key={service} style={styles.serviceChip}><Ionicons name="checkmark-circle" size={14} color={colors.success} /><Text style={styles.serviceText}>{service}</Text></View>)}</View></View>
            ) : null}
            {restaurant.paymentMethods?.length ? (
              <View style={styles.tagGroup}><Text style={styles.tagGroupTitle}>Paiements acceptés</Text><Text style={styles.paymentText}>{restaurant.paymentMethods.join(' · ')}</Text></View>
            ) : null}
          </View>

          {restaurant.photos.length ? (
            <View style={styles.section}>
              <SectionHeader eyebrow="L’expérience" title="L’ambiance en images" />
              <ScrollView
                horizontal
                nestedScrollEnabled
                decelerationRate="fast"
                snapToInterval={galleryWidth + spacing.sm}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontal}
              >
                {restaurant.photos.map((photo, index) => (
                  <FadeInImage
                    accessible={false}
                    key={`${photo}-${index}`}
                    source={{ uri: photo }}
                    style={[styles.galleryImage, { width: galleryWidth }]}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {restaurant.menu?.length ? (
            <View style={styles.section}>
              <SectionHeader eyebrow="À la carte" title="Les plats du moment" />
              <ScrollView
                horizontal
                nestedScrollEnabled
                decelerationRate="fast"
                snapToInterval={dishWidth + spacing.sm}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontal}
              >
                {restaurant.menu.map((dish, index) => {
                  const image = dish.photosMenu?.[0] || restaurant.photos[0] || restaurant.image;
                  return (
                    <View key={`${dish.id || dish.nom}-${index}`} style={[styles.dishCard, { width: dishWidth }]}>
                      <FadeInImage accessible={false} source={{ uri: image }} style={styles.dishImage} resizeMode="cover" />
                      <View style={styles.dishCopy}>
                        <Text style={styles.dishName} numberOfLines={1}>{dish.nom}</Text>
                        {dish.description ? <Text style={styles.dishDescription} numberOfLines={2}>{dish.description}</Text> : null}
                        <Text style={styles.price}>{dish.prix}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionHeader eyebrow="S’y rendre" title="Localisation" />
            <View style={styles.map}>
              <RestaurantLocationMap
                latitude={mapLatitude}
                longitude={mapLongitude}
                title={restaurant.nom}
                description={restaurant.adresse}
                hasValidCoords={hasCoordinates}
              />
            </View>
            <View style={styles.addressCard}>
              <View style={styles.addressIcon}><Ionicons name="location-outline" size={21} color={colors.primary} /></View>
              <View style={styles.addressCopy}>
                <Text style={styles.addressLabel}>Adresse</Text>
                <Text style={styles.address}>{restaurant.adresse}</Text>
              </View>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Ouvrir l’itinéraire"
                hitSlop={6}
                onPress={openDirections}
                style={({ pressed }) => [styles.directionButton, pressed && styles.pressed]}
              >
                <Ionicons name="navigate-outline" size={20} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          <PressableScale accessibilityRole="button" accessibilityLabel={`Signaler une information incorrecte pour ${restaurant.nom}`} haptic="selection" onPress={() => void reportIncorrectInformation()} style={styles.reportButton}>
            <Ionicons name="alert-circle-outline" size={19} color={colors.textSecondary} />
            <View style={styles.reportCopy}><Text style={styles.reportTitle}>Une information semble incorrecte ?</Text><Text style={styles.reportText}>Signaler l’adresse, les horaires, le menu ou un établissement fermé.</Text></View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </PressableScale>
        </View>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <View style={styles.ctaRow}>
          <AppButton compact label="Itinéraire" icon={<Ionicons name="navigate-outline" size={18} color={colors.white} />} onPress={openDirections} style={styles.ctaMain} />
          <AppButton compact label="WhatsApp" variant="secondary" disabled={!restaurant.telephone} icon={<Ionicons name="logo-whatsapp" size={18} color={colors.primaryDark} />} onPress={openWhatsApp} style={styles.ctaMain} />
          <PressableScale accessibilityRole="button" accessibilityLabel="Inviter un ami" haptic="soft" onPress={onInvite} style={styles.inviteButton}>
            <Ionicons name="person-add-outline" size={18} color={colors.primary} />
            <Text style={styles.inviteLabel}>Inviter</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { backgroundColor: colors.background },
  hero: { height: 316, overflow: 'hidden', backgroundColor: colors.backgroundAlt },
  heroImage: { width: '100%', height: '100%' },
  back: { position: 'absolute', left: spacing.md, width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.scrim },
  page: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: spacing.lg, gap: spacing.xl },
  summaryCard: { marginTop: -34, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.raised },
  cuisine: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  name: { color: colors.text, fontFamily: typography.bold, fontSize: 27, lineHeight: 33, marginTop: 4 },
  summaryMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: colors.text, fontFamily: typography.semiBold, fontSize: 13 },
  metaDivider: { width: 1, height: 15, backgroundColor: colors.borderStrong },
  priceRange: { color: colors.textSecondary, fontFamily: typography.semiBold, fontSize: 13 },
  summaryAddress: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  summaryAddressText: { flex: 1, color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
  trustBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill },
  trustVerified: { backgroundColor: '#E8F6EF' },
  trustPending: { backgroundColor: '#FFF6DC' },
  trustText: { flexShrink: 1, fontFamily: typography.semiBold, fontSize: 10 },
  section: { gap: spacing.sm },
  description: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 15, lineHeight: 23 },
  specialties: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xxs },
  specialtyChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  specialtyText: { color: colors.primaryDark, fontFamily: typography.semiBold, fontSize: 11 },
  quickGrid: { flexDirection: 'row', gap: spacing.sm },
  quickCard: { flex: 1, minHeight: 128, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.soft },
  quickIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  quickIconOpen: { backgroundColor: '#E8F6EF' },
  quickLabel: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 11, marginTop: spacing.sm },
  quickLabelOpen: { color: colors.success },
  quickValue: { color: colors.text, fontFamily: typography.semiBold, fontSize: 13, lineHeight: 18, marginTop: 2 },
  horizontal: { gap: spacing.sm, paddingRight: spacing.md },
  galleryImage: { height: 198, borderRadius: radius.lg, backgroundColor: colors.backgroundAlt },
  dishCard: { overflow: 'hidden', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.soft },
  dishImage: { width: '100%', height: 148, backgroundColor: colors.backgroundAlt },
  dishCopy: { minHeight: 108, padding: spacing.md },
  dishName: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  dishDescription: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 17, marginTop: 4 },
  price: { color: colors.primary, fontFamily: typography.bold, fontSize: 15, marginTop: 'auto', paddingTop: spacing.xs },
  factsCard: { paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  factRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  factIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  factCopy: { flex: 1 },
  factLabel: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 11 },
  factValue: { color: colors.text, fontFamily: typography.semiBold, fontSize: 13, lineHeight: 18, marginTop: 2 },
  tagGroup: { gap: spacing.xs },
  tagGroupTitle: { color: colors.text, fontFamily: typography.semiBold, fontSize: 13 },
  serviceChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: '#E8F6EF' },
  serviceText: { color: colors.success, fontFamily: typography.semiBold, fontSize: 11 },
  paymentText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 20 },
  map: { overflow: 'hidden', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.backgroundAlt },
  addressCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  addressIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  addressCopy: { flex: 1 },
  addressLabel: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 11 },
  address: { color: colors.text, fontFamily: typography.semiBold, fontSize: 13, lineHeight: 18, marginTop: 2 },
  directionButton: { width: 42, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  reportButton: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  reportCopy: { flex: 1 },
  reportTitle: { color: colors.text, fontFamily: typography.semiBold, fontSize: 13 },
  reportText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11, lineHeight: 16, marginTop: 2 },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ctaMain: { flex: 1, paddingHorizontal: spacing.sm },
  inviteButton: { width: 56, height: 46, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  inviteLabel: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 9 },
  pressed: { opacity: 0.72 },
});

function FactRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.factRow}>
      <View style={styles.factIcon}><Ionicons name={icon} size={18} color={colors.primary} /></View>
      <View style={styles.factCopy}><Text style={styles.factLabel}>{label}</Text><Text style={styles.factValue}>{value}</Text></View>
    </View>
  );
}
