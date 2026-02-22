// app/restaurants.tsx — Swipe Tinder + Liste complète (toggle) + Data centralisée

import React, { useCallback, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Dimensions,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Swiper from "react-native-deck-swiper";

import { useTheme } from "../styles/theme";
import BottomNavigation from "../components/BottomNavigation";
import Icon from "../components/Icon";

import { useData } from "../providers/DataProvider";
import type { Restaurant } from "../types/Restaurant";

import InviteFriendSheet from "../components/InviteFriendSheet";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const NAV_HEIGHT = 100;


export default function RestaurantsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { restaurants } = useData(); // ⬅️ DONNÉES CENTRALISÉES
  const { colors, spacing, radius, typography } = useTheme();

  const [search, setSearch] = useState("");
  const [selectedCatKey, setSelectedCatKey] = useState<string>("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const [showFullList, setShowFullList] = useState(false);

  const categories = useMemo(
    () => [
      { key: "all", label: "Tous" },
      { key: "africain", label: "Africain" },
      { key: "fastfood", label: "Fast-food" },
      { key: "poisson", label: "Poisson" },
      { key: "grillades", label: "Grillades" },
      { key: "desserts", label: "Desserts" },
    ],
    []
  );

  const norm = useCallback((s: string) => s.toLowerCase().replace(/\s|-/g, ""), []);
  const matchCat = useCallback(
    (itemCat: string, key: string) =>
      key === "all" ? true : norm(itemCat) === norm(key),
    [norm]
  );

  // 🎯 — FILTRAGE AVEC DONNÉES DU DATAPROVIDER
  const data = useMemo(() => {
    return restaurants.filter(
      (r) =>
        (selectedCatKey === "all" || matchCat(r.cuisine, selectedCatKey)) &&
        (r.nom.toLowerCase().includes(search.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
          r.specialites.some((sp) =>
            sp.toLowerCase().includes(search.toLowerCase())
          ))
    );
  }, [matchCat, restaurants, search, selectedCatKey]);

  // ---- Swiper
  const swiperRef = useRef<Swiper<Restaurant>>(null);
  const [cardIndex, setCardIndex] = useState(0);

  const openDetails = (id: string) =>
    router.push({ pathname: "/restaurants/[id]", params: { id } });

  const openInvite = (r: Restaurant) => setSelectedRestaurant(r);
  const closeInvite = () => setSelectedRestaurant(null);
  const handleSendInvitation = () => {};

  // ---- Card swipée
  const renderSwipeCard = (r?: Restaurant) => {
    if (!r) return <View />;

    return (
      <View
        style={{
          width: SCREEN_WIDTH * 0.88,
          alignSelf: "center",
          borderRadius: 28,
          overflow: "hidden",
          backgroundColor: colors.card,
          elevation: 10,
          maxHeight: SCREEN_HEIGHT * 0.76,
        }}
      >
        {/* IMAGE */}
        <View style={{ height: 300, backgroundColor: "#eee" }}>
          <Image
            source={{ uri: r.image }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />

          {/* NOTE */}
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: "rgba(0,0,0,0.55)",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: radius.pill,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Icon name="star" size={14} color="#FFD452" />
            <Text
              style={{
                color: "#fff",
                marginLeft: 6,
                fontFamily: typography.semiBold,
                fontSize: 12,
              }}
            >
              {r.note?.toFixed(1) ?? "4.5"}
            </Text>
          </View>

          {/* CUISINE */}
          <View
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              backgroundColor: "rgba(255,255,255,0.9)",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: radius.pill,
            }}
          >
            <Text
              style={{
                fontFamily: typography.semiBold,
                fontSize: 12,
                color: colors.text,
              }}
            >
              {r.cuisine}
            </Text>
          </View>
        </View>

        {/* CONTENU */}
        <View style={{ padding: spacing.lg }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: typography.bold,
              fontSize: 22,
              color: colors.text,
              marginBottom: 6,
            }}
          >
            {r.nom}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              fontFamily: typography.regular,
              fontSize: 14,
              color: colors.textLight,
              marginBottom: 12,
            }}
          >
            {r.description}
          </Text>

          {/* adresse */}
          <View style={{ flexDirection: "row", marginBottom: 14 }}>
            <Icon name="location" size={16} color={colors.textLight} />
            <Text
              numberOfLines={1}
              style={{
                fontFamily: typography.regular,
                fontSize: 13,
                color: colors.textLight,
                marginLeft: 6,
                flex: 1,
              }}
            >
              {r.adresse}
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.pill,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.semiBold,
                  fontSize: 12,
                  color: colors.text,
                }}
              >
                {r.prixMoyen}
              </Text>
            </View>
          </View>

          {/* ACTIONS */}
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => openDetails(r.id)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.pill,
                paddingVertical: 12,
                alignItems: "center",
                marginRight: 10,
              }}
            >
              <Text
                style={{ fontFamily: typography.semiBold, color: colors.text }}
              >
                Voir détails
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openInvite(r)}
              style={{
                flex: 1,
                borderRadius: radius.pill,
                paddingVertical: 12,
                backgroundColor: colors.primary,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="person-add" size={18} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  marginLeft: 8,
                  fontFamily: typography.semiBold,
                }}
              >
                Inviter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderListItem = ({ item }: { item: Restaurant }) => (
    <View style={{ marginBottom: spacing.lg }}>{renderSwipeCard(item)}</View>
  );

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
          {/* HEADER */}
          <LinearGradient
            colors={["#FFFFFF", "rgba(255,255,255,0.85)"]}
            style={{
              paddingTop: 48,
              paddingBottom: spacing.lg,
              paddingHorizontal: spacing.lg,
            }}
          >
            <Text
              style={{
                fontFamily: typography.bold,
                fontSize: 26,
                color: colors.text,
              }}
            >
              Restaurants à Lubumbashi
            </Text>

            {/* Recherche */}
            <View
              style={{
                marginTop: spacing.lg,
                flexDirection: "row",
                alignItems: "center",
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: "#fff",
                paddingHorizontal: spacing.md,
                height: 48,
              }}
            >
              <Icon name="search" size={18} color={colors.textLight} />
              <TextInput
                placeholder="Rechercher..."
                placeholderTextColor={colors.textLight}
                style={{
                  marginLeft: 8,
                  flex: 1,
                  fontFamily: typography.regular,
                  color: colors.text,
                }}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </LinearGradient>

          {/* CATEGORIES */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
            }}
          >
            {categories.map((c) => {
              const active = selectedCatKey === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => setSelectedCatKey(c.key)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.card : "#fff",
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: active
                        ? typography.semiBold
                        : typography.regular,
                      color: active ? colors.text : colors.textLight,
                      fontSize: 13,
                    }}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* TOGGLE LIST/SWIPE */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                fontFamily: typography.bold,
                fontSize: 20,
                color: colors.text,
              }}
            >
              {showFullList ? "Tous les restaurants" : "Swipe & Découvre"}
            </Text>

            <TouchableOpacity
              onPress={() => setShowFullList((v) => !v)}
              style={{ paddingVertical: 6 }}
            >
              <Text style={{ color: colors.primary, fontFamily: typography.semiBold }}>
                {showFullList ? "Retour au swipe" : "Voir liste complète"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* CONTENU */}
          {!showFullList ? (
            data.length > 0 ? (
              <View
                style={{
                  height: SCREEN_HEIGHT * 0.76,
                  paddingBottom: insets.bottom + NAV_HEIGHT,
                }}
              >
                <Swiper
                  ref={swiperRef}
                  cards={data}
                  backgroundColor="transparent"
                  stackSize={3}
                  stackScale={10}
                  verticalSwipe={true}
                  renderCard={(card) =>
                    renderSwipeCard(card as Restaurant)
                  }
                  onSwiped={() => setCardIndex((i) => i + 1)}
                  onSwipedAll={() => setCardIndex(0)}
                  cardStyle={{
                    height: SCREEN_HEIGHT * 0.76,
                  }}
                  overlayLabels={{
                    left: {
                      title: "PASS",
                      style: { label: { color: colors.text } },
                    },
                    right: {
                      title: "NEXT",
                      style: { label: { color: colors.primary } },
                    },
                  }}
                />
              </View>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: colors.textLight }}>
                  Aucun restaurant trouvé
                </Text>
              </View>
            )
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={renderListItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.lg }}
            />
          )}

          <View style={{ height: insets.bottom + NAV_HEIGHT }} />
        </ScrollView>

        {/* MODAL INVITER */}
        <Modal visible={!!selectedRestaurant} animationType="slide">
          {selectedRestaurant && (
            <InviteFriendSheet
              restaurant={selectedRestaurant}
              onClose={closeInvite}
              onSendInvitation={handleSendInvitation}
            />
          )}
        </Modal>

        <BottomNavigation currentRoute="restaurants" />
      </SafeAreaView>
    </>
  );
}
