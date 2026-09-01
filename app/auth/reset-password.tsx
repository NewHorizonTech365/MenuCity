import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import AuthShell from '../../components/auth/AuthShell';
import AppButton from '../../components/ui/AppButton';
import FormField from '../../components/ui/FormField';
import { useAuth } from '../../providers/AuthProvider';
import { spacing } from '../../styles/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const submit = async () => {
    if (code.length < 6) return Alert.alert('Code incomplet', 'Saisissez le code reçu par e-mail.');
    if (password !== confirmation) return Alert.alert('Mot de passe', 'Les mots de passe ne correspondent pas.');
    setLoading(true);
    try {
      const result = await resetPassword(code, password);
      if (!result.ok) return Alert.alert('Réinitialisation impossible', result.message || 'Vérifiez le code et votre nouveau mot de passe.');
      Alert.alert('Mot de passe modifié', 'Votre session est maintenant active.', [{ text: 'Continuer', onPress: () => router.replace('/home') }]);
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Nouveau mot de passe" subtitle={`Utilisez le code envoyé à ${String(email || 'votre adresse e-mail')}.`}>
      <View style={styles.form}>
        <FormField label="Code reçu" value={code} onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" keyboardType="number-pad" textContentType="oneTimeCode" maxLength={6} editable={!loading} />
        <FormField label="Nouveau mot de passe" value={password} onChangeText={setPassword} placeholder="8 caractères minimum" secureTextEntry autoComplete="new-password" editable={!loading} />
        <FormField label="Confirmer le mot de passe" value={confirmation} onChangeText={setConfirmation} placeholder="Répétez le mot de passe" secureTextEntry autoComplete="new-password" editable={!loading} error={confirmation && password !== confirmation ? 'Les mots de passe ne correspondent pas.' : undefined} />
        <AppButton label="Enregistrer le mot de passe" loading={loading} onPress={() => void submit()} />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({ form: { gap: spacing.md } });
