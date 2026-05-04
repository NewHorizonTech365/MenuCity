import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  View,
  Text,
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

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginFailures } = useAuth();
  const { colors, spacing, radius, typography } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.ok) {
        if (result.code === "email_not_confirmed") {
          router.push({
            pathname: "/auth/email-confirmation",
            params: { email: email.trim().toLowerCase() },
          });
          return;
        }
        Alert.alert("Erreur", result.message || "Identifiants incorrects");
        return;
      }
      // On laisse le guard admin décider la route ensuite.
      router.replace("/home");
    } catch (e) {
      console.error("handleLogin error", e);
      Alert.alert("Erreur", "Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
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
          Bienvenue
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
        </View>

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

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/auth/forgot-password",
              params: { email: email.trim().toLowerCase() },
            })
          }
          style={{ marginTop: spacing.md, alignSelf: "center" }}
        >
          <Text
            style={{
              fontFamily: typography.regular,
              color: colors.primary,
              fontSize: 14,
              textDecorationLine: "underline",
            }}
          >
            Mot de passe oublie ?
          </Text>
        </TouchableOpacity>

        {loginFailures > 1 ? (
          <Text
            style={{
              marginTop: spacing.sm,
              alignSelf: "center",
              color: colors.textLight,
              fontFamily: typography.regular,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            Plusieurs echecs detectes ({loginFailures}). Verifiez vos identifiants.
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Bientot disponible",
              "Connexion Google (phase 2) sera activee apres configuration OAuth."
            )
          }
          style={{
            marginTop: spacing.lg,
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
