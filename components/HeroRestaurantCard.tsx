// components/HeroRestaurantCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useTheme } from "../styles/theme";
import Icon from "./Icon";
import { Restaurant } from "../types/Restaurant";

interface Props {
  restaurant: Restaurant;
  onPress: () => void;
  onInvite: () => void;
}

export default function HeroRestaurantCard({ restaurant, onPress, onInvite }: Props) {
  const { colors, radius, spacing, typography } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.93}
      style={{
        borderRadius: 30,
        overflow: "hidden",
        backgroundColor: colors.card,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      {/* IMAGE */}
      <Image
        source={{ uri: restaurant.image }}
        style={{ width: "100%", height: 350 }}
        resizeMode="cover"
      />

      {/* content */}
      <View style={{ padding: spacing.lg }}>
        <Text
          style={{
            fontFamily: typography.bold,
            fontSize: 28,
            color: colors.text,
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {restaurant.nom}
        </Text>

        <Text
          style={{
            fontFamily: typography.regular,
            fontSize: 16,
            color: colors.textLight,
            marginBottom: 12,
          }}
          numberOfLines={2}
        >
          {restaurant.description}
        </Text>

        <View
          style={{
            flexDirection: "row",
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <Icon name="star" size={20} color="#FFD452" />
          <Text
            style={{
              marginLeft: 6,
              fontFamily: typography.semiBold,
              fontSize: 16,
              color: colors.text,
            }}
          >
            {restaurant.note.toFixed(1)} / 5
          </Text>
        </View>

        <TouchableOpacity
          onPress={onInvite}
          activeOpacity={0.9}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="person-add" size={20} color="#fff" />
          <Text
            style={{
              color: "#fff",
              marginLeft: 8,
              fontFamily: typography.semiBold,
              fontSize: 16,
            }}
          >
            Inviter un ami
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}