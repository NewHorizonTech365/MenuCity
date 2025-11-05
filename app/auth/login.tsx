// app/auth/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import Icon from "../../components/Icon";
import { useTheme } from "../../styles/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors, spacing, radius, typography } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);

    if (!ok) {
      Alert.alert("Erreur", "Identifiants incorrects");
      return;
    }

    router.replace("/home");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: spacing.xxl,
        }}
      >
        {/* BACK */}
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* LOGO */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            marginTop: spacing.xl,
            marginBottom: spacing.xl,
          }}
        >
          <Icon name="restaurant" size={55} color={colors.primary} />
        </View>

        <Text
          style={{
            fontFamily: typography.bold,
            fontSize: 32,
            color: colors.text,
            marginBottom: 10,
          }}
        >
          Bienvenue 👋
        </Text>
        <Text
          style={{
            fontFamily: typography.regular,
            fontSize: 16,
            color: colors.textLight,
            marginBottom: spacing.xl,
          }}
        >
          Connectez-vous pour continuer.
        </Text>

        {/* INPUTS */}
        <View style={{ marginBottom: spacing.md }}>
          <TextInput
            placeholder="Adresse e-mail"
            placeholderTextColor={colors.textLight}
            style={{
              height: 54,
              backgroundColor: colors.card,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
              fontFamily: typography.regular,
              marginBottom: spacing.md,
            }}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Mot de passe"
            placeholderTextColor={colors.textLight}
            secureTextEntry
            style={{
              height: 54,
              backgroundColor: colors.card,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
              fontFamily: typography.regular,
            }}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* BUTTON LOGIN */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: colors.primary,
            height: 54,
            borderRadius: radius.pill,
            justifyContent: "center",
            alignItems: "center",
            marginTop: spacing.lg,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: "#fff",
                fontFamily: typography.semiBold,
                fontSize: 18,
              }}
            >
              Se connecter
            </Text>
          )}
        </TouchableOpacity>

        {/* LINK REGISTER */}
        <TouchableOpacity
          onPress={() => router.push("/auth/register")}
          style={{ marginTop: spacing.lg, alignSelf: "center" }}
        >
          <Text
            style={{
              fontFamily: typography.regular,
              color: colors.primary,
              fontSize: 15,
            }}
          >
            Pas de compte ? S'inscrire
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}