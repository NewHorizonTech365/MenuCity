import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, ReduceMotion, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { triggerHaptic } from '../lib/haptics';
import { colors, radius, shadows, spacing, typography } from '../styles/theme';
import type { Restaurant } from '../types/Restaurant';
import AppButton from './ui/AppButton';
import AppHeader from './ui/AppHeader';
import FormField from './ui/FormField';
import PressableScale from './ui/PressableScale';

export type InvitePayload = {
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
  onSendInvitation: (inviteData: InvitePayload) => Promise<void>;
}

type ShareOption = {
  key: 'whatsapp' | 'email' | 'copy' | 'other';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const shareOptions: ShareOption[] = [
  { key: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25A85A' },
  { key: 'email', label: 'E-mail', icon: 'mail-outline', color: '#3777D6' },
  { key: 'copy', label: 'Copier', icon: 'copy-outline', color: '#7C5DB5' },
  { key: 'other', label: 'Autre', icon: 'share-social-outline', color: colors.primary },
];

export default function InviteFriendSheet({ restaurant, onClose, onSendInvitation }: InviteFriendSheetProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNom, setInviteNom] = useState('');
  const [dateProposee, setDateProposee] = useState('');
  const [heureProposee, setHeureProposee] = useState('');
  const [message, setMessage] = useState(`Salut ! J’aimerais t’inviter à découvrir ${restaurant.nom}, un restaurant ${restaurant.cuisine} à Lubumbashi.`);
  const [isPersisting, setIsPersisting] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const fieldErrors = useMemo(() => ({
    name: attempted && !inviteNom.trim() ? 'Le nom de votre ami est requis.' : undefined,
    email: attempted && !inviteEmail.trim() ? 'L’adresse e-mail est requise.' : undefined,
    date: attempted && !dateProposee.trim() ? 'Proposez une date.' : undefined,
    time: attempted && !heureProposee.trim() ? 'Proposez une heure.' : undefined,
  }), [attempted, dateProposee, heureProposee, inviteEmail, inviteNom]);

  const inviteText = useMemo(() => [
    message.trim(),
    '',
    `📍 ${restaurant.nom}`,
    `🍽️ ${restaurant.cuisine}`,
    `🗺️ ${restaurant.adresse}`,
    `📅 ${dateProposee.trim()} à ${heureProposee.trim()}`,
  ].join('\n'), [dateProposee, heureProposee, message, restaurant.adresse, restaurant.cuisine, restaurant.nom]);

  const handlePrepare = async () => {
    setAttempted(true);
    if (!inviteNom.trim() || !inviteEmail.trim() || !dateProposee.trim() || !heureProposee.trim()) return;

    setIsPersisting(true);
    try {
      await onSendInvitation({
        restaurantId: restaurant.id,
        inviteEmail: inviteEmail.trim(),
        inviteNom: inviteNom.trim(),
        message: message.trim(),
        dateProposee: dateProposee.trim(),
        heureProposee: heureProposee.trim(),
      });
      triggerHaptic('success');
      setShowShare(true);
    } catch (error) {
      Alert.alert('Invitation non enregistrée', error instanceof Error ? error.message : 'Vérifiez votre connexion puis réessayez.');
    } finally {
      setIsPersisting(false);
    }
  };

  const shareInvite = async (option: ShareOption['key']) => {
    try {
      if (option === 'copy') {
        await Clipboard.setStringAsync(inviteText);
        triggerHaptic('success');
        Alert.alert('Message copié', 'L’invitation est prête à être collée dans votre messagerie.');
        return;
      }

      if (option === 'whatsapp') {
        const url = `whatsapp://send?text=${encodeURIComponent(inviteText)}`;
        if (await Linking.canOpenURL(url)) {
          await Linking.openURL(url);
          return;
        }
      }

      if (option === 'email') {
        const subject = encodeURIComponent(`Invitation chez ${restaurant.nom}`);
        const emailUrl = `mailto:${inviteEmail.trim()}?subject=${subject}&body=${encodeURIComponent(inviteText)}`;
        if (await Linking.canOpenURL(emailUrl)) {
          await Linking.openURL(emailUrl);
          return;
        }
      }

      await Share.share({ message: inviteText, title: `Invitation chez ${restaurant.nom}` });
    } catch {
      Alert.alert('Partage indisponible', 'Impossible d’ouvrir cette option pour le moment.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.headerWrap}>
          <AppHeader title="Inviter un ami" subtitle="Préparez l’invitation, puis choisissez comment l’envoyer." onBack={onClose} />
        </View>

        <ScrollView
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Animated.View entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)} style={styles.restaurantCard}>
            <View style={styles.restaurantIcon}><Ionicons name="restaurant-outline" size={22} color={colors.primary} /></View>
            <View style={styles.restaurantCopy}>
              <Text style={styles.restaurantName}>{restaurant.nom}</Text>
              <Text style={styles.restaurantMeta} numberOfLines={2}>{restaurant.cuisine} · {restaurant.adresse}</Text>
            </View>
          </Animated.View>

          <View style={styles.sectionIntro}>
            <Text style={styles.sectionTitle}>Votre proposition</Text>
            <Text style={styles.sectionText}>L’invitation sera d’abord enregistrée dans MenuCity avant l’ouverture du partage.</Text>
          </View>

          <View style={styles.form}>
            <FormField label="Nom de votre ami" value={inviteNom} onChangeText={setInviteNom} placeholder="Ex. Jean Mukendi" autoCapitalize="words" error={fieldErrors.name} editable={!isPersisting} />
            <FormField label="Adresse e-mail" value={inviteEmail} onChangeText={setInviteEmail} placeholder="jean@exemple.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={fieldErrors.email} editable={!isPersisting} />
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleField}><FormField label="Date proposée" value={dateProposee} onChangeText={setDateProposee} placeholder="25/09/2026" keyboardType="numbers-and-punctuation" error={fieldErrors.date} editable={!isPersisting} /></View>
              <View style={styles.scheduleField}><FormField label="Heure" value={heureProposee} onChangeText={setHeureProposee} placeholder="19h30" error={fieldErrors.time} editable={!isPersisting} /></View>
            </View>
            <FormField label="Message personnalisé" value={message} onChangeText={setMessage} multiline textAlignVertical="top" style={styles.messageInput} editable={!isPersisting} />
          </View>

          <View style={styles.securityNote}>
            <Ionicons name="cloud-done-outline" size={19} color={colors.success} />
            <Text style={styles.securityText}>Aucun envoi n’est simulé : vous choisissez vous-même l’application de partage.</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <AppButton label="Enregistrer et partager" icon={<Ionicons name="send-outline" size={19} color={colors.white} />} loading={isPersisting} onPress={() => void handlePrepare()} />
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showShare} transparent statusBarTranslucent animationType="fade" onRequestClose={() => setShowShare(false)}>
        <View style={styles.modalRoot}>
          <PressableScale accessibilityRole="button" accessibilityLabel="Fermer les options de partage" onPress={() => setShowShare(false)} style={styles.backdrop}><View /></PressableScale>
          <Animated.View entering={SlideInDown.duration(240).reduceMotion(ReduceMotion.System)} style={styles.shareSheet}>
            <View style={styles.handle} />
            <View style={styles.successIcon}><Ionicons name="checkmark" size={24} color={colors.white} /></View>
            <Text style={styles.shareTitle}>Invitation enregistrée</Text>
            <Text style={styles.shareText}>Choisissez maintenant où envoyer votre message à {inviteNom.trim()}.</Text>

            <View style={styles.shareGrid}>
              {shareOptions.map((option) => (
                <PressableScale key={option.key} accessibilityRole="button" accessibilityLabel={`Partager via ${option.label}`} haptic="selection" onPress={() => void shareInvite(option.key)} style={styles.shareOption}>
                  <View style={[styles.shareIcon, { backgroundColor: option.color }]}><Ionicons name={option.icon} size={23} color={colors.white} /></View>
                  <Text style={styles.shareLabel}>{option.label}</Text>
                </PressableScale>
              ))}
            </View>

            <AppButton label="Terminer" variant="ghost" onPress={onClose} />
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  headerWrap: { paddingHorizontal: spacing.md },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.lg },
  restaurantCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.soft },
  restaurantIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  restaurantCopy: { minWidth: 0, flex: 1 },
  restaurantName: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  restaurantMeta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 17, marginTop: 3 },
  sectionIntro: { gap: 3 },
  sectionTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 18 },
  sectionText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 18 },
  form: { gap: spacing.md },
  scheduleRow: { flexDirection: 'row', gap: spacing.sm },
  scheduleField: { minWidth: 0, flex: 1 },
  messageInput: { minHeight: 112, paddingTop: spacing.md },
  securityNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, padding: spacing.sm, borderRadius: radius.md, backgroundColor: '#EAF7F0' },
  securityText: { flex: 1, color: colors.success, fontFamily: typography.regular, fontSize: 12, lineHeight: 17 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  shareSheet: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, backgroundColor: colors.surface, ...shadows.raised },
  handle: { width: 42, height: 5, alignSelf: 'center', borderRadius: radius.pill, backgroundColor: colors.borderStrong },
  successIcon: { width: 48, height: 48, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md, borderRadius: 24, backgroundColor: colors.success },
  shareTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 19, textAlign: 'center', marginTop: spacing.sm },
  shareText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 4 },
  shareGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs, marginVertical: spacing.lg },
  shareOption: { flex: 1, alignItems: 'center', gap: spacing.xs },
  shareIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  shareLabel: { color: colors.textSecondary, fontFamily: typography.semiBold, fontSize: 11 },
});
