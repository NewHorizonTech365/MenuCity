// ProfileEditSheet.tsx (NOUVEL STYLE)
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
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
  const [email, setEmail] = useState(user.email);
  const [telephone, setTelephone] = useState(user.telephone);
  const [bio, setBio] = useState(user.bio || "");

  const handleSave = () => {
    if (!nom || !email || !telephone) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    onUpdate({ nom, email, telephone, bio });
    onClose();
    Alert.alert("Succès", "Profil mis à jour avec succès");
  };

  return (
    <View style={{ padding: spacing.lg }}>
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
          borderWidth: 2,
          borderColor: colors.primary,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          backgroundColor: colors.backgroundAlt,
          color: colors.text,
          fontFamily: typography.regular,
        }}
        placeholder="Adresse email"
        placeholderTextColor={colors.textLight}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
        placeholder="Téléphone"
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
        placeholder="Votre bio (ex: Passionné de gastronomie congolaise)"
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
    </View>
  );
}