// app/index.tsx
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "../components/Icon";
import { useTheme } from "../styles/theme";
import { useAuth } from "../providers/AuthProvider";

export default function WelcomeScreen() {
  const { isAuthReady, isAuthenticated, login } = useAuth();
  const router = useRouter();
  const { colors, spacing, radius, typography } = useTheme();

  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthReady, isAuthenticated, router]);

  if (!isAuthReady || isAuthenticated) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.xl,
          paddingTop: 80,
          paddingBottom: 80,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo neutre */}
        <View
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: spacing.xl,
          }}
        >
          <Icon name="restaurant" size={64} color={colors.primary} />
        </View>

        {/* TITLE */}
        <Text
          style={{
            fontFamily: typography.bold,
            fontSize: 36,
            color: colors.text,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          Saveurs de Lubumbashi
        </Text>

        <Text
          style={{
            fontFamily: typography.regular,
            fontSize: 18,
            color: colors.textLight,
            textAlign: "center",
            lineHeight: 26,
            marginBottom: spacing.xl,
          }}
        >
          Explorez les meilleurs restaurants de Lubumbashi et partagez les
          moments avec vos proches.
        </Text>

        {/* FEATURES */}
        <View
          style={{
            width: "100%",
            marginBottom: spacing.xl,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {[
              { icon: "search", label: "Explorer" },
              { icon: "people", label: "Inviter" },
              { icon: "heart", label: "Savourez" },
            ].map((item) => (
              <View
                key={item.label}
                style={{
                  flex: 1,
                  alignItems: "center",
                  backgroundColor: colors.card,
                  paddingVertical: 18,
                  marginHorizontal: 6,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Icon
                  name={item.icon}
                  size={28}
                  color={colors.primary}
                  style={{ marginBottom: 8 }}
                />
                <Text
                  style={{
                    fontFamily: typography.semiBold,
                    fontSize: 14,
                    color: colors.text,
                  }}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ACTIONS */}
        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          style={{
            width: "100%",
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
            paddingVertical: 18,
            alignItems: "center",
            marginBottom: spacing.md,
          }}
        >
          <Text
            style={{
              fontFamily: typography.semiBold,
              fontSize: 18,
              color: "#fff",
            }}
          >
            Se connecter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/auth/register")}
          style={{
            width: "100%",
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: radius.pill,
            paddingVertical: 18,
            alignItems: "center",
            marginBottom: spacing.md,
          }}
        >
          <Text
            style={{
              fontFamily: typography.semiBold,
              fontSize: 18,
              color: colors.primary,
            }}
          >
            S'inscrire
          </Text>
        </TouchableOpacity>

        {/* DEV LOGIN */}
        <TouchableOpacity onPress={async () => {
          const result = await login("test@example.com", "password123");
          if (result.ok) router.push("/home");
        }}>
          <Text
            style={{
              fontFamily: typography.regular,
              fontSize: 16,
              color: colors.textLight,
              textDecorationLine: "underline",
            }}
          >
            Connexion test (développement)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
