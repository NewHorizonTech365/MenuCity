import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { User } from "../types/User";
import { useTheme } from "../styles/theme";

interface ProfileEditSheetProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
  onClose: () => void;
}

export default function ProfileEditSheet({ user, onUpdate, onClose }: ProfileEditSheetProps) {
  const { colors, spacing, radius, typography } = useTheme();

  const [nom, setNom] = useState(user.nom);
  const [telephone, setTelephone] = useState(user.telephone);
  const [bio, setBio] = useState(user.bio || "");

  const handleSave = () => {
    if (!nom || !telephone) {
      Alert.alert("Erreur", "Veuillez remplir les champs requis");
      return;
    }

    onUpdate({ nom, telephone, bio });
    onClose();
    Alert.alert("Succes", "Profil mis a jour avec succes");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
      >
        <Text
          style={{
            fontFamily: typography.bold,
            fontSize: 20,
            color: colors.text,
            marginBottom: spacing.lg,
          }}
        >
          Modifier le profil
        </Text>

        <TextInput
          style={{
            borderWidth: 2,
            borderColor: colors.primary,
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            backgroundColor: colors.backgroundAlt,
            color: colors.text,
            fontFamily: typography.regular,
          }}
          placeholder="Nom complet"
          placeholderTextColor={colors.textLight}
          value={nom}
          onChangeText={setNom}
        />

        <TextInput
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            backgroundColor: colors.card,
            color: colors.textLight,
            fontFamily: typography.regular,
          }}
          value={user.email}
          editable={false}
          autoCapitalize="none"
        />

        <TextInput
          style={{
            borderWidth: 2,
            borderColor: colors.primary,
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            backgroundColor: colors.backgroundAlt,
            color: colors.text,
            fontFamily: typography.regular,
          }}
          placeholder="Telephone"
          placeholderTextColor={colors.textLight}
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
        />

        <TextInput
          style={{
            borderWidth: 2,
            borderColor: colors.primary,
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.xl,
            height: 100,
            backgroundColor: colors.backgroundAlt,
            color: colors.text,
            fontFamily: typography.regular,
            textAlignVertical: "top",
          }}
          placeholder="Votre bio"
          placeholderTextColor={colors.textLight}
          value={bio}
          onChangeText={setBio}
          multiline
        />

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              flex: 1,
              borderWidth: 2,
              borderColor: colors.primary,
              paddingVertical: 14,
              borderRadius: radius.pill,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.primary, fontFamily: typography.semiBold }}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              paddingVertical: 14,
              borderRadius: radius.pill,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontFamily: typography.semiBold }}>Sauvegarder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
