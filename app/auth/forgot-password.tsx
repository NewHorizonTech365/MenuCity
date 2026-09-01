import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import AuthShell from '../../components/auth/AuthShell';
import AppButton from '../../components/ui/AppButton';
import FormField from '../../components/ui/FormField';
import { useAuth } from '../../providers/AuthProvider';
import { colors, spacing, typography } from '../../styles/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(String(params.email || ''));
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const sendCode = async () => {
    if (!email.trim()) return Alert.alert('E-mail requis', 'Renseignez l’adresse associée à votre compte.');
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (!result.ok) return Alert.alert('Envoi impossible', result.message || 'Vérifiez votre adresse e-mail.');
      router.push({ pathname: '/auth/reset-password', params: { email: email.trim().toLowerCase() } });
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Mot de passe oublié" subtitle="Nous vous enverrons un code pour définir un nouveau mot de passe en toute sécurité.">
      <View style={styles.form}>
        <FormField label="Adresse e-mail" value={email} onChangeText={setEmail} placeholder="vous@exemple.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" editable={!loading} />
        <AppButton label="Envoyer le code" loading={loading} onPress={() => void sendCode()} />
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/auth/login')}><Text style={styles.link}>Retour à la connexion</Text></Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({ form: { gap: spacing.lg }, link: { color: colors.primary, fontFamily: typography.semiBold, textAlign: 'center' } });
