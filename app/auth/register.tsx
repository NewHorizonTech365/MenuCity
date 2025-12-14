// app/auth/register.tsx
import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import Icon from "../../components/Icon";
import { useTheme } from "../../styles/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { colors, spacing, radius, typography } = useTheme();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nom.trim() || !email.trim() || !telephone.trim() || !password || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const ok = await register(nom.trim(), email.trim(), password, telephone.trim());
      setLoading(false);

      if (!ok) {
        Alert.alert("Erreur", "Inscription impossible");
        return;
      }

      router.replace("/home");
    } catch (e) {
      setLoading(false);
      console.error("Register error", e);
      Alert.alert("Erreur", "Une erreur est survenue");
    }
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
          Créer un compte 🍽
        </Text>
        <Text
          style={{
            fontFamily: typography.regular,
            fontSize: 16,
            color: colors.textLight,
            marginBottom: spacing.xl,
          }}
        >
          Rejoignez notre communauté de gourmets.
        </Text>

        {/* INPUTS */}
        <TextInput
          placeholder="Nom complet"
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
          value={nom}
          onChangeText={setNom}
          autoCapitalize="words"
        />

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
          placeholder="Numéro de téléphone"
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
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
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
            marginBottom: spacing.md,
          }}
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Confirmer le mot de passe"
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
            marginBottom: spacing.md,
          }}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* BUTTON REGISTER */}
        <TouchableOpacity
          onPress={handleRegister}
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
              S'inscrire
            </Text>
          )}
        </TouchableOpacity>

        {/* LINK LOGIN */}
        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          style={{ marginTop: spacing.lg, alignSelf: "center", marginBottom: spacing.xl }}
        >
          <Text
            style={{
              fontFamily: typography.regular,
              color: colors.primary,
              fontSize: 15,
            }}
          >
            Déjà un compte ? Se connecter
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}