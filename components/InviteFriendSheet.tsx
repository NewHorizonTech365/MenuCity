// components/InviteFriendSheet.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
  Dimensions,
  Animated,
  Share as RNShare,
  StyleSheet,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Restaurant } from "../types/Restaurant";
import { useTheme } from "../styles/theme";
import Icon from "./Icon";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type InvitePayload = {
  restaurantId: string;
  inviteEmail: string;
  inviteNom: string;
  message: string;
  dateProposee: string;
  heureProposee: string;
};

interface InviteFriendSheetProps {
  restaurant: Restaurant;
  onClose: () => void;
  onSendInvitation: (inviteData: InvitePayload) => void;
}

export default function InviteFriendSheet({
  restaurant,
  onClose,
  onSendInvitation,
}: InviteFriendSheetProps) {
  const { colors, spacing, radius, typography } = useTheme();

  // ------- Form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteNom, setInviteNom] = useState("");
  const [dateProposee, setDateProposee] = useState("");
  const [heureProposee, setHeureProposee] = useState("");
  const [message, setMessage] = useState(
    `Salut ! J'aimerais t'inviter à dîner chez ${restaurant.nom}. C'est un excellent restaurant de ${
      restaurant.cuisine
    } à Lubumbashi. Qu'en dis-tu ?`
  );

  // ------- Enter animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  // ------- Share bottom sheet
  const [showShare, setShowShare] = useState(false);
  const sheetY = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // start hidden below
  const sheetOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 90 }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const openShareSheet = () => {
    setShowShare(true);
    // small delay to ensure mount before anim
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(sheetY, { toValue: SCREEN_HEIGHT * 0.2, duration: 300, useNativeDriver: true }),
        Animated.timing(sheetOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const closeShareSheet = () => {
    Animated.parallel([
      Animated.timing(sheetY, { toValue: SCREEN_HEIGHT, duration: 260, useNativeDriver: true }),
      Animated.timing(sheetOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setShowShare(false);
    });
  };

  // ------- Helpers
  const generateInviteMessage = () => {
    const appDownloadLink =
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/votre-app"
        : "https://play.google.com/store/apps/details?id=votre.app";
    return `${message}\n\n📍 ${restaurant.nom}\n📍 ${restaurant.adresse}\n🍽 ${restaurant.cuisine}\n📅 ${dateProposee} à ${heureProposee}\n\n💫 Télécharge notre app pour réserver: ${appDownloadLink}`;
  };

  // ------- Share actions
  const shareViaWhatsApp = async () => {
    const text = encodeURIComponent(generateInviteMessage());
    const url = `whatsapp://send?text=${text}`;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else Alert.alert("WhatsApp non disponible", "WhatsApp n'est pas installé sur cet appareil");
    } catch {
      Alert.alert("Erreur", "Impossible d'ouvrir WhatsApp");
    }
  };

  const shareViaFacebook = async () => {
    // on passe par le sharer web (plus fiable cross-platform)
    const text = encodeURIComponent(generateInviteMessage());
    const webUrl =`https://www.facebook.com/sharer/sharer.php?u=${text}`;
    try {
      await Linking.openURL(webUrl);
    } catch {
      Alert.alert("Erreur", "Impossible d'ouvrir Facebook");
    }
  };

  const shareViaInstagram = async () => {
    // Instagram n'autorise pas le texte direct → on copie
    await Clipboard.setStringAsync(generateInviteMessage());
    Alert.alert(
      "Message copié",
      "Le message a été copié. Ouvrez Instagram et collez-le dans votre message.",
      [
        { text: "OK" },
        {
          text: "Ouvrir Instagram",
          onPress: async () => {
            const ok = await Linking.canOpenURL("instagram://");
            if (ok) await Linking.openURL("instagram://");
            else Alert.alert("Instagram non disponible", "Instagram n'est pas installé");
          },
        },
      ]
    );
  };

  const shareViaEmail = async () => {
    const subject = encodeURIComponent(`Invitation à dîner chez ${restaurant.nom}`);
    const body = encodeURIComponent(generateInviteMessage());
    const url = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else Alert.alert("Erreur", "Aucune app email disponible");
    } catch {
      Alert.alert("Erreur", "Impossible d'ouvrir l'email");
    }
  };

  const shareViaGeneric = async () => {
    try {
      await RNShare.share({ message: generateInviteMessage() });
    } catch {
      await Clipboard.setStringAsync(generateInviteMessage());
      Alert.alert("Copié", "Le message a été copié dans le presse-papier");
    }
  };

  const copyInviteLink = async () => {
    const appDownloadLink =
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/votre-app"
        : "https://play.google.com/store/apps/details?id=votre.app";
    await Clipboard.setStringAsync(appDownloadLink);
    Alert.alert("Lien copié", "Le lien de téléchargement a été copié");
  };

  // ------- Submit
  const handleSend = () => {
    if (!inviteNom.trim()) return Alert.alert("Erreur", "Veuillez saisir le nom de votre ami");
    if (!dateProposee.trim()) return Alert.alert("Erreur", "Veuillez proposer une date");
    if (!heureProposee.trim()) return Alert.alert("Erreur", "Veuillez proposer une heure");

    // petit feedback
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.02, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    const payload: InvitePayload = {
      restaurantId: restaurant.id,
      inviteEmail: inviteEmail.trim(),
      inviteNom: inviteNom.trim(),
      message: message.trim(),
      dateProposee: dateProposee.trim(),
      heureProposee: heureProposee.trim(),
    };

    onSendInvitation(payload);
    openShareSheet();
  };

  // ------- Share options model
  const shareOptions = [
    { name: "WhatsApp", icon: "logo-whatsapp", color: "#25D366", action: shareViaWhatsApp },
    { name: "Facebook", icon: "logo-facebook", color: "#1877F2", action: shareViaFacebook },
    { name: "Instagram", icon: "logo-instagram", color: "#E4405F", action: shareViaInstagram },
    { name: "Email", icon: "mail", color: colors.primary, action: shareViaEmail },
    { name: "Autre", icon: "share", color: colors.accent, action: shareViaGeneric },
  ] as const;

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
          <Icon name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontFamily: typography.semiBold, fontSize: 18, color: colors.text }}>
          Inviter un ami
        </Text>
        <TouchableOpacity onPress={openShareSheet} style={{ padding: 6 }}>
          <Icon name="share" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Restaurant block */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Icon name="restaurant" size={22} color={colors.primary} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontFamily: typography.semiBold, fontSize: 16, color: colors.text }}>
              {restaurant.nom}
            </Text>
            <Text style={{ fontFamily: typography.regular, fontSize: 13, color: colors.textLight }}>
              {restaurant.cuisine} • {restaurant.adresse}
            </Text>
          </View>
        </View>

        {/* Form */}
        <View>
          <Text style={{ fontFamily: typography.semiBold, color: colors.text, marginBottom: 8 }}>
            Nom de votre ami
          </Text>
          <TextInput
            value={inviteNom}
            onChangeText={setInviteNom}
            placeholder="Ex: Jean Mukendi"
            placeholderTextColor={colors.textLight}
            style={{
              height: 48,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.primary,
              backgroundColor: colors.background,
              paddingHorizontal: spacing.md,
              fontFamily: typography.regular,
              color: colors.text,
            }}
          />

          <View style={{ height: spacing.md }} />

          <Text style={{ fontFamily: typography.semiBold, color: colors.text, marginBottom: 8 }}>
            Email de votre ami (optionnel)
          </Text>
          <TextInput
            value={inviteEmail}
            onChangeText={setInviteEmail}
            placeholder="jean@example.com"
            placeholderTextColor={colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              height: 48,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              paddingHorizontal: spacing.md,
              fontFamily: typography.regular,
              color: colors.text,
            }}
          />

          <View style={{ height: spacing.md }} />

          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={{ fontFamily: typography.semiBold, color: colors.text, marginBottom: 8 }}>
                Date proposée
              </Text>
              <TextInput
                value={dateProposee}
                onChangeText={setDateProposee}
                placeholder="Ex: 25/12/2025"
                placeholderTextColor={colors.textLight}
                style={{
                  height: 48,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  paddingHorizontal: spacing.md,
                  fontFamily: typography.regular,
                  color: colors.text,
                }}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={{ fontFamily: typography.semiBold, color: colors.text, marginBottom: 8 }}>
                Heure proposée
              </Text>
              <TextInput
                value={heureProposee}
                onChangeText={setHeureProposee}
                placeholder="Ex: 19h30"
                placeholderTextColor={colors.textLight}
                style={{
                  height: 48,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  paddingHorizontal: spacing.md,
                  fontFamily: typography.regular,
                  color: colors.text,
                }}
              />
            </View>
          </View>

          <View style={{ height: spacing.md }} />

          <Text style={{ fontFamily: typography.semiBold, color: colors.text, marginBottom: 8 }}>
            Message personnalisé
          </Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Écrivez votre message d'invitation..."
            placeholderTextColor={colors.textLight}
            multiline
            textAlignVertical="top"
            style={{
              minHeight: 110,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              paddingHorizontal: spacing.md,
              paddingTop: spacing.md,
              fontFamily: typography.regular,
              color: colors.text,
              lineHeight: 20,
            }}
          />
        </View>

        <View style={{ height: spacing.lg }} />
      </ScrollView>

      {/* Footer CTA */}
      <View
        style={{
          padding: spacing.lg,
          borderTopWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <TouchableOpacity
          onPress={handleSend}
          activeOpacity={0.9}
          style={{
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Icon name="send" size={20} color="#fff" />
          <Text
            style={{
              marginLeft: 10,
              color: "#fff",
              fontFamily: typography.semiBold,
              fontSize: 16,
            }}
          >
            Préparer l'invitation
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------- SHARE BOTTOM SHEET ---------- */}
      {showShare && (
        <View
          pointerEvents="box-none"
          style={{
            ...StyleSheet.absoluteFillObject,
            justifyContent: "flex-end",
          }}
        >
          {/* Backdrop */}
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "#000",
              opacity: sheetOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.35],
              }),
            }}
          >
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeShareSheet} />
          </Animated.View>

          {/* Sheet */}
          <Animated.View
            style={{
              transform: [{ translateY: sheetY }],
              backgroundColor: colors.card,
              borderTopLeftRadius: radius.xl ?? 24,
              borderTopRightRadius: radius.xl ?? 24,
              paddingBottom: spacing.xl,
              borderTopWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 4 }}>
              <View
                style={{
                  width: 44,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: colors.border,
                }}
              />
            </View>

            <Text
              style={{
                textAlign: "center",
                fontFamily: typography.semiBold,
                color: colors.text,
                fontSize: 16,
                marginTop: spacing.sm,
                marginBottom: spacing.lg,
              }}
            >
              Partager l'invitation
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-evenly",
                rowGap: 14,
                paddingHorizontal: spacing.lg,
              }}
            >
              {shareOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.name}
                  onPress={opt.action}
                  activeOpacity={0.85}
                  style={{
                    width: 86,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 62,
                      height: 62,
                      borderRadius: 31,
                      backgroundColor: opt.color,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={opt.icon} size={26} color="#fff" />
                  </View>
                  <Text
                    style={{
                      marginTop: 8,
                      textAlign: "center",
                      fontFamily: typography.semiBold,
                      fontSize: 12,
                      color: colors.text,
                    }}
                  >
                    {opt.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={copyInviteLink}
              activeOpacity={0.85}
              style={{
                marginTop: spacing.lg,
                marginHorizontal: spacing.lg,
                paddingVertical: 12,
                borderRadius: radius.pill,
                borderWidth: 1.5,
                borderColor: colors.primary,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: colors.card,
              }}
            >
              <Icon name="link" size={18} color={colors.primary} />
              <Text
                style={{
                  marginLeft: 8,
                  color: colors.primary,
                  fontFamily: typography.semiBold,
                }}
              >
                Copier le lien de téléchargement
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={closeShareSheet}
              style={{
                marginTop: spacing.md,
                marginHorizontal: spacing.lg,
                paddingVertical: 12,
                borderRadius: radius.pill,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
              activeOpacity={0.85}
            >
              <Text style={{ fontFamily: typography.semiBold, color: colors.text }}>Fermer</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
}

