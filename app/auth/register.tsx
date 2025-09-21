
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import Icon from '../../components/Icon';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nom || !email || !telephone || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const success = await register(nom, email, password, telephone);
      if (success) {
        router.replace('/home');
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
      }
    } catch (error) {
      console.log('Erreur d\'inscription:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        <TouchableOpacity
          style={{ marginTop: 20, marginBottom: 40 }}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={[commonStyles.title, { textAlign: 'left', marginBottom: 10 }]}>
            Créer un compte
          </Text>
          <Text style={[commonStyles.text, { textAlign: 'left', marginBottom: 40 }]}>
            Rejoignez notre communauté de gourmets
          </Text>

          <TextInput
            style={commonStyles.input}
            placeholder="Nom complet"
            value={nom}
            onChangeText={setNom}
            autoCapitalize="words"
          />

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
            placeholder="Numéro de téléphone"
            value={telephone}
            onChangeText={setTelephone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={commonStyles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={commonStyles.input}
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[buttonStyles.primary, { marginTop: 20 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.backgroundAlt} />
            ) : (
              <Text style={buttonStyles.text}>S&apos;inscrire</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 20, alignItems: 'center', marginBottom: 40 }}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={[commonStyles.text, { color: colors.primary }]}>
              Déjà un compte ? Connectez-vous
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
