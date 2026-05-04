import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../styles/theme";
import { useAuth } from "../../providers/AuthProvider";

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState((params.email ?? "").toString());
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const { colors, spacing, radius, typography } = useTheme();
  const router = useRouter();

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Erreur", "Veuillez renseigner votre email.");
      return;
    }
    setLoading(true);
    const result = await forgotPassword(email.trim());
    setLoading(false);
    if (!result.ok) {
      Alert.alert("Erreur", result.message || "Impossible d'envoyer l'email.");
      return;
    }
    Alert.alert("Succes", result.message || "Email de reinitialisation envoye.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: "center" }}>
        <Text style={{ fontFamily: typography.bold, color: colors.text, fontSize: 30 }}>
          Mot de passe oublie
        </Text>
        <Text
          style={{
            marginTop: spacing.sm,
            color: colors.textLight,
            fontFamily: typography.regular,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          Entrez votre email pour recevoir le lien de reinitialisation.
        </Text>

        <TextInput
          placeholder="Adresse e-mail"
          placeholderTextColor={colors.textLight}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            marginTop: spacing.xl,
            height: 54,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            paddingHorizontal: spacing.lg,
            color: colors.text,
            fontFamily: typography.regular,
          }}
        />

        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          style={{
            marginTop: spacing.lg,
            height: 54,
            borderRadius: radius.pill,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontFamily: typography.semiBold, fontSize: 16 }}>
              Envoyer le lien
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/auth/login")} style={{ marginTop: spacing.lg }}>
          <Text style={{ color: colors.primary, fontFamily: typography.semiBold, textAlign: "center" }}>
            Retour a la connexion
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

