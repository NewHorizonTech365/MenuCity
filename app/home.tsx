// app/home.tsx — Home "Discovery" avec filtres + scroll vertical
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../styles/theme';
import BottomNavigation from '../components/BottomNavigation';
import Icon from '../components/Icon';

type Restaurant = {
  id: string;
  nom: string;
  image: string;
  rating: number;
  category: string;      // ex: 'Africain', 'Grillades', 'Fast-food'
  distanceKm?: number;
  price?: string;
  timeMin?: number;
};

// normalise pour comparer "fast" vs "Fast-food" etc.
const norm = (s: string) => s.toLowerCase().replace(/\s|-/g, '');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, spacing, radius, typography } = useTheme();

  // ----- Etat du filtre catégorie
  const [selectedCatKey, setSelectedCatKey] = useState<string>('all');

  const categories = useMemo(
    () => [
      { key: 'all', label: 'Tous' },
      { key: 'africain', label: 'Africain' },
      { key: 'fastfood', label: 'Fast-food' },
      { key: 'poisson', label: 'Poisson' },
      { key: 'grillades', label: 'Grillades' },
      { key: 'desserts', label: 'Desserts' },
    ],
    []
  );

  const popular: Restaurant[] = useMemo(
    () => [
      {
        id: '1',
        nom: 'Chez Mama Koko',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
        rating: 4.8,
        category: 'Africain',
        timeMin: 20,
        price: '$$',
      },
      {
        id: '2',
        nom: 'Le Grill du Marché',
        image: 'https://images.unsplash.com/photo-1555243896-c709bfa0b564?q=80&w=1200&auto=format&fit=crop',
        rating: 4.6,
        category: 'Grillades',
        timeMin: 25,
        price: '$$',
      },
      {
        id: '3',
        nom: 'Savanna Fish',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop',
        rating: 4.7,
        category: 'Poisson',
        timeMin: 18,
        price: '$$',
      },
    ],
    []
  );

  const nearYou: Restaurant[] = useMemo(
    () => [
      {
        id: '4',
        nom: 'Basilic & Tomate',
        image: 'https://images.unsplash.com/photo-1604908554007-09f9105a9472?q=80&w=1200&auto=format&fit=crop',
        rating: 4.4,
        category: 'Italien',
        distanceKm: 1.2,
        price: '$$',
      },
      {
        id: '5',
        nom: 'Street Burger',
        image: 'https://images.unsplash.com/photo-1551782450-17144c3a09e8?q=80&w=1200&auto=format&fit=crop',
        rating: 4.3,
        category: 'Fast-food',
        distanceKm: 0.8,
        price: '$',
      },
      {
        id: '6',
        nom: 'Sucré-Salé',
        image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop',
        rating: 4.5,
        category: 'Desserts',
        distanceKm: 1.7,
        price: '$$',
      },
    ],
    []
  );

  // ----- Filtrage selon la catégorie sélectionnée
  const matchCat = (itemCat: string, key: string) => {
    if (key === 'all') return true;
    const mapKeyToLabel = {
      africain: 'Africain',
      fastfood: 'Fast-food',
      poisson: 'Poisson',
      grillades: 'Grillades',
      desserts: 'Desserts',
    } as Record<string, string>;
    const wanted = mapKeyToLabel[key] ?? key;
    return norm(itemCat) === norm(wanted);
  };

  const filteredPopular = useMemo(
    () => popular.filter((r) => matchCat(r.category, selectedCatKey)),
    [popular, selectedCatKey]
  );
  const filteredNearYou = useMemo(
    () => nearYou.filter((r) => matchCat(r.category, selectedCatKey)),
    [nearYou, selectedCatKey]
  );

  const goToRestaurants = () => router.push('/restaurants' as any);
  const goToProfile = () => router.push('/profile' as any);
  const openRestaurant = (id: string) => router.push('/restaurants' as any); // placeholder

  const SectionHeader = ({ title, action }: { title: string; action?: () => void }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
      <Text style={{ fontFamily: typography.bold, fontSize: 20, color: colors.text }}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={action} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.sm }}>
          <Text style={{ fontFamily: typography.semiBold, color: colors.primary }}>Tout voir</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const Chip = ({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.card : 'rgba(255,255,255,0.6)',
        marginRight: 8,
      }}
      activeOpacity={0.8}
    >
      <Text
        style={{
          fontFamily: active ? typography.semiBold : typography.regular,
          color: active ? colors.text : colors.textLight,
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const RestaurantCard = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      onPress={() => openRestaurant(item.id)}
      style={{
        width: 260,
        marginRight: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: colors.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
      }}
      activeOpacity={0.9}
    >
      <View style={{ height: 150, backgroundColor: '#eee' }}>
        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        {/* badge rating */}
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: 'rgba(0,0,0,0.55)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: radius.pill,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Icon name="star" size={14} color="#FFD452" />
          <Text style={{ color: '#fff', marginLeft: 6, fontFamily: typography.semiBold, fontSize: 12 }}>
            {item.rating.toFixed(1)}
          </Text>
        </View>

        {/* tag catégorie */}
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(255,255,255,0.85)',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: radius.pill,
          }}
        >
          <Text style={{ fontFamily: typography.semiBold, fontSize: 12, color: colors.textLight }}>{item.category}</Text>
        </View>
      </View>

      <View style={{ padding: spacing.md }}>
        <Text style={{ fontFamily: typography.semiBold, fontSize: 16, color: colors.text }} numberOfLines={1}>
          {item.nom}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          {!!item.timeMin && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <Icon name="time" size={16} color={colors.textLight} />
              <Text style={{ color: colors.textLight, marginLeft: 4, fontSize: 13 }}>{item.timeMin} min</Text>
            </View>
          )}
          {!!item.distanceKm && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <Icon name="navigate" size={16} color={colors.textLight} />
              <Text style={{ color: colors.textLight, marginLeft: 4, fontSize: 13 }}>{item.distanceKm} km</Text>
            </View>
          )}
          {!!item.price && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="cash" size={16} color={colors.textLight} />
              <Text style={{ color: colors.textLight, marginLeft: 4, fontSize: 13 }}>{item.price}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // ----- RENDER
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl * 3 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <LinearGradient
          colors={['#FFFFFF', 'rgba(255,255,255,0.85)']}
          style={{ paddingTop: 54, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textLight, fontSize: 13, fontFamily: typography.regular }}>
                Bonjour,
              </Text>
              <Text style={{ color: colors.text, fontSize: 22, fontFamily: typography.bold }}>
                {user?.nom || 'Utilisateur'} 👋
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/profile' as any)}
              style={{ padding: 10, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.04)' }}
            >
              <Icon name="person" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View
            style={{
              marginTop: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: 'rgba(255,255,255,0.9)',
              paddingHorizontal: spacing.md,
              height: 48,
            }}
          >
            <Icon name="search" size={18} color={colors.textLight} />
            <TextInput
              placeholder="Rechercher un restaurant, un plat..."
              placeholderTextColor={colors.textLight}
              style={{
                marginLeft: 8,
                flex: 1,
                fontFamily: typography.regular,
                color: colors.text,
              }}
            />
            <TouchableOpacity onPress={() => router.push('/restaurants' as any)} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
              <Text style={{ color: colors.primary, fontFamily: typography.semiBold }}>Filtrer</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* CATEGORIES */}
        <View style={{ paddingVertical: spacing.md }}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(c) => c.key}
            contentContainerStyle={{ paddingHorizontal: spacing.lg }}
            renderItem={({ item }) => (
              <Chip
                label={item.label}
                active={item.key === selectedCatKey}
                onPress={() => setSelectedCatKey(item.key)}
              />
            )}
          />
        </View>

        {/* POPULAIRES */}
        <SectionHeader title="Populaires aujourd’hui" action={() => router.push('/restaurants' as any)} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredPopular}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}
          renderItem={({ item }) => <RestaurantCard item={item} />}
        />

        {/* BANNIÈRE RECO */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <LinearGradient
            colors={['#FFF1E6', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: radius.lg,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}
          >
            <Text style={{ fontFamily: typography.semiBold, color: colors.text, fontSize: 16, marginBottom: 6 }}>
              Recommandé pour vous
            </Text>
            <Text style={{ color: colors.textLight, fontFamily: typography.regular, marginBottom: spacing.md }}>
              Cuisine congolaise authentique dans une ambiance chaleureuse.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/restaurants' as any)}
              style={{
                alignSelf: 'flex-start',
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: radius.pill,
                backgroundColor: colors.primary,
              }}
              activeOpacity={0.85}
            >
              <Text style={{ color: '#fff', fontFamily: typography.semiBold }}>Découvrir</Text>
            </TouchableOpacity>

            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop' }}
              style={{
                position: 'absolute',
                right: -12,
                bottom: -6,
                width: 140,
                height: 140,
                borderRadius: radius.lg,
                opacity: 0.18,
              }}
            />
          </LinearGradient>
        </View>

        {/* PRÈS DE VOUS */}
        <SectionHeader title="Près de vous" action={() => router.push('/restaurants' as any)} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredNearYou}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}
          renderItem={({ item }) => <RestaurantCard item={item} />}
        />
      </ScrollView>

      {/* Bottom nav flottante */}
      <BottomNavigation currentRoute="home" />
    </View>
  );
}
