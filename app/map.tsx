// app/map.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../styles/theme";
import Icon from "../components/Icon";

export default function MapScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: "center" }}>
      
      <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
        <Icon name="map" size={90} color={colors.primary} />
      </View>

      <Text
        style={{
          fontFamily: typography.bold,
          fontSize: 26,
          color: colors.text,
          textAlign: "center",
          marginBottom: spacing.md,
        }}
      >
        Carte en préparation
      </Text>

      <Text
        style={{
          fontFamily: typography.regular,
          color: colors.textLight,
          textAlign: "center",
          lineHeight: 22,
          marginBottom: spacing.xl,
        }}
      >
        Bientôt vous pourrez voir les restaurants les plus proches autour de vous sur une carte interactive !
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/restaurants")}
        style={{
          backgroundColor: colors.primary,
          borderRadius: radius.pill,
          paddingVertical: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontFamily: typography.semiBold, fontSize: 16 }}>
          Voir les restaurants
        </Text>
      </TouchableOpacity>
    </View>
  );
}