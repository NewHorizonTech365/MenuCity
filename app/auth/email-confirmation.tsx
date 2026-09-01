import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import AuthShell from '../../components/auth/AuthShell';
import AppButton from '../../components/ui/AppButton';
import FormField from '../../components/ui/FormField';
import { useAuth } from '../../providers/AuthProvider';
import { colors, spacing, typography } from '../../styles/theme';

export default function EmailConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = String(params.email || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyEmailCode, resendConfirmationEmail } = useAuth();

  const verify = async () => {
    if (code.length < 6) return Alert.alert('Code incomplet', 'Saisissez les six chiffres reçus par e-mail.');
    setLoading(true);
    try {
      const result = await verifyEmailCode(code);
      if (!result.ok) return Alert.alert('Code refusé', result.message || 'Le code est incorrect ou a expiré.');
      router.replace('/home');
    } finally { setLoading(false); }
  };

  const resend = async () => {
    setLoading(true);
    try {
      const result = await resendConfirmationEmail(email);
      Alert.alert(result.ok ? 'Nouveau code envoyé' : 'Envoi impossible', result.message || 'Réessayez dans quelques instants.');
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Vérifiez votre e-mail" subtitle={`Saisissez le code à six chiffres envoyé à ${email || 'votre adresse e-mail'}.`}>
      <View style={styles.form}>
        <FormField label="Code de vérification" value={code} onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" maxLength={6} style={styles.code} editable={!loading} />
        <AppButton label="Confirmer mon compte" loading={loading} onPress={() => void verify()} />
      </View>
      <Pressable accessibilityRole="button" disabled={loading} onPress={() => void resend()}><Text style={styles.link}>Renvoyer le code</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/auth/login')}><Text style={styles.secondary}>Retour à la connexion</Text></Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  code: { fontFamily: typography.bold, fontSize: 22, textAlign: 'center', letterSpacing: 8 },
  link: { color: colors.primary, fontFamily: typography.semiBold, textAlign: 'center' },
  secondary: { color: colors.textSecondary, fontFamily: typography.semiBold, textAlign: 'center' },
});
