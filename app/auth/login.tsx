import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import AuthShell from '../../components/auth/AuthShell';
import AppButton from '../../components/ui/AppButton';
import FormField from '../../components/ui/FormField';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { useAuth } from '../../providers/AuthProvider';
import { colors, radius, spacing, typography } from '../../styles/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginFailures, startDevelopmentSession } = useAuth();
  const { isGoogleAvailable, signInWithGoogle } = useGoogleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return Alert.alert('Champs requis', 'Renseignez votre e-mail et votre mot de passe.');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.ok) return Alert.alert('Connexion impossible', result.message || 'Vérifiez vos identifiants.');
      router.replace('/home');
    } catch {
      Alert.alert('Connexion impossible', 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.ok) return Alert.alert('Connexion Google impossible', result.error || 'Réessayez dans quelques instants.');
      router.replace('/home');
    } finally {
      setGoogleLoading(false);
    }
  };

  const enterDevelopmentMode = () => {
    startDevelopmentSession();
    router.replace('/admin');
  };

  const unavailable = loading || googleLoading;
  return (
    <AuthShell title="Bon retour parmi nous" subtitle="Connectez-vous pour inviter vos proches et gérer votre espace MenuCity.">
      <View style={styles.form}>
        <FormField label="Adresse e-mail" value={email} onChangeText={setEmail} placeholder="vous@exemple.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" editable={!unavailable} />
        <FormField label="Mot de passe" value={password} onChangeText={setPassword} placeholder="Votre mot de passe" secureTextEntry autoComplete="current-password" editable={!unavailable} />
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/auth/forgot-password', params: { email: email.trim().toLowerCase() } })} style={styles.forgot}>
          <Text style={styles.link}>Mot de passe oublié ?</Text>
        </Pressable>
        {loginFailures > 1 ? <Text style={styles.warning}>Plusieurs tentatives ont échoué. Vérifiez vos identifiants avant de réessayer.</Text> : null}
        <AppButton label="Se connecter" loading={loading} disabled={googleLoading} onPress={() => void handleLogin()} />
      </View>

      <View style={styles.divider}><View style={styles.line} /><Text style={styles.dividerText}>ou</Text><View style={styles.line} /></View>
      <AppButton label={isGoogleAvailable ? 'Continuer avec Google' : 'Google indisponible dans ce client'} variant="ghost" loading={googleLoading} disabled={loading || !isGoogleAvailable} icon={<Ionicons name="logo-google" size={19} color="#4285F4" />} onPress={() => void handleGoogleLogin()} />

      {__DEV__ ? (
        <Pressable accessibilityRole="button" onPress={enterDevelopmentMode} disabled={unavailable} style={({ pressed }) => [styles.devCard, pressed && styles.pressed]}>
          <View style={styles.devIcon}><Ionicons name="construct-outline" size={20} color={colors.warning} /></View>
          <View style={styles.devCopy}><Text style={styles.devTitle}>Mode développement administrateur</Text><Text style={styles.devText}>Accès complet avec des données locales uniquement.</Text></View>
          <Ionicons name="arrow-forward" size={19} color={colors.warning} />
        </Pressable>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Pas encore de compte ? </Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/auth/register')}><Text style={styles.link}>S’inscrire</Text></Pressable>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/home')} style={styles.explore}><Text style={styles.exploreText}>Explorer sans compte</Text></Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  forgot: { alignSelf: 'flex-end', paddingVertical: 2 },
  link: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 14 },
  warning: { color: colors.warning, fontFamily: typography.regular, fontSize: 12, lineHeight: 18, padding: spacing.sm, borderRadius: radius.md, backgroundColor: '#FFF6DC' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 12 },
  devCard: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: '#E9D29E', backgroundColor: '#FFF6DC' },
  devIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCEAB9' },
  devCopy: { flex: 1 },
  devTitle: { color: colors.warning, fontFamily: typography.bold, fontSize: 13 },
  devText: { color: '#805A14', fontFamily: typography.regular, fontSize: 11, lineHeight: 16, marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 14 },
  explore: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md },
  exploreText: { color: colors.textSecondary, fontFamily: typography.semiBold, fontSize: 14 },
  pressed: { opacity: 0.72 },
});
