import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import SimpleBottomSheet from '../../components/BottomSheet';
import ProfileEditSheet from '../../components/ProfileEditSheet';
import AppButton from '../../components/ui/AppButton';
import BrandMark from '../../components/ui/BrandMark';
import FadeInImage from '../../components/ui/FadeInImage';
import PressableScale from '../../components/ui/PressableScale';
import StateView from '../../components/ui/StateView';
import { areMediaUploadsEnabled, uploadMedia } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';
import { colors, layout, radius, spacing, typography } from '../../styles/theme';

const enterHeader = FadeInUp.duration(210).reduceMotion(ReduceMotion.System);
const enterCard = FadeInUp.duration(230).delay(45).reduceMotion(ReduceMotion.System);
const enterDetails = FadeInUp.duration(230).delay(90).reduceMotion(ReduceMotion.System);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isAuthReady, isDevelopmentSession, logout, updateUser, getAuthToken } = useAuth();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async (type: 'profile' | 'cover') => {
    if (!isDevelopmentSession && !areMediaUploadsEnabled) {
      Alert.alert('Envoi d’images indisponible', 'Le stockage distant est désactivé pendant cette phase gratuite.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: type === 'profile' ? [1, 1] : [16, 9], quality: 0.8 });
    if (result.canceled || !result.assets[0] || !user) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      if (isDevelopmentSession) {
        await updateUser(type === 'profile' ? { photoProfil: asset.uri } : { photoCouverture: asset.uri });
        return;
      }
      const contentType = asset.mimeType === 'image/png' || asset.mimeType === 'image/webp' ? asset.mimeType : 'image/jpeg';
      const file = await (await fetch(asset.uri)).blob();
      const scope = type === 'profile' ? 'profile-avatar' : 'profile-cover';
      const uploaded = await uploadMedia(`/v1/uploads/${scope}/${user.id}`, file, contentType, getAuthToken);
      await updateUser(type === 'profile' ? { photoProfil: uploaded.url } : { photoCouverture: uploaded.url });
    } catch (error) {
      Alert.alert('Image non enregistrée', error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthReady) {
    return <SafeAreaView style={styles.safe}><StateView title="Chargement du profil…" loading /></SafeAreaView>;
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <Animated.View entering={enterHeader} style={styles.guestPage}>
          <BrandMark />
          <View style={styles.guestVisual}>
            <Ionicons name="person-outline" size={52} color={colors.primary} />
          </View>
          <Text style={styles.guestTitle}>Votre espace MenuCity</Text>
          <Text style={styles.guestText}>Connectez-vous pour inviter vos proches, personnaliser votre profil et accéder aux fonctions administrateur.</Text>
          <View style={styles.guestActions}>
            <AppButton label="Se connecter" onPress={() => router.push('/auth/login')} />
            <AppButton label="Créer un compte" variant="ghost" onPress={() => router.push('/auth/register')} />
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const details = [
    { icon: 'mail-outline' as const, label: 'E-mail', value: user.email || 'Non renseigné' },
    { icon: 'call-outline' as const, label: 'Téléphone', value: user.telephone || 'Non renseigné' },
    { icon: 'location-outline' as const, label: 'Ville', value: 'Lubumbashi, RDC' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Animated.View entering={enterHeader} style={styles.headerRow}>
            <View><Text style={styles.eyebrow}>Votre espace</Text><Text style={styles.pageTitle}>Profil</Text></View>
            {isDevelopmentSession ? <View style={styles.devBadge}><Text style={styles.devText}>DEV ADMIN</Text></View> : null}
          </Animated.View>

          <Animated.View entering={enterCard} style={styles.profileCard}>
            <PressableScale accessibilityRole="button" accessibilityLabel="Modifier la photo de couverture" accessibilityState={{ disabled: uploading, busy: uploading }} disabled={uploading} haptic="selection" scaleTo={0.99} onPress={() => void pickImage('cover')} style={styles.cover}>
              {user.photoCouverture ? <FadeInImage accessible={false} source={{ uri: user.photoCouverture }} style={styles.coverImage} /> : <View style={styles.coverPlaceholder}><Ionicons name="restaurant-outline" size={38} color={colors.primary} /></View>}
              <View style={styles.camera}><Ionicons name="camera" size={17} color={colors.white} /></View>
            </PressableScale>
            <View style={styles.identity}>
              <PressableScale accessibilityRole="button" accessibilityLabel="Modifier la photo de profil" accessibilityState={{ disabled: uploading, busy: uploading }} disabled={uploading} haptic="selection" scaleTo={0.94} onPress={() => void pickImage('profile')} style={styles.avatar}>
                {user.photoProfil ? <FadeInImage accessible={false} source={{ uri: user.photoProfil }} style={styles.avatarImage} /> : <Text style={styles.initial}>{user.nom.charAt(0).toUpperCase()}</Text>}
                <View style={styles.avatarCamera}><Ionicons name="camera" size={14} color={colors.white} /></View>
              </PressableScale>
              <Text style={styles.name}>{user.nom}</Text>
              <Text style={styles.bio}>{user.bio || 'Ajoutez une courte bio pour personnaliser votre espace.'}</Text>
              {uploading ? <Text style={styles.uploading}>Enregistrement de l’image…</Text> : null}
            </View>
          </Animated.View>

          <Animated.View entering={enterDetails} style={styles.statsCard}>
            <View style={styles.stat}><Text style={styles.statValue}>{user.restaurants}</Text><Text style={styles.statLabel}>Restaurants</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statValue}>{user.points}</Text><Text style={styles.statLabel}>Points</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statValue}>{user.avis}</Text><Text style={styles.statLabel}>Avis</Text></View>
          </Animated.View>

          <Animated.View entering={enterDetails} style={styles.infoCard}>
            {details.map((detail, index) => (
              <View key={detail.label} style={[styles.infoRow, index < details.length - 1 && styles.infoDivider]}>
                <View style={styles.infoIcon}><Ionicons name={detail.icon} size={19} color={colors.primary} /></View>
                <View style={styles.infoCopy}><Text style={styles.infoLabel}>{detail.label}</Text><Text style={styles.infoValue}>{detail.value}</Text></View>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={enterDetails} style={styles.actions}>
            {user.role === 'admin' ? <AppButton label="Ouvrir l’administration" disabled={uploading} icon={<Ionicons name="shield-checkmark-outline" size={19} color={colors.white} />} onPress={() => router.push('/admin')} /> : null}
            <AppButton label="Modifier le profil" variant="secondary" disabled={uploading} icon={<Ionicons name="create-outline" size={19} color={colors.primaryDark} />} onPress={() => setEditing(true)} />
            <AppButton label="Se déconnecter" variant="ghost" disabled={uploading} icon={<Ionicons name="log-out-outline" size={19} color={colors.text} />} onPress={() => void logout()} />
          </Animated.View>
        </View>
      </ScrollView>

      <SimpleBottomSheet isVisible={editing} onClose={() => setEditing(false)}>
        <ProfileEditSheet user={user} onUpdate={updateUser} onClose={() => setEditing(false)} />
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 108 },
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: layout.screenPadding, gap: spacing.lg },
  guestPage: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  guestVisual: { width: 112, height: 112, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, backgroundColor: colors.primarySoft },
  guestTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 26, marginTop: spacing.lg, textAlign: 'center' },
  guestText: { color: colors.textSecondary, fontFamily: typography.regular, lineHeight: 22, marginTop: spacing.sm, textAlign: 'center' },
  guestActions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.xs },
  eyebrow: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  pageTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 29 },
  devBadge: { paddingHorizontal: spacing.sm, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  devText: { color: colors.primaryDark, fontFamily: typography.bold, fontSize: 10, letterSpacing: 0.7 },
  profileCard: { overflow: 'hidden', borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  cover: { height: 172, backgroundColor: colors.backgroundAlt },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  camera: { position: 'absolute', right: spacing.sm, top: spacing.sm, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.scrim },
  identity: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  avatar: { width: 104, height: 104, marginTop: -52, borderRadius: 52, borderWidth: 4, borderColor: colors.surface, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  avatarImage: { width: '100%', height: '100%', borderRadius: 52 },
  initial: { color: colors.white, fontFamily: typography.bold, fontSize: 38 },
  avatarCamera: { position: 'absolute', right: 0, bottom: 4, width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDark, borderWidth: 2, borderColor: colors.surface },
  name: { color: colors.text, fontFamily: typography.bold, fontSize: 23, marginTop: spacing.sm },
  bio: { color: colors.textSecondary, fontFamily: typography.regular, lineHeight: 20, marginTop: spacing.xs, textAlign: 'center' },
  uploading: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 12, marginTop: spacing.xs },
  statsCard: { minHeight: 82, flexDirection: 'row', alignItems: 'stretch', paddingVertical: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  stat: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: colors.primary, fontFamily: typography.bold, fontSize: 21 },
  statLabel: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 11, marginTop: 3 },
  statDivider: { width: 1, marginVertical: spacing.xs, backgroundColor: colors.border },
  infoCard: { paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  infoRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  infoCopy: { flex: 1 },
  infoLabel: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 12 },
  infoValue: { color: colors.text, fontFamily: typography.semiBold, fontSize: 14, marginTop: 2 },
  actions: { gap: spacing.sm },
});
