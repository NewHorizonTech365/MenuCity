import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { triggerHaptic } from '../lib/haptics';
import { colors, spacing, typography } from '../styles/theme';
import type { User } from '../types/User';
import AppButton from './ui/AppButton';
import FormField from './ui/FormField';

interface ProfileEditSheetProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => Promise<void>;
  onClose: () => void;
}

export default function ProfileEditSheet({ user, onUpdate, onClose }: ProfileEditSheetProps) {
  const [nom, setNom] = useState(user.nom);
  const [telephone, setTelephone] = useState(user.telephone);
  const [bio, setBio] = useState(user.bio || '');
  const [saving, setSaving] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const nameError = attempted && !nom.trim() ? 'Le nom est requis.' : undefined;
  const phoneError = attempted && !telephone.trim() ? 'Le téléphone est requis.' : undefined;

  const handleSave = async () => {
    setAttempted(true);
    if (!nom.trim() || !telephone.trim()) return;

    setSaving(true);
    try {
      await onUpdate({ nom: nom.trim(), telephone: telephone.trim(), bio: bio.trim() });
      triggerHaptic('success');
      onClose();
    } catch (error) {
      Alert.alert('Profil non enregistré', error instanceof Error ? error.message : 'La mise à jour a échoué.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}><Ionicons name="person-outline" size={22} color={colors.primary} /></View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Modifier le profil</Text>
            <Text style={styles.subtitle}>Gardez vos informations utiles et faciles à reconnaître.</Text>
          </View>
        </View>

        <View style={styles.form}>
          <FormField label="Nom complet" value={nom} onChangeText={setNom} autoCapitalize="words" autoComplete="name" error={nameError} editable={!saving} />
          <FormField label="Adresse e-mail" value={user.email} editable={false} hint="L’e-mail est géré par votre compte Clerk." />
          <FormField label="Téléphone" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" autoComplete="tel" error={phoneError} editable={!saving} />
          <FormField label="Bio" value={bio} onChangeText={setBio} placeholder="Quelques mots sur vos goûts culinaires…" multiline textAlignVertical="top" style={styles.bioInput} editable={!saving} />
        </View>

        <View style={styles.actions}>
          <AppButton label="Annuler" variant="ghost" onPress={onClose} disabled={saving} style={styles.action} />
          <AppButton label="Enregistrer" onPress={() => void handleSave()} loading={saving} style={styles.action} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  headerCopy: { minWidth: 0, flex: 1 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 20 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 17, marginTop: 2 },
  form: { gap: spacing.md },
  bioInput: { minHeight: 104, paddingTop: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
