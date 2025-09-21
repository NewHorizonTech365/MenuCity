
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import Icon from '../../components/Icon';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/home');
      } else {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      console.log('Erreur de connexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <TouchableOpacity
          style={{ marginTop: 20, marginBottom: 40 }}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={[commonStyles.title, { textAlign: 'left', marginBottom: 10 }]}>
            Bienvenue !
          </Text>
          <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 40 }]}>
            Connectez-vous pour continuer
          </Text>

          <TextInput
            style={commonStyles.input}
            placeholder="Adresse e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={commonStyles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[buttonStyles.primary, { marginTop: 20 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.backgroundAlt} />
            ) : (
              <Text style={buttonStyles.text}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 20, alignItems: 'center' }}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={[commonStyles.text, { color: colors.primary }]}>
              Pas encore de compte ? Inscrivez-vous
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
