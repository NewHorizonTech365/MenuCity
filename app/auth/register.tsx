import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import AuthShell from '../../components/auth/AuthShell';
import AppButton from '../../components/ui/AppButton';
import FormField from '../../components/ui/FormField';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { getStrengthColor, getStrengthLabel, validatePassword } from '../../lib/passwordValidator';
import { useAuth } from '../../providers/AuthProvider';
import { colors, radius, spacing, typography } from '../../styles/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { isGoogleAvailable, signUpWithGoogle } = useGoogleAuth();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const strength = useMemo(() => password ? validatePassword(password) : null, [password]);

  const handleRegister = async () => {
    if (!nom.trim() || !email.trim() || !telephone.trim() || !password || !confirmation) return Alert.alert('Champs requis', 'Complétez toutes les informations demandées.');
    if (password !== confirmation) return Alert.alert('Mot de passe', 'Les deux mots de passe ne correspondent pas.');
    if (strength && !strength.isValid) return Alert.alert('Mot de passe trop faible', strength.errors[0]);

    setLoading(true);
    try {
      const result = await register(nom.trim(), email.trim(), password, telephone.trim());
      if (!result.ok) return Alert.alert('Inscription impossible', result.message || 'Vérifiez les informations saisies.');
      if (result.requiresEmailConfirmation) {
        router.replace({ pathname: '/auth/email-confirmation', params: { email: email.trim().toLowerCase() } });
        return;
      }
      router.replace('/home');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const result = await signUpWithGoogle();
      if (!result.ok) return Alert.alert('Inscription Google impossible', result.error || 'Réessayez dans quelques instants.');
      router.replace('/home');
    } finally {
      setGoogleLoading(false);
    }
  };

  const unavailable = loading || googleLoading;
  return (
    <AuthShell title="Créer votre compte" subtitle="Rejoignez MenuCity pour inviter vos proches et personnaliser votre expérience.">
      <View style={styles.form}>
        <FormField label="Nom complet" value={nom} onChangeText={setNom} placeholder="Votre nom" autoCapitalize="words" autoComplete="name" editable={!unavailable} />
        <FormField label="Adresse e-mail" value={email} onChangeText={setEmail} placeholder="vous@exemple.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" editable={!unavailable} />
        <FormField label="Téléphone" value={telephone} onChangeText={setTelephone} placeholder="+243…" keyboardType="phone-pad" autoComplete="tel" editable={!unavailable} hint="Utilisé uniquement dans votre profil MenuCity." />
        <FormField label="Mot de passe" value={password} onChangeText={setPassword} placeholder="8 caractères minimum" secureTextEntry autoComplete="new-password" editable={!unavailable} error={strength && !strength.isValid ? strength.errors[0] : undefined} />
        {strength ? (
          <View style={styles.strength}>
            <View style={styles.strengthTrack}><View style={[styles.strengthFill, { width: `${strength.score}%`, backgroundColor: getStrengthColor(strength.score) }]} /></View>
            <Text style={styles.strengthLabel}>Sécurité : {getStrengthLabel(strength.score)}</Text>
          </View>
        ) : null}
        <FormField label="Confirmer le mot de passe" value={confirmation} onChangeText={setConfirmation} placeholder="Répétez le mot de passe" secureTextEntry autoComplete="new-password" editable={!unavailable} error={confirmation && password !== confirmation ? 'Les mots de passe ne correspondent pas.' : undefined} />
        <AppButton label="Créer mon compte" loading={loading} disabled={googleLoading} onPress={() => void handleRegister()} />
      </View>

      <View style={styles.divider}><View style={styles.line} /><Text style={styles.dividerText}>ou</Text><View style={styles.line} /></View>
      <AppButton label={isGoogleAvailable ? 'S’inscrire avec Google' : 'Google indisponible dans ce client'} variant="ghost" loading={googleLoading} disabled={loading || !isGoogleAvailable} icon={<Ionicons name="logo-google" size={19} color="#4285F4" />} onPress={() => void handleGoogleSignup()} />
      <View style={styles.footer}><Text style={styles.footerText}>Déjà inscrit ? </Text><Pressable accessibilityRole="button" onPress={() => router.replace('/auth/login')}><Text style={styles.link}>Se connecter</Text></Pressable></View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  strength: { marginTop: -spacing.xs, gap: 5 },
  strengthTrack: { height: 5, overflow: 'hidden', borderRadius: radius.pill, backgroundColor: colors.border },
  strengthFill: { height: '100%', borderRadius: radius.pill },
  strengthLabel: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 11 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: spacing.lg },
  footerText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 14 },
  link: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 14 },
});
