// app/home.tsx — Home "Discovery" avec filtres + scroll vertical

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../providers/AuthProvider';
import { useData } from '../providers/DataProvider';
import { useTheme } from '../styles/theme';

import BottomNavigation from '../components/BottomNavigation';
import Icon from '../components/Icon';
import { supabase } from "../lib/supabase";
import { useEffect } from 'react';

import type { Restaurant } from '../types/Restaurant';

// Normalisation des catégories
const norm = (s: string) => s.toLowerCase().replace(/\s|-/g, '');


export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { restaurants } = useData();       // ⬅️ RÉCUPÉRATION DES DONNÉES CENTRALISÉES
  const { colors, spacing, radius, typography } = useTheme();

  // ----- Filtre catégorie -----
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

  // ----- Simulation de sections basées sur les restaurants -----

  const popular = useMemo(() => {
    return restaurants.slice(0, 5).map((r) => ({
      id: r.id,
      nom: r.nom,
      image: r.image,
      rating: r.note ?? 4.5,
      category: r.cuisine,
      timeMin: 20,
      price: r.prixMoyen || "$$",
    }));
  }, [restaurants]);


  const nearYou = useMemo(() => {
    return restaurants.slice(5, 10).map((r) => ({
      id: r.id,
      nom: r.nom,
      image: r.image,
      rating: r.note ?? 4.3,
      category: r.cuisine,
      distanceKm: 1 + Math.random() * 3,
      price: r.prixMoyen || "$$",
    }));
  }, [restaurants]);

  // ----- Filtrage selon catégorie -----
  const matchCat = (itemCat: string, key: string) => {
    if (key === 'all') return true;
    return norm(itemCat) === norm(key);
  };

  const filteredPopular = popular.filter((r) =>
    matchCat(r.category, selectedCatKey)
  );

  const filteredNearYou = nearYou.filter((r) =>
    matchCat(r.category, selectedCatKey)
  );

  // test supabase 

  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .limit(1);

    console.log("SUPABASE TEST:", data, error);
  };

  test();
}, []);

  // Navigation
  const openRestaurant = (id: string) =>
    router.push(`/restaurants/${id}`);

  const SectionHeader = ({ title, action }: { title: string; action?: () => void }) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        marginTop: spacing.lg
      }}
    >
      <Text style={{ fontFamily: typography.bold, fontSize: 20, color: colors.text }}>
        {title}
      </Text>

      {action && (
        <TouchableOpacity onPress={action}>
          <Text style={{ fontFamily: typography.semiBold, color: colors.primary }}>
            Tout voir
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const Chip = ({
    label,
    active,
    onPress
  }: {
    label: string;
    active?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.card : 'rgba(255,255,255,0.6)',
        marginRight: 8
      }}
    >
      <Text
        style={{
          fontFamily: active ? typography.semiBold : typography.regular,
          color: active ? colors.text : colors.textLight,
          fontSize: 13
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const RestaurantCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => openRestaurant(item.id)}
      style={{
        width: 260,
        marginRight: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: colors.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border
      }}
    >
      <View style={{ height: 150, backgroundColor: '#eee' }}>
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* rating */}
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
            alignItems: 'center'
          }}
        >
          <Icon name="star" size={14} color="#FFD452" />
          <Text
            style={{
              color: '#fff',
              marginLeft: 6,
              fontFamily: typography.semiBold,
              fontSize: 12
            }}
          >
            {Number(item.rating).toFixed(1)}
          </Text>
        </View>

        {/* catégorie */}
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(255,255,255,0.85)',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: radius.pill
          }}
        >
          <Text
            style={{
              fontFamily: typography.semiBold,
              fontSize: 12,
              color: colors.textLight
            }}
          >
            {item.category}
          </Text>
        </View>
      </View>

      <View style={{ padding: spacing.md }}>
        <Text
          style={{
            fontFamily: typography.semiBold,
            fontSize: 16,
            color: colors.text
          }}
          numberOfLines={1}
        >
          {item.nom}
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          {!!item.timeMin && (
            <View style={{ flexDirection: 'row', marginRight: 12 }}>
              <Icon name="time" size={16} color={colors.textLight} />
              <Text style={{ marginLeft: 4, fontSize: 13, color: colors.textLight }}>
                {item.timeMin} min
              </Text>
            </View>
          )}

          {!!item.distanceKm && (
            <View style={{ flexDirection: 'row', marginRight: 12 }}>
              <Icon name="navigate" size={16} color={colors.textLight} />
              <Text style={{ marginLeft: 4, fontSize: 13, color: colors.textLight }}>
                {item.distanceKm.toFixed(1)} km
              </Text>
            </View>
          )}

          {!!item.price && (
            <View style={{ flexDirection: 'row' }}>
              <Icon name="cash" size={16} color={colors.textLight} />
              <Text style={{ marginLeft: 4, fontSize: 13, color: colors.textLight }}>
                {item.price}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // ----- RENDER -----
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl * 3 }}
      >
        {/* HEADER */}
        <LinearGradient
          colors={['#FFFFFF', 'rgba(255,255,255,0.85)']}
          style={{
            paddingTop: 54,
            paddingBottom: spacing.lg,
            paddingHorizontal: spacing.lg
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textLight,
                  fontSize: 13,
                  fontFamily: typography.regular
                }}
              >
                Bonjour,
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 22,
                  fontFamily: typography.bold
                }}
              >
                {user?.nom || 'Utilisateur'} 👋
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={{
                padding: 10,
                borderRadius: radius.pill,
                backgroundColor: 'rgba(0,0,0,0.04)'
              }}
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
              height: 48
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
                color: colors.text
              }}
            />

            <TouchableOpacity
              onPress={() => router.push('/restaurants')}
              style={{ paddingHorizontal: 8, paddingVertical: 6 }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: typography.semiBold
                }}
              >
                Filtrer
              </Text>
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
        <SectionHeader title="Populaires aujourd’hui" action={() => router.push('/restaurants')} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredPopular}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}
          renderItem={({ item }) => <RestaurantCard item={item} />}
        />

        {/* RECOMMANDÉ */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <LinearGradient
            colors={['#FFF1E6', '#FFFFFF']}
            style={{
              borderRadius: radius.lg,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border
            }}
          >
            <Text
              style={{
                fontFamily: typography.semiBold,
                fontSize: 16,
                color: colors.text,
                marginBottom: 6
              }}
            >
              Recommandé pour vous
            </Text>
            <Text
              style={{
                color: colors.textLight,
                fontFamily: typography.regular,
                marginBottom: spacing.md
              }}
            >
              Cuisine congolaise authentique dans une ambiance chaleureuse.
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/restaurants')}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: radius.pill,
                backgroundColor: colors.primary
              }}
            >
              <Text style={{ color: '#fff', fontFamily: typography.semiBold }}>
                Découvrir
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* PRÈS DE VOUS */}
        <SectionHeader title="Près de vous" action={() => router.push('/restaurants')} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredNearYou}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}
          renderItem={({ item }) => <RestaurantCard item={item} />}
        />
      </ScrollView>

      <BottomNavigation currentRoute="home" />
    </View>
  );
}