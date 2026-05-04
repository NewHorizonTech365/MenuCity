import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
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
  const scrollRef = useRef<ScrollView>(null);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const onShow = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const onHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

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
      const result = await register(nom.trim(), email.trim(), password, telephone.trim());
      setLoading(false);

      if (!result.ok) {
        Alert.alert("Erreur", result.message || "Inscription impossible");
        return;
      }

      if (result.requiresEmailConfirmation) {
        router.replace({
          pathname: "/auth/email-confirmation",
          params: { email: email.trim().toLowerCase() },
        });
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
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing.lg,
          paddingTop: spacing.xxl,
          paddingBottom: spacing.xl + keyboardHeight,
        }}
      >
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

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
            Creer un compte
          </Text>
          <Text
            style={{
              fontFamily: typography.regular,
              fontSize: 16,
              color: colors.textLight,
              marginBottom: spacing.xl,
            }}
          >
            Rejoignez notre communaute de gourmets.
          </Text>

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
            placeholder="Numero de telephone"
            placeholderTextColor={colors.textLight}
            onFocus={scrollToBottom}
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

          <View
            style={{
              height: 54,
              backgroundColor: colors.card,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <TextInput
              placeholder="Mot de passe"
              placeholderTextColor={colors.textLight}
              secureTextEntry={!showPassword}
              onFocus={scrollToBottom}
              style={{
                flex: 1,
                color: colors.text,
                fontFamily: typography.regular,
              }}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={colors.textLight}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              height: 54,
              backgroundColor: colors.card,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <TextInput
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={colors.textLight}
              secureTextEntry={!showConfirmPassword}
              onFocus={scrollToBottom}
              style={{
                flex: 1,
                color: colors.text,
                fontFamily: typography.regular,
              }}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword((s) => !s)}>
              <Icon
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color={colors.textLight}
              />
            </TouchableOpacity>
          </View>

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
              Deja un compte ? Se connecter
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Bientot disponible",
                "Inscription Google (phase 2) sera activee apres configuration OAuth."
              )
            }
            style={{
              marginBottom: spacing.md,
              height: 52,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: typography.semiBold,
                color: colors.text,
                fontSize: 15,
              }}
            >
              Continuer avec Google (phase 2)
            </Text>
          </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
