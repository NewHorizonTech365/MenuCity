// components/RestaurantDetails.tsx
import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Icon from "./Icon";
import { Restaurant } from "../types/Restaurant";
import { useTheme } from "../styles/theme";

const { width } = Dimensions.get("window");

type MenuItem = {
  id?: string;
  nom: string;
  prix: string;
  description?: string;
  photosMenu?: string[]; // ⬅️ ici les images réelles des plats
};

interface Props {
  restaurant: Restaurant;
  onInvite: () => void;
}

export default function RestaurantDetails({ restaurant, onInvite }: Props) {
  const router = useRouter();
  const { colors, spacing, radius, typography } = useTheme();

  const dishes: MenuItem[] = (restaurant.menu as unknown as MenuItem[]) || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* BACK */}
      <View style={{ position: "absolute", top: 44, left: 16, zIndex: 50 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "rgba(0,0,0,0.45)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* HERO */}
        <Image
          source={{ uri: restaurant.image }}
          style={{
            width,
            height: 340,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        />

        {/* LOGO */}
        <View style={{ alignItems: "center", marginTop: -50 }}>
          {!!restaurant.logo && (
            <Image
              source={{ uri: restaurant.logo }}
              style={{
                width: 110,
                height: 110,
                borderRadius: 60,
                borderWidth: 4,
                borderColor: "#fff",
                backgroundColor: "#fff",
              }}
            />
          )}
        </View>

        {/* INFOS */}
        <View style={{ padding: spacing.lg }}>
          <Text style={{ fontFamily: typography.bold, fontSize: 30, color: colors.text, marginBottom: 6 }}>
            {restaurant.nom}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
            <Icon name="star" size={18} color="#FFD452" />
            <Text style={{ marginLeft: 6, fontFamily: typography.semiBold, color: colors.text }}>
              {restaurant.note.toFixed(1)}
            </Text>

            <View
              style={{
                marginLeft: 12,
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: radius.pill,
              }}
            >
              <Text style={{ fontFamily: typography.semiBold, color: colors.textLight }}>
                {restaurant.cuisine}
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: typography.regular, color: colors.textLight, lineHeight: 22, marginBottom: 24 }}>
            {restaurant.description}
          </Text>

          {/* PHOTOS RESTO */}
          {!!restaurant.photos?.length && (
            <>
              <Text style={{ fontFamily: typography.bold, color: colors.text, fontSize: 20, marginBottom: 12 }}>
                Photos du restaurant
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 32 }}>
                {restaurant.photos.map((p, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: p }}
                    style={{
                      width: width * 0.7,
                      height: 180,
                      borderRadius: radius.lg,
                      marginRight: spacing.md,
                      backgroundColor: "#eee",
                    }}
                  />
                ))}
              </ScrollView>
            </>
          )}

          {/* MENU */}
          {!!dishes.length && (
            <>
              <Text style={{ fontFamily: typography.bold, fontSize: 20, color: colors.text, marginBottom: 12 }}>
                Menu du restaurant
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 32 }}>
                {dishes.map((dish, idx) => {
                  const dishImg =
                    dish.photosMenu?.[0] ||
                    restaurant.photos?.[0] || // fallback intelligent
                    restaurant.image; // sécurité finale

                  return (
                    <View
                      key={dish.id ?? `${dish.nom}-${idx}`}
                      style={{
                        width: width * 0.55,
                        backgroundColor: colors.card,
                        borderRadius: radius.lg,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: colors.border,
                        marginRight: spacing.md,
                      }}
                    >
                      <Image
                        source={{ uri: dishImg }}
                        style={{ width: "100%", height: 120, backgroundColor: "#eee" }}
                      />
                      <View style={{ padding: spacing.md }}>
                        <Text
                          numberOfLines={1}
                          style={{ fontFamily: typography.semiBold, color: colors.text, fontSize: 15 }}
                        >
                          {dish.nom}
                        </Text>
                        <Text style={{ fontFamily: typography.bold, color: colors.primary, marginTop: 6 }}>
                          {dish.prix}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* LOCALISATION */}
          <Text style={{ fontFamily: typography.bold, fontSize: 20, color: colors.text, marginBottom: 12 }}>
            Localisation
          </Text>

          <View
            style={{
              borderRadius: radius.lg,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 16,
            }}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1502920917128-1aa500764ce7?q=80&w=1600&auto=format&fit=crop",
              }}
              style={{ width: "100%", height: 180 }}
            />
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Icon name="location" size={18} color={colors.textLight} />
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: typography.regular,
                  color: colors.textLight,
                  flex: 1,
                }}
                numberOfLines={2}
              >
                {restaurant.adresse}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {}}
              style={{
                marginLeft: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: radius.pill,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              activeOpacity={0.85}
            >
              <Text style={{ fontFamily: typography.semiBold, color: colors.primary }}>Voir l’itinéraire</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
            <Icon name="call" size={18} color={colors.textLight} />
            <Text style={{ marginLeft: 8, fontFamily: typography.regular, color: colors.textLight }}>
              {restaurant.telephone}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
            <Icon name="time" size={18} color={colors.textLight} />
            <Text style={{ marginLeft: 8, fontFamily: typography.regular, color: colors.textLight }}>
              {restaurant.horaires}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* INVITER CTA */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: spacing.lg,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={onInvite}
          style={{
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
          activeOpacity={0.9}
        >
          <Icon name="person-add" size={20} color="#fff" />
          <Text style={{ marginLeft: 10, color: "#fff", fontFamily: typography.semiBold, fontSize: 16 }}>
            Inviter un ami
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}