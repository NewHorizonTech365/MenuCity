// app/restaurants.tsx — Tinder swipe + Liste complète dans le même écran (toggle) + fix footer overlap
import React, { useMemo, useState, useRef } from "react";
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

import { restaurantsLubumbashi } from "../data/restaurants";
import { Restaurant } from "../types/Restaurant";
import InviteFriendSheet from "../components/InviteFriendSheet";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const NAV_HEIGHT = 100; // hauteur visuelle approx de ta BottomNavigation (icon + badge + arrondi)

export default function RestaurantsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, typography } = useTheme();

  // état UI
  const [search, setSearch] = useState("");
  const [selectedCatKey, setSelectedCatKey] = useState<string>("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // toggle : swipe <-> liste
  const [showFullList, setShowFullList] = useState(false);

  // catégories (aligné Home)
  const categories = useMemo(
    () => [
      { key: "all", label: "Tous" },
      { key: "africain", label: "Africain" },
      { key: "fast-food", label: "Fast-food" },
      { key: "poisson", label: "Poisson" },
      { key: "grillades", label: "Grillades" },
      { key: "desserts", label: "Desserts" },
    ],
    []
  );

  const norm = (s: string) => s.toLowerCase().replace(/\s|-/g, "");
  const matchCat = (itemCat: string, key: string) => (key === "all" ? true : norm(itemCat) === norm(key));

  // data filtrée
  const data = useMemo(
    () =>
      restaurantsLubumbashi.filter(
        (r) =>
          (matchCat(r.cuisine, selectedCatKey) || selectedCatKey === "all") &&
          (r.nom.toLowerCase().includes(search.toLowerCase()) ||
            r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
            r.specialites.some((sp) => sp.toLowerCase().includes(search.toLowerCase())))
      ),
    [search, selectedCatKey]
  );

  // Swiper
  const swiperRef = useRef<Swiper<Restaurant>>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const { height: SCREEN_HEIGHT} = Dimensions.get('window');

  const openDetails = (id: string) =>
    router.push({ pathname: "/restaurants/[id]", params: { id } });

  const openInvite = (r: Restaurant) => setSelectedRestaurant(r);
  const closeInvite = () => setSelectedRestaurant(null);

  // ---- Card Tinder (hero)
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
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          // IMPORTANT: limite la hauteur de la carte pour qu'elle reste dans la fenêtre visible
          maxHeight: SCREEN_HEIGHT * 0.76,
        }}
      >
        {/* Image */}
        <View style={{ height: 300, backgroundColor: "#eee" }}>
          <Image source={{ uri: r.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          {/* note */}
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
            <Text style={{ color: "#fff", marginLeft: 6, fontFamily: typography.semiBold, fontSize: 12 }}>
              {r.note.toFixed(1)}
            </Text>
          </View>
          {/* tag cuisine */}
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
            <Text style={{ fontFamily: typography.semiBold, fontSize: 12, color: colors.text }}>{r.cuisine}</Text>
          </View>
        </View>

        {/* contenu */}
        <View style={{ padding: spacing.lg }}>
          <Text
            numberOfLines={1}
            style={{ fontFamily: typography.bold, fontSize: 22, color: colors.text, marginBottom: 6 }}
          >
            {r.nom}
          </Text>

          <Text
            numberOfLines={2}
            style={{ fontFamily: typography.regular, fontSize: 14, color: colors.textLight, marginBottom: 12 }}
          >
            {r.description}
          </Text>

          {/* adresse + prix */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
            <Icon name="location" size={16} color={colors.textLight} />
            <Text
              numberOfLines={1}
              style={{
                fontFamily: typography.regular,
                fontSize: 13,
                color: colors.textLight,
                marginLeft: 6,
                flex: 1,
                marginRight: 8,
              }}
            >
              {r.adresse}
            </Text>

            <View
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.pill,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontFamily: typography.semiBold, fontSize: 12, color: colors.text }}>
                {r.prixMoyen}
              </Text>
            </View>
          </View>

          {/* actions */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => openDetails(r.id)}
              activeOpacity={0.9}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.pill,
                paddingVertical: 12,
                alignItems: "center",
                marginRight: 10,
                backgroundColor: colors.card,
              }}
            >
              <Text style={{ fontFamily: typography.semiBold, color: colors.text }}>Voir détails</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openInvite(r)}
              activeOpacity={0.9}
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: radius.pill,
                paddingVertical: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Icon name="person-add" size={18} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 8, fontFamily: typography.semiBold }}>Inviter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ---- Card pour la liste verticale (reuse)
  const renderListItem = ({ item }: { item: Restaurant }) => (
    <View style={{ marginBottom: spacing.lg }}>{renderSwipeCard(item)}</View>
  );

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          // Padding léger global (le vrai espace bas est géré dans le Swiper via containerStyle)
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER (comme Home) */}
          <LinearGradient
            colors={["#FFFFFF", "rgba(255,255,255,0.85)"]}
            style={{ paddingTop: 48, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg }}
          >
            <Text style={{ fontFamily: typography.bold, fontSize: 26, color: colors.text }}>
              Restaurants à Lubumbashi
            </Text>
            <Text style={{ color: colors.textLight, fontSize: 14, fontFamily: typography.regular, marginTop: 6 }}>
              Découvrez les meilleurs restaurants de la ville
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
                backgroundColor: "rgba(255,255,255,0.9)",
                paddingHorizontal: spacing.md,
                height: 48,
              }}
            >
              <Icon name="search" size={18} color={colors.textLight} />
              <TextInput
                placeholder="Rechercher un restaurant, un plat..."
                placeholderTextColor={colors.textLight}
                style={{ marginLeft: 8, flex: 1, fontFamily: typography.regular, color: colors.text }}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </LinearGradient>

          {/* CATEGORIES */}
          <View style={{ paddingVertical: spacing.md }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.lg }}
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
                      backgroundColor: active ? colors.card : "rgba(255,255,255,0.6)",
                      marginRight: 8,
                    }}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={{
                        fontFamily: active ? typography.semiBold : typography.regular,
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
          </View>

          {/* TITRE + TOGGLE */}
          <View
            style={{
              paddingHorizontal: spacing.lg,
              marginTop: spacing.sm,
              marginBottom: spacing.md,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontFamily: typography.bold, fontSize: 20, color: colors.text }}>
              {showFullList ? "Tous les restaurants" : "Swipe & Découvre"}
            </Text>

            <TouchableOpacity
              onPress={() => setShowFullList((v) => !v)}
              style={{ paddingVertical: 6, paddingHorizontal: 10 }}
            >
              <Text style={{ fontFamily: typography.semiBold, color: colors.primary }}>
                {showFullList ? "Retour au swipe" : "Voir la liste complète"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* CONTENU */}
          {!showFullList ? (
            data.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Text style={{ color: colors.textLight }}>Aucun résultat</Text>
              </View>
            ) : (
              // SWIPER — la clé est ici: containerStyle + cardStyle
              <View style={{ height: SCREEN_HEIGHT * 0.76, paddingBottom: 30, }}>
                <Swiper
                  ref={swiperRef}
                  backgroundColor="transparent"
                  cards={data}
                  cardIndex={cardIndex}
                  stackSize={3}
                  stackSeparation={14}
                  stackScale={10}
                  verticalSwipe={true}
                  renderCard={(card) => renderSwipeCard(card as Restaurant)}
                  onSwiped={() => setCardIndex((prev) => prev + 1)}
                  onSwipedAll={() => setCardIndex(0)}
                  cardHorizontalMargin={0}
                  cardVerticalMargin={0}
                  // >>> empêche le recouvrement par le footer <<<
                  containerStyle={{
                    paddingBottom: insets.bottom + NAV_HEIGHT + 16,
                    // on fixe aussi une hauteur raisonnable pour le conteneur
                    height: SCREEN_HEIGHT * 0.76,
                  }}
                  cardStyle={{
                    // carte jamais plus haute que le conteneur
                    height: SCREEN_HEIGHT * 0.76,
                    alignSelf: "center",
                  }}
                  overlayLabels={{
                    left: {
                      title: "PASS",
                      style: {
                        label: {
                          borderWidth: 2,
                          borderColor: colors.border,
                          color: colors.text,
                          fontFamily: typography.bold,
                        },
                      },
                    },
                    right: {
                      title: "NEXT",
                      style: {
                        label: {
                          borderWidth: 2,
                          borderColor: colors.primary,
                          color: colors.primary,
                          fontFamily: typography.bold,
                        },
                      },
                    },
                  }}
                  animateOverlayLabelsOpacity
                  animateCardOpacity
                />
              </View>
            )
          ) : (
            // LISTE VERTICALE
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.lg }}
              ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
              renderItem={renderListItem}
            />
          )}

          {/* Spacer de sécurité sous le contenu */}
          <View style={{ height: insets.bottom + NAV_HEIGHT + 1 }} />
        </ScrollView>

        {/* MODAL INVITER */}
        <Modal visible={!!selectedRestaurant} animationType="slide" presentationStyle="pageSheet">
          {selectedRestaurant && (
            <InviteFriendSheet
              restaurant={selectedRestaurant}
              onClose={closeInvite}
              onSendInvitation={(d: any) => {
                console.log("Invitation envoyée:", d);
                closeInvite();
              }}
            />
          )}
        </Modal>
        {/* Footer en dehors du SafeAreaView */}
        <BottomNavigation currentRoute="restaurants" />
      </SafeAreaView>
    </>
  );
}