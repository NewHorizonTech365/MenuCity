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
  // now we get both login and updateUser from the auth context
  const { login, updateUser } = useAuth();
  const { colors, spacing, radius, typography } = useTheme();

  // Champs normaux
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Mode PIN admin
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);

  /** PIN Admin temporaire */
  const ADMIN_PIN = "2424"; // tu changeras ça plus tard

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    // Si l'utilisateur tape un email admin => activer le PIN
    if (email.toLowerCase() === "admin@foodlubumbashi.com") {
      setShowPin(true);
      return;
    }

    setLoading(true);
    try {
      const ok = await login(email, password);
      if (!ok) {
        Alert.alert("Erreur", "Identifiants incorrects");
        return;
      }
      router.replace("/home");
    } catch (e) {
      console.error("handleLogin error", e);
      Alert.alert("Erreur", "Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handlePinValidation = async () => {
    if (pin !== ADMIN_PIN) {
      Alert.alert("Erreur", "PIN incorrect");
      return;
    }

    setLoading(true);
    try {
      // Essaie d'abord de login via le hook existant
      const ok = await login("admin@foodlubumbashi.com", ADMIN_PIN);

      if (ok) {
        // Assure-toi que l'utilisateur a bien le rôle admin (certaines implémentations du hook ne le mettent pas)
        try {
          updateUser({ role: "admin" } as any);
        } catch (e) {
          console.warn("updateUser failed (after login) :", e);
        }

        Alert.alert("Succès", "Connexion administrateur");
        router.replace("/admin");
        return;
      }

      // --- fallback (robuste pour dev)
      // Si login() n'a pas renvoyé true (implémentations différentes possible),
      // on force la mise à jour de l'utilisateur en mode admin pour permettre l'accès.
      // Garde cet fallback en dev ; en production tu devras le remplacer par une vérif serveur.
      console.warn("login returned false for admin — applying fallback updateUser");
      try {
        updateUser({
          role: "admin",
          id: "admin",
          nom: "Administrateur",
          email: "admin@foodlubumbashi.com",
        } as any);
        Alert.alert(
          "Connexion admin (fallback)",
          "L'accès admin a été activé via fallback. Vérifie ton implementation de login."
        );
        router.replace("/admin");
      } catch (e) {
        console.error("Fallback updateUser failed:", e);
        Alert.alert("Erreur", "Impossible de connecter l'administrateur (fallback échoué)");
      }
    } catch (err) {
      console.error("handlePinValidation error:", err);
      Alert.alert("Erreur", "Une erreur est survenue");
    } finally {
      setLoading(false);
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

        {/* TITRE */}
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

        {/* MODE PIN ADMIN */}
        {showPin ? (
          <>
            <TextInput
              placeholder="PIN Administrateur"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              secureTextEntry
              value={pin}
              onChangeText={setPin}
              style={{
                height: 54,
                backgroundColor: colors.card,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.lg,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                fontFamily: typography.regular,
                marginBottom: spacing.lg,
              }}
            />

            <TouchableOpacity
              onPress={handlePinValidation}
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
                  Entrer dans l'espace admin
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPin(false)}
              style={{ marginTop: spacing.md, alignSelf: "center" }}
            >
              <Text style={{ color: colors.primary, fontFamily: typography.regular }}>
                Retour
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* INPUT EMAIL / PASSWORD */}
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

            {/* LOGIN BUTTON */}
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

            {/* REGISTER LINK */}
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}