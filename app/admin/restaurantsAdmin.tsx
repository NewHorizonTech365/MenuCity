import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RestaurantCoordinatePicker from '../../components/RestaurantCoordinatePicker';
import AppButton from '../../components/ui/AppButton';
import AppHeader from '../../components/ui/AppHeader';
import Chip from '../../components/ui/Chip';
import DateTimePickerField from '../../components/ui/DateTimePickerField';
import FadeInImage from '../../components/ui/FadeInImage';
import FormField from '../../components/ui/FormField';
import PressableScale from '../../components/ui/PressableScale';
import SearchField from '../../components/ui/SearchField';
import SegmentedControl from '../../components/ui/SegmentedControl';
import StateView from '../../components/ui/StateView';
import { areMediaUploadsEnabled, uploadMedia } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';
import { useData } from '../../providers/DataProvider';
import { colors, radius, shadows, spacing, typography } from '../../styles/theme';
import type { Restaurant, RestaurantPaymentMethod, RestaurantService } from '../../types/Restaurant';

type MenuItem = NonNullable<Restaurant['menu']>[number];
type Currency = 'USD' | 'CDF';
type CatalogView = 'active' | 'archived';

type RestaurantForm = {
  nom: string;
  cuisine: string;
  adresse: string;
  quartier: string;
  commune: string;
  repere: string;
  telephone: string;
  description: string;
  priceMin: string;
  priceMax: string;
  currency: Currency;
  prixMoyenCdf: string;
  openingTime: string;
  closingTime: string;
  openingDays: number[];
  latitude?: number;
  longitude?: number;
  image: string;
  logo: string;
  photos: string[];
  note: number;
  specialites: string[];
  services: RestaurantService[];
  paymentMethods: RestaurantPaymentMethod[];
  isVerified: boolean;
  lastVerifiedAt?: string;
};

type MenuForm = {
  id?: string;
  nom: string;
  description: string;
  amount: string;
  currency: Currency;
  photosMenu: string[];
};

const cuisines = ['Congolaise', 'Africaine', 'Grillades', 'Poisson', 'Fast-food', 'Internationale', 'Fusion'];
const services: RestaurantService[] = ['Livraison', 'Parking', 'Réservation', 'Terrasse', 'À emporter'];
const paymentMethods: RestaurantPaymentMethod[] = ['Espèces', 'Carte bancaire', 'Airtel Money', 'M-Pesa', 'Orange Money'];
const currencies: Currency[] = ['USD', 'CDF'];
const catalogSegments: { key: CatalogView; label: string }[] = [{ key: 'active', label: 'Actifs' }, { key: 'archived', label: 'Archivés' }];
const weekDays = [
  { value: 1, label: 'Lun' }, { value: 2, label: 'Mar' }, { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' }, { value: 5, label: 'Ven' }, { value: 6, label: 'Sam' }, { value: 0, label: 'Dim' },
];

const createBlankForm = (): RestaurantForm => ({
  nom: '', cuisine: '', adresse: '', quartier: '', commune: '', repere: '', telephone: '', description: '',
  priceMin: '', priceMax: '', currency: 'USD', prixMoyenCdf: '', openingTime: '09:00', closingTime: '22:00',
  openingDays: [1, 2, 3, 4, 5, 6], image: '', logo: '', photos: [], note: 4,
  specialites: [], services: [], paymentMethods: [], isVerified: false,
});

const parsePrice = (value: string) => {
  const amounts = value.match(/\d+(?:[.,]\d+)?/g) || [];
  return {
    priceMin: amounts[0] || '',
    priceMax: amounts[1] || '',
    currency: (value.toUpperCase().includes('CDF') ? 'CDF' : 'USD') as Currency,
  };
};

const restaurantToForm = (restaurant: Restaurant): RestaurantForm => {
  const price = parsePrice(restaurant.prixMoyen);
  const period = restaurant.openingPeriods?.[0];
  return {
    nom: restaurant.nom,
    cuisine: restaurant.cuisine,
    adresse: restaurant.adresse,
    quartier: restaurant.quartier || '',
    commune: restaurant.commune || '',
    repere: restaurant.repere || '',
    telephone: restaurant.telephone,
    description: restaurant.description,
    ...price,
    prixMoyenCdf: restaurant.prixMoyenCdf?.replace(/\s*CDF$/i, '') || '',
    openingTime: period?.opensAt || '09:00',
    closingTime: period?.closesAt || '22:00',
    openingDays: period?.days || [1, 2, 3, 4, 5, 6],
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    image: restaurant.image,
    logo: restaurant.logo,
    photos: [...restaurant.photos],
    note: restaurant.note,
    specialites: [...restaurant.specialites],
    services: [...(restaurant.services || [])],
    paymentMethods: [...(restaurant.paymentMethods || [])],
    isVerified: Boolean(restaurant.isVerified),
    lastVerifiedAt: restaurant.lastVerifiedAt,
  };
};

const timeToDate = (value: string) => {
  const date = new Date();
  const [hours, minutes] = value.split(':').map(Number);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

const dateToTime = (value: Date) => `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
const displayTime = (value: string) => value.replace(':', 'h');
const isLocalImage = (uri?: string) => Boolean(uri && !/^https?:\/\//i.test(uri));

export default function RestaurantsAdminScreen() {
  const router = useRouter();
  const { isAuthReady, isDevelopmentSession, user, getAuthToken } = useAuth();
  const { restaurants, archivedRestaurants, addRestaurant, updateRestaurant, deleteRestaurant, restoreRestaurant, addMenuItem, updateMenuItem, deleteMenuItem, reload, getRestaurant } = useData();
  const [query, setQuery] = useState('');
  const [catalogView, setCatalogView] = useState<CatalogView>('active');
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [form, setForm] = useState<RestaurantForm>(createBlankForm);
  const [restaurantModalVisible, setRestaurantModalVisible] = useState(false);
  const [menuRestaurant, setMenuRestaurant] = useState<Restaurant | null>(null);
  const [menuForm, setMenuForm] = useState<MenuForm | null>(null);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [restaurantAttempted, setRestaurantAttempted] = useState(false);
  const [menuAttempted, setMenuAttempted] = useState(false);
  const [savingRestaurant, setSavingRestaurant] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);
  const [archiveCandidate, setArchiveCandidate] = useState<Restaurant | null>(null);
  const [archivingRestaurant, setArchivingRestaurant] = useState(false);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/admin'));

  useEffect(() => {
    if (isAuthReady && (!user || user.role !== 'admin')) router.replace('/home');
  }, [isAuthReady, router, user]);

  const filtered = useMemo(() => {
    const source = catalogView === 'active' ? restaurants : archivedRestaurants;
    const needle = query.trim().toLowerCase();
    if (!needle) return source;
    return source.filter((restaurant) => [restaurant.nom, restaurant.cuisine, restaurant.adresse, restaurant.quartier]
      .filter(Boolean).join(' ').toLowerCase().includes(needle));
  }, [archivedRestaurants, catalogView, query, restaurants]);

  const uploadImageUri = async (uri: string, scope: string, ownerId: string) => {
    const extension = uri.split('?')[0].toLowerCase();
    const contentType = extension.endsWith('.png') ? 'image/png' as const : extension.endsWith('.webp') ? 'image/webp' as const : 'image/jpeg' as const;
    const blob = await (await fetch(uri)).blob();
    return uploadMedia(`/v1/uploads/${scope}/${ownerId}`, blob, contentType, getAuthToken);
  };

  const pickImage = async (useCamera: boolean) => {
    const permission = useCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', `Autorisez l’accès à ${useCamera ? 'la caméra' : 'la galerie'} pour continuer.`);
      return null;
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
    return result.canceled ? null : result.assets[0]?.uri || null;
  };

  const chooseImage = async (target: 'image' | 'logo' | 'photos' | 'menu') => {
    if (!isDevelopmentSession && !areMediaUploadsEnabled) {
      Alert.alert('Médias indisponibles', 'Le stockage distant sera activé avec le backend. Les images existantes restent conservées.');
      return;
    }
    Alert.alert('Ajouter une image', 'Choisissez la source.', [
      { text: 'Caméra', onPress: () => void applyPickedImage(true, target) },
      { text: 'Galerie', onPress: () => void applyPickedImage(false, target) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const applyPickedImage = async (useCamera: boolean, target: 'image' | 'logo' | 'photos' | 'menu') => {
    try {
      const uri = await pickImage(useCamera);
      if (!uri) return;
      if (target === 'menu') {
        setMenuForm((current) => current ? { ...current, photosMenu: [...current.photosMenu, uri] } : current);
      } else if (target === 'photos') {
        setForm((current) => ({ ...current, photos: [...current.photos, uri] }));
      } else {
        setForm((current) => ({ ...current, [target]: uri }));
      }
    } catch {
      Alert.alert('Image indisponible', 'Impossible de récupérer cette image.');
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(createBlankForm());
    setRestaurantAttempted(false);
    setRestaurantModalVisible(true);
  };

  const openEdit = (restaurant: Restaurant) => {
    setEditing(restaurant);
    setForm(restaurantToForm(restaurant));
    setRestaurantAttempted(false);
    setRestaurantModalVisible(true);
  };

  const saveRestaurant = async () => {
    setRestaurantAttempted(true);
    if (!form.nom.trim() || !form.cuisine.trim() || !form.adresse.trim() || !form.openingDays.length || savingRestaurant) return;
    setSavingRestaurant(true);
    try {
      const priceRange = [form.priceMin.trim(), form.priceMax.trim()].filter(Boolean).join('-');
      const payload: Partial<Restaurant> = {
        nom: form.nom.trim(),
        cuisine: form.cuisine.trim(),
        adresse: form.adresse.trim(),
        quartier: form.quartier.trim() || undefined,
        commune: form.commune.trim() || undefined,
        repere: form.repere.trim() || undefined,
        telephone: form.telephone.trim(),
        description: form.description.trim(),
        prixMoyen: priceRange ? `${priceRange} ${form.currency}` : '',
        prixMoyenCdf: form.prixMoyenCdf.trim() ? `${form.prixMoyenCdf.trim()} CDF` : undefined,
        horaires: `${displayTime(form.openingTime)} - ${displayTime(form.closingTime)}`,
        openingPeriods: [{ days: form.openingDays, opensAt: form.openingTime, closesAt: form.closingTime }],
        latitude: form.latitude,
        longitude: form.longitude,
        image: isLocalImage(form.image) && !isDevelopmentSession ? editing?.image || '' : form.image,
        logo: isLocalImage(form.logo) && !isDevelopmentSession ? editing?.logo || '' : form.logo,
        photos: isDevelopmentSession ? form.photos : form.photos.filter((photo) => !isLocalImage(photo)),
        note: form.note,
        specialites: form.specialites,
        services: form.services,
        paymentMethods: form.paymentMethods,
        isVerified: form.isVerified,
        lastVerifiedAt: form.isVerified ? form.lastVerifiedAt || new Date().toISOString() : undefined,
      };
      const saved = editing ? await updateRestaurant(editing.id, payload) : await addRestaurant(payload);
      if (!saved) throw new Error('Restaurant introuvable après enregistrement.');
      if (!isDevelopmentSession) {
        const uploads = [
          ...(isLocalImage(form.image) ? [uploadImageUri(form.image, 'restaurant-main', saved.id)] : []),
          ...(isLocalImage(form.logo) ? [uploadImageUri(form.logo, 'restaurant-logo', saved.id)] : []),
          ...form.photos.filter(isLocalImage).map((photo) => uploadImageUri(photo, 'restaurant-photo', saved.id)),
        ];
        await Promise.all(uploads);
      }
      await reload();
      setRestaurantModalVisible(false);
      Alert.alert('Enregistré', editing ? 'La fiche a été mise à jour.' : 'Le restaurant a été ajouté.');
    } catch (error) {
      Alert.alert('Enregistrement impossible', error instanceof Error ? error.message : 'Réessayez dans quelques instants.');
    } finally {
      setSavingRestaurant(false);
    }
  };

  const archiveRestaurant = (restaurant: Restaurant) => {
    setArchiveCandidate(restaurant);
  };

  const confirmRestaurantArchive = async () => {
    if (!archiveCandidate || archivingRestaurant) return;
    setArchivingRestaurant(true);
    try {
      await deleteRestaurant(archiveCandidate.id);
      setArchiveCandidate(null);
    } catch {
      Alert.alert('Archivage impossible', 'Réessayez dans quelques instants.');
    } finally {
      setArchivingRestaurant(false);
    }
  };

  const restoreArchivedRestaurant = async (restaurant: Restaurant) => {
    try {
      const restored = await restoreRestaurant(restaurant.id);
      if (!restored) throw new Error('Restaurant archivé introuvable.');
      Alert.alert('Restaurant restauré', `« ${restaurant.nom} » est de nouveau visible dans les restaurants actifs.`);
    } catch (error) {
      Alert.alert('Restauration impossible', error instanceof Error ? error.message : 'Réessayez dans quelques instants.');
    }
  };

  const openMenu = (restaurant: Restaurant) => {
    setMenuRestaurant(restaurant);
    setMenuForm(null);
    setMenuAttempted(false);
    setMenuModalVisible(true);
  };

  const editMenuItem = (item?: MenuItem) => {
    const price = parsePrice(item?.prix || '');
    setMenuAttempted(false);
    setMenuForm({ id: item?.id, nom: item?.nom || '', description: item?.description || '', amount: price.priceMin, currency: price.currency, photosMenu: [...(item?.photosMenu || [])] });
  };

  const refreshMenuRestaurant = async () => {
    if (!menuRestaurant) return;
    const fresh = await getRestaurant(menuRestaurant.id);
    setMenuRestaurant(fresh);
  };

  const saveMenuItem = async () => {
    setMenuAttempted(true);
    if (!menuRestaurant || !menuForm?.nom.trim() || !menuForm.amount.trim() || savingMenu) return;
    setSavingMenu(true);
    try {
      const photosMenu = isDevelopmentSession ? menuForm.photosMenu : menuForm.photosMenu.filter((photo) => !isLocalImage(photo));
      const payload = { nom: menuForm.nom.trim(), description: menuForm.description.trim(), prix: `${menuForm.amount.trim()} ${menuForm.currency}`, photosMenu };
      const saved = menuForm.id
        ? await updateMenuItem(menuRestaurant.id, menuForm.id, payload)
        : await addMenuItem(menuRestaurant.id, payload);
      if (!saved) throw new Error('Plat introuvable après enregistrement.');
      if (!isDevelopmentSession) await Promise.all(menuForm.photosMenu.filter(isLocalImage).map((photo) => uploadImageUri(photo, 'menu-item-photo', saved.id)));
      await reload();
      await refreshMenuRestaurant();
      setMenuForm(null);
    } catch (error) {
      Alert.alert('Plat non enregistré', error instanceof Error ? error.message : 'Réessayez dans quelques instants.');
    } finally {
      setSavingMenu(false);
    }
  };

  const removeMenuItem = (item: MenuItem) => {
    if (!menuRestaurant) return;
    if (Platform.OS === 'web') {
      const confirmed = typeof globalThis.confirm === 'function'
        ? globalThis.confirm(`Supprimer « ${item.nom} » ?`)
        : false;
      if (confirmed) void deleteMenuItem(menuRestaurant.id, item.id).then(refreshMenuRestaurant);
      return;
    }
    Alert.alert('Supprimer le plat', `Supprimer « ${item.nom} » ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => void deleteMenuItem(menuRestaurant.id, item.id).then(refreshMenuRestaurant) },
    ]);
  };

  if (!isAuthReady || !user || user.role !== 'admin') {
    return <SafeAreaView style={styles.safe}><StateView title="Vérification de l’accès…" loading /></SafeAreaView>;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.screen}>
        <AppHeader title="Gérer les restaurants" subtitle={catalogView === 'active' ? `${restaurants.length} adresse${restaurants.length > 1 ? 's' : ''} active${restaurants.length > 1 ? 's' : ''}` : `${archivedRestaurants.length} archive${archivedRestaurants.length > 1 ? 's' : ''} récupérable${archivedRestaurants.length > 1 ? 's' : ''}`} onBack={goBack} />
        <SegmentedControl<CatalogView> segments={catalogSegments} value={catalogView} onChange={(value) => { setCatalogView(value); setQuery(''); }} />
        <SearchField value={query} onChangeText={setQuery} placeholder={catalogView === 'active' ? 'Nom, cuisine, quartier ou adresse' : 'Rechercher dans les archives'} />
        <FlatList
          data={filtered}
          keyExtractor={(restaurant) => restaurant.id}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListEmptyComponent={<StateView title={catalogView === 'active' ? 'Aucun restaurant trouvé' : 'Aucun restaurant archivé'} message={catalogView === 'active' ? 'Modifiez la recherche ou ajoutez une nouvelle adresse.' : 'Les restaurants archivés apparaîtront ici et pourront être restaurés.'} icon={catalogView === 'active' ? 'search-outline' : 'archive-outline'} />}
          renderItem={({ item }) => catalogView === 'active'
            ? <RestaurantAdminCard restaurant={item} onEdit={() => openEdit(item)} onMenu={() => openMenu(item)} onArchive={() => archiveRestaurant(item)} />
            : <ArchivedRestaurantAdminCard restaurant={item} onRestore={() => void restoreArchivedRestaurant(item)} />}
        />
        {catalogView === 'active' ? (
          <PressableScale accessibilityRole="button" accessibilityLabel="Ajouter un restaurant" haptic="soft" onPress={openAdd} style={styles.addButton}>
            <Ionicons name="add" size={28} color={colors.white} />
          </PressableScale>
        ) : null}
      </View>

      <Modal
        visible={Boolean(archiveCandidate)}
        transparent
        animationType="fade"
        onRequestClose={() => !archivingRestaurant && setArchiveCandidate(null)}
      >
        <View style={styles.confirmBackdrop}>
          <View accessibilityRole="alert" style={styles.confirmCard}>
            <View style={styles.confirmIcon}><Ionicons name="archive-outline" size={24} color={colors.error} /></View>
            <Text style={styles.confirmTitle}>Archiver ce restaurant ?</Text>
            <Text style={styles.confirmMessage}>
              « {archiveCandidate?.nom} » disparaîtra du catalogue public, mais restera récupérable dans l’onglet Archivés.
            </Text>
            <View style={styles.confirmActions}>
              <AppButton label="Annuler" variant="ghost" disabled={archivingRestaurant} onPress={() => setArchiveCandidate(null)} style={styles.flexButton} />
              <AppButton label="Archiver" variant="danger" loading={archivingRestaurant} onPress={() => void confirmRestaurantArchive()} style={styles.flexButton} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={restaurantModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => !savingRestaurant && setRestaurantModalVisible(false)}>
        <SafeEditModal title={editing ? 'Modifier le restaurant' : 'Nouveau restaurant'} onClose={() => !savingRestaurant && setRestaurantModalVisible(false)}>
          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formContent}>
            <FormSection title="Identité" subtitle="Les informations visibles dans le catalogue.">
              <FormField label="Nom" value={form.nom} onChangeText={(nom) => setForm((current) => ({ ...current, nom }))} placeholder="Nom du restaurant" editable={!savingRestaurant} error={restaurantAttempted && !form.nom.trim() ? 'Le nom est requis.' : undefined} />
              <ChoiceGroup label="Cuisine principale" values={cuisines} selected={[form.cuisine]} onToggle={(cuisine) => setForm((current) => ({ ...current, cuisine }))} />
              {!cuisines.includes(form.cuisine) ? <FormField label="Autre cuisine" value={form.cuisine} onChangeText={(cuisine) => setForm((current) => ({ ...current, cuisine }))} placeholder="Précisez la cuisine" editable={!savingRestaurant} /> : null}
              {restaurantAttempted && !form.cuisine.trim() ? <Text style={styles.error}>Choisissez une cuisine.</Text> : null}
              <FormField label="Description" value={form.description} onChangeText={(description) => setForm((current) => ({ ...current, description }))} placeholder="Cuisine, ambiance et expérience proposée" multiline textAlignVertical="top" style={styles.multiline} editable={!savingRestaurant} />
              <SpecialtyEditor values={form.specialites} onChange={(specialites) => setForm((current) => ({ ...current, specialites }))} disabled={savingRestaurant} />
            </FormSection>

            <FormSection title="Adresse locale" subtitle="Privilégiez le quartier et un point de repère connu.">
              <FormField label="Adresse" value={form.adresse} onChangeText={(adresse) => setForm((current) => ({ ...current, adresse }))} placeholder="Avenue, numéro et zone" editable={!savingRestaurant} error={restaurantAttempted && !form.adresse.trim() ? 'L’adresse est requise.' : undefined} />
              <View style={styles.twoColumns}>
                <View style={styles.flexField}><FormField label="Quartier" value={form.quartier} onChangeText={(quartier) => setForm((current) => ({ ...current, quartier }))} placeholder="Ex. Golf" editable={!savingRestaurant} /></View>
                <View style={styles.flexField}><FormField label="Commune" value={form.commune} onChangeText={(commune) => setForm((current) => ({ ...current, commune }))} placeholder="Ex. Lubumbashi" editable={!savingRestaurant} /></View>
              </View>
              <FormField label="Point de repère" value={form.repere} onChangeText={(repere) => setForm((current) => ({ ...current, repere }))} placeholder="Ex. en face du bâtiment Hypnose" editable={!savingRestaurant} />
              <RestaurantCoordinatePicker latitude={form.latitude} longitude={form.longitude} onChange={(latitude, longitude) => setForm((current) => ({ ...current, latitude, longitude }))} />
            </FormSection>

            <FormSection title="Horaires et contact" subtitle="Ces informations déterminent le statut ouvert ou fermé.">
              <FormField label="Téléphone / WhatsApp" value={form.telephone} onChangeText={(telephone) => setForm((current) => ({ ...current, telephone }))} placeholder="+243…" keyboardType="phone-pad" editable={!savingRestaurant} />
              <ChoiceGroup label="Jours d’ouverture" values={weekDays.map((day) => day.label)} selected={weekDays.filter((day) => form.openingDays.includes(day.value)).map((day) => day.label)} onToggle={(label) => {
                const value = weekDays.find((day) => day.label === label)?.value;
                if (value === undefined) return;
                setForm((current) => ({ ...current, openingDays: current.openingDays.includes(value) ? current.openingDays.filter((day) => day !== value) : [...current.openingDays, value] }));
              }} />
              {restaurantAttempted && !form.openingDays.length ? <Text style={styles.error}>Choisissez au moins un jour d’ouverture.</Text> : null}
              <View style={styles.twoColumns}>
                <View style={styles.flexField}><DateTimePickerField label="Ouverture" mode="time" value={timeToDate(form.openingTime)} onChange={(value) => setForm((current) => ({ ...current, openingTime: dateToTime(value) }))} disabled={savingRestaurant} /></View>
                <View style={styles.flexField}><DateTimePickerField label="Fermeture" mode="time" value={timeToDate(form.closingTime)} onChange={(value) => setForm((current) => ({ ...current, closingTime: dateToTime(value) }))} disabled={savingRestaurant} /></View>
              </View>
            </FormSection>

            <FormSection title="Budget et services" subtitle="Aidez les visiteurs à choisir sans devoir appeler.">
              <View style={styles.twoColumns}>
                <View style={styles.flexField}><FormField label="Prix minimum" value={form.priceMin} onChangeText={(priceMin) => setForm((current) => ({ ...current, priceMin }))} placeholder="10" keyboardType="decimal-pad" editable={!savingRestaurant} /></View>
                <View style={styles.flexField}><FormField label="Prix maximum" value={form.priceMax} onChangeText={(priceMax) => setForm((current) => ({ ...current, priceMax }))} placeholder="25" keyboardType="decimal-pad" editable={!savingRestaurant} /></View>
              </View>
              <ChoiceGroup label="Devise affichée" values={currencies} selected={[form.currency]} onToggle={(currency) => setForm((current) => ({ ...current, currency: currency as Currency }))} />
              {form.currency === 'USD' ? <FormField label="Équivalent CDF facultatif" value={form.prixMoyenCdf} onChangeText={(prixMoyenCdf) => setForm((current) => ({ ...current, prixMoyenCdf }))} placeholder="Ex. 30 000-70 000" keyboardType="numeric" editable={!savingRestaurant} hint="Utilisez uniquement le taux communiqué par le restaurant." /> : null}
              <ChoiceGroup label="Services" values={services} selected={form.services} multiple onToggle={(service) => setForm((current) => ({ ...current, services: toggleValue(current.services, service as RestaurantService) }))} />
              <ChoiceGroup label="Moyens de paiement" values={paymentMethods} selected={form.paymentMethods} multiple onToggle={(payment) => setForm((current) => ({ ...current, paymentMethods: toggleValue(current.paymentMethods, payment as RestaurantPaymentMethod) }))} />
            </FormSection>

            <FormSection title="Photos" subtitle="Choisissez des images réelles et récentes du restaurant.">
              <View style={styles.mediaGrid}>
                <MediaCard label="Photo principale" uri={form.image} onPress={() => void chooseImage('image')} onClear={form.image ? () => setForm((current) => ({ ...current, image: '' })) : undefined} />
                <MediaCard label="Logo" uri={form.logo} onPress={() => void chooseImage('logo')} onClear={form.logo ? () => setForm((current) => ({ ...current, logo: '' })) : undefined} />
              </View>
              <AppButton compact label="Ajouter à la galerie" variant="secondary" icon={<Ionicons name="images-outline" size={18} color={colors.primaryDark} />} onPress={() => void chooseImage('photos')} />
              {form.photos.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoStrip}>{form.photos.map((photo, index) => <PhotoThumbnail key={`${photo}-${index}`} uri={photo} label={`Photo ${index + 1}`} onRemove={() => setForm((current) => ({ ...current, photos: current.photos.filter((_item, photoIndex) => photoIndex !== index) }))} />)}</ScrollView> : <Text style={styles.emptyHint}>Aucune photo secondaire.</Text>}
            </FormSection>

            <FormSection title="Confiance" subtitle="Ne validez une fiche qu’après vérification auprès du restaurant.">
              <View style={styles.verifyRow}>
                <View style={styles.verifyIcon}><Ionicons name="shield-checkmark-outline" size={21} color={colors.success} /></View>
                <View style={styles.verifyCopy}><Text style={styles.verifyTitle}>Fiche vérifiée</Text><Text style={styles.verifyText}>Adresse, téléphone, horaires et prix ont été contrôlés.</Text></View>
                <Switch value={form.isVerified} onValueChange={(isVerified) => setForm((current) => ({ ...current, isVerified, lastVerifiedAt: isVerified ? new Date().toISOString() : undefined }))} trackColor={{ false: colors.borderStrong, true: colors.primaryLight }} thumbColor={form.isVerified ? colors.primary : colors.surface} />
              </View>
            </FormSection>

            <AppButton label={editing ? 'Enregistrer les modifications' : 'Créer le restaurant'} loading={savingRestaurant} onPress={() => void saveRestaurant()} />
          </ScrollView>
        </SafeEditModal>
      </Modal>

      <Modal visible={menuModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => !savingMenu && setMenuModalVisible(false)}>
        <SafeEditModal title={`Menu — ${menuRestaurant?.nom || ''}`} onClose={() => !savingMenu && setMenuModalVisible(false)}>
          <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formContent}>
            <AppButton label="Ajouter un plat" icon={<Ionicons name="add" size={19} color={colors.white} />} onPress={() => editMenuItem()} />
            {menuRestaurant?.menu?.length ? menuRestaurant.menu.map((item, index) => (
              <View key={`${item.id}-${index}`} style={styles.menuRow}>
                <FadeInImage accessible={false} source={{ uri: item.photosMenu?.[0] || menuRestaurant.image }} style={styles.menuImage} />
                <View style={styles.menuCopy}><Text style={styles.menuName}>{item.nom}</Text><Text style={styles.menuPrice}>{item.prix}</Text></View>
                <PressableScale accessibilityRole="button" accessibilityLabel={`Modifier ${item.nom}`} onPress={() => editMenuItem(item)} style={styles.iconButton}><Ionicons name="create-outline" size={19} color={colors.primary} /></PressableScale>
                <PressableScale accessibilityRole="button" accessibilityLabel={`Supprimer ${item.nom}`} onPress={() => removeMenuItem(item)} style={styles.iconButton}><Ionicons name="trash-outline" size={19} color={colors.error} /></PressableScale>
              </View>
            )) : <Text style={styles.emptyHint}>Aucun plat enregistré.</Text>}

            {menuForm ? (
              <FormSection title={menuForm.id ? 'Modifier le plat' : 'Nouveau plat'} subtitle="Nom, prix et photo suffisent pour une première publication.">
                <FormField label="Nom du plat" value={menuForm.nom} onChangeText={(nom) => setMenuForm((current) => current ? { ...current, nom } : current)} placeholder="Ex. Fufu et poisson braisé" error={menuAttempted && !menuForm.nom.trim() ? 'Le nom est requis.' : undefined} editable={!savingMenu} />
                <FormField label="Description" value={menuForm.description} onChangeText={(description) => setMenuForm((current) => current ? { ...current, description } : current)} placeholder="Accompagnement, portion ou préparation" multiline textAlignVertical="top" style={styles.multilineSmall} editable={!savingMenu} />
                <FormField label="Prix" value={menuForm.amount} onChangeText={(amount) => setMenuForm((current) => current ? { ...current, amount } : current)} placeholder="12" keyboardType="decimal-pad" error={menuAttempted && !menuForm.amount.trim() ? 'Le prix est requis.' : undefined} editable={!savingMenu} />
                <ChoiceGroup label="Devise" values={currencies} selected={[menuForm.currency]} onToggle={(currency) => setMenuForm((current) => current ? { ...current, currency: currency as Currency } : current)} />
                <AppButton compact label="Ajouter une photo" variant="secondary" icon={<Ionicons name="image-outline" size={18} color={colors.primaryDark} />} onPress={() => void chooseImage('menu')} />
                {menuForm.photosMenu.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoStrip}>{menuForm.photosMenu.map((photo, index) => <PhotoThumbnail key={`${photo}-${index}`} uri={photo} label={`Photo du plat ${index + 1}`} onRemove={() => setMenuForm((current) => current ? { ...current, photosMenu: current.photosMenu.filter((_item, photoIndex) => photoIndex !== index) } : current)} />)}</ScrollView> : null}
                <View style={styles.formActions}><AppButton label="Annuler" variant="ghost" disabled={savingMenu} onPress={() => setMenuForm(null)} style={styles.flexButton} /><AppButton label="Enregistrer" loading={savingMenu} onPress={() => void saveMenuItem()} style={styles.flexButton} /></View>
              </FormSection>
            ) : null}
          </ScrollView>
        </SafeEditModal>
      </Modal>
    </SafeAreaView>
  );
}

function RestaurantAdminCard({ restaurant, onEdit, onMenu, onArchive }: { restaurant: Restaurant; onEdit: () => void; onMenu: () => void; onArchive: () => void }) {
  return (
    <View style={styles.restaurantCard}>
      <FadeInImage accessible={false} source={{ uri: restaurant.logo || restaurant.image }} style={styles.restaurantLogo} />
      <View style={styles.restaurantCopy}>
        <View style={styles.restaurantTitleRow}><Text style={styles.restaurantName} numberOfLines={1}>{restaurant.nom}</Text>{restaurant.isVerified ? <Ionicons name="shield-checkmark" size={16} color={colors.success} /> : null}</View>
        <Text style={styles.restaurantMeta} numberOfLines={2}>{restaurant.cuisine} · {restaurant.quartier || restaurant.adresse}</Text>
        <View style={styles.restaurantActions}>
          <SmallAction label="Modifier" icon="create-outline" onPress={onEdit} />
          <SmallAction label="Menu" icon="fast-food-outline" onPress={onMenu} />
          <SmallAction label="Archiver" icon="archive-outline" danger onPress={onArchive} />
        </View>
      </View>
    </View>
  );
}

function ArchivedRestaurantAdminCard({ restaurant, onRestore }: { restaurant: Restaurant; onRestore: () => void }) {
  return (
    <View style={[styles.restaurantCard, styles.archivedCard]}>
      <FadeInImage accessible={false} source={{ uri: restaurant.logo || restaurant.image }} style={[styles.restaurantLogo, styles.archivedLogo]} />
      <View style={styles.restaurantCopy}>
        <View style={styles.restaurantTitleRow}><Text style={styles.restaurantName} numberOfLines={1}>{restaurant.nom}</Text><View style={styles.archivedBadge}><Text style={styles.archivedBadgeText}>Archivé</Text></View></View>
        <Text style={styles.restaurantMeta} numberOfLines={2}>{restaurant.cuisine} · {restaurant.quartier || restaurant.adresse}</Text>
        <View style={styles.restaurantActions}><SmallAction label="Restaurer" icon="refresh-outline" success onPress={onRestore} /></View>
      </View>
    </View>
  );
}

function SmallAction({ label, icon, onPress, danger = false, success = false }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; danger?: boolean; success?: boolean }) {
  const tint = danger ? colors.error : success ? colors.success : colors.primary;
  return <PressableScale accessibilityRole="button" accessibilityLabel={label} haptic="selection" onPress={onPress} style={[styles.smallAction, danger && styles.smallActionDanger, success && styles.smallActionSuccess]}><Ionicons name={icon} size={15} color={tint} /><Text style={[styles.smallActionText, danger && styles.smallActionTextDanger, success && styles.smallActionTextSuccess]}>{label}</Text></PressableScale>;
}

function FormSection({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return <View style={styles.formSection}><View><Text style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}</View>{children}</View>;
}

function ChoiceGroup({ label, values, selected, onToggle, multiple = false }: { label: string; values: readonly string[]; selected: readonly string[]; onToggle: (value: string) => void; multiple?: boolean }) {
  return <View style={styles.choiceGroup}><Text style={styles.choiceLabel}>{label}</Text><View style={styles.choiceWrap}>{values.map((value) => <Chip key={value} label={value} selected={selected.includes(value)} onPress={() => onToggle(value)} />)}</View>{multiple ? <Text style={styles.choiceHint}>Plusieurs choix possibles.</Text> : null}</View>;
}

function SpecialtyEditor({ values, onChange, disabled }: { values: string[]; onChange: (values: string[]) => void; disabled: boolean }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const value = draft.trim();
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
    setDraft('');
  };
  return (
    <View style={styles.choiceGroup}>
      <Text style={styles.choiceLabel}>Spécialités</Text>
      <View style={styles.specialtyEntry}>
        <View style={styles.specialtyInput}><FormField label="Ajouter une spécialité" value={draft} onChangeText={setDraft} placeholder="Ex. Pondu" editable={!disabled} onSubmitEditing={add} /></View>
        <AppButton compact label="Ajouter" variant="secondary" disabled={!draft.trim() || disabled} onPress={add} />
      </View>
      {values.length ? <View style={styles.choiceWrap}>{values.map((value) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`Retirer ${value}`} onPress={() => onChange(values.filter((item) => item !== value))} style={styles.removableChip}><Text style={styles.removableText}>{value}</Text><Ionicons name="close" size={14} color={colors.primaryDark} /></Pressable>)}</View> : <Text style={styles.emptyHint}>Aucune spécialité ajoutée.</Text>}
    </View>
  );
}

function MediaCard({ label, uri, onPress, onClear }: { label: string; uri: string; onPress: () => void; onClear?: () => void }) {
  return (
    <View style={styles.mediaCard}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${uri ? 'Modifier' : 'Ajouter'} ${label.toLowerCase()}`} onPress={onPress} style={styles.mediaPreview}>
        {uri ? <Image source={{ uri }} style={styles.mediaImage} /> : <Ionicons name="image-outline" size={30} color={colors.primary} />}
      </Pressable>
      <Text style={styles.mediaLabel}>{label}</Text>
      {onClear ? <Pressable accessibilityRole="button" accessibilityLabel={`Retirer ${label.toLowerCase()}`} onPress={onClear}><Text style={styles.removeText}>Retirer</Text></Pressable> : null}
    </View>
  );
}

function PhotoThumbnail({ uri, label, onRemove }: { uri: string; label: string; onRemove: () => void }) {
  return <View style={styles.photoThumbnail}><Image source={{ uri }} style={styles.thumbnailImage} /><Pressable accessibilityRole="button" accessibilityLabel={`Retirer ${label}`} onPress={onRemove} style={styles.removePhoto}><Ionicons name="close" size={14} color={colors.white} /></Pressable></View>;
}

function SafeEditModal({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
  return <SafeAreaView edges={['top', 'bottom']} style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><View style={styles.modalHeader}><AppHeader title={title} onBack={onClose} /></View><View style={styles.flex}>{children}</View></KeyboardAvoidingView></SafeAreaView>;
}

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  screen: { flex: 1, paddingHorizontal: spacing.md, paddingTop: 4, gap: spacing.sm },
  confirmBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.scrim },
  confirmCard: { width: '100%', maxWidth: 420, alignItems: 'center', gap: spacing.sm, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.surface, ...shadows.raised },
  confirmIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: '#FEECEC' },
  confirmTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 20, textAlign: 'center' },
  confirmMessage: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  confirmActions: { width: '100%', flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  list: { gap: spacing.sm, paddingTop: spacing.xs, paddingBottom: 104 },
  addButton: { position: 'absolute', right: spacing.lg, bottom: spacing.lg + (Platform.OS === 'ios' ? 20 : 0), width: 60, height: 60, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, ...shadows.raised },
  restaurantCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  archivedCard: { borderColor: '#E9D29E', backgroundColor: '#FFFBF2' },
  restaurantLogo: { width: 76, height: 76, borderRadius: radius.md, backgroundColor: colors.backgroundAlt },
  archivedLogo: { opacity: 0.72 },
  restaurantCopy: { minWidth: 0, flex: 1 },
  restaurantTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  restaurantName: { minWidth: 0, flexShrink: 1, color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  archivedBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: '#F8E9C4' },
  archivedBadgeText: { color: colors.warning, fontFamily: typography.bold, fontSize: 9 },
  restaurantMeta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11, lineHeight: 16, marginTop: 3 },
  restaurantActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs },
  smallAction: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  smallActionDanger: { backgroundColor: '#FEECEC' },
  smallActionSuccess: { backgroundColor: '#E9F7F2' },
  smallActionText: { color: colors.primaryDark, fontFamily: typography.semiBold, fontSize: 10 },
  smallActionTextDanger: { color: colors.error },
  smallActionTextSuccess: { color: colors.success },
  modalHeader: { paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  formContent: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  formSection: { gap: spacing.md, padding: spacing.md, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  sectionTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 18 },
  sectionSubtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 17, marginTop: 3 },
  multiline: { minHeight: 104, paddingTop: spacing.sm },
  multilineSmall: { minHeight: 82, paddingTop: spacing.sm },
  twoColumns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  flexField: { flex: 1 },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 12 },
  choiceGroup: { gap: spacing.xs },
  choiceLabel: { color: colors.text, fontFamily: typography.semiBold, fontSize: 13 },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  choiceHint: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 10 },
  specialtyEntry: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  specialtyInput: { flex: 1 },
  removableChip: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  removableText: { color: colors.primaryDark, fontFamily: typography.semiBold, fontSize: 11 },
  mediaGrid: { flexDirection: 'row', gap: spacing.sm },
  mediaCard: { flex: 1, alignItems: 'center', gap: 5 },
  mediaPreview: { width: '100%', height: 112, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong, backgroundColor: colors.backgroundAlt },
  mediaImage: { width: '100%', height: '100%' },
  mediaLabel: { color: colors.text, fontFamily: typography.semiBold, fontSize: 11 },
  removeText: { color: colors.error, fontFamily: typography.semiBold, fontSize: 10 },
  photoStrip: { gap: spacing.sm },
  photoThumbnail: { width: 118, height: 82, overflow: 'hidden', borderRadius: radius.md, backgroundColor: colors.backgroundAlt },
  thumbnailImage: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: 5, right: 5, width: 26, height: 26, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.scrim },
  emptyHint: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 11 },
  verifyRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  verifyIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F6EF' },
  verifyCopy: { flex: 1 },
  verifyTitle: { color: colors.text, fontFamily: typography.semiBold, fontSize: 14 },
  verifyText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11, lineHeight: 16, marginTop: 2 },
  menuRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  menuImage: { width: 58, height: 58, borderRadius: radius.md, backgroundColor: colors.backgroundAlt },
  menuCopy: { minWidth: 0, flex: 1 },
  menuName: { color: colors.text, fontFamily: typography.semiBold, fontSize: 14 },
  menuPrice: { color: colors.primary, fontFamily: typography.bold, fontSize: 12, marginTop: 3 },
  iconButton: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.backgroundAlt },
  formActions: { flexDirection: 'row', gap: spacing.sm },
  flexButton: { flex: 1 },
});
