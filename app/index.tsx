
// Welcome / Landing screen
// Ce fichier affiche l'écran d'accueil (écran de bienvenue) avant que
// l'utilisateur ne se connecte. Il présente les fonctionnalités principales
// et propose les actions de connexion / inscription.
import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useAuth } from '../providers/AuthProvider';
import Icon from '../components/Icon';

export default function WelcomeScreen() {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();

  const handleTestLogin = async () => {
    const success = await login('test@example.com', 'password123');
    if (success) {
      router.push('/home');
    }
  };

  // Si l'utilisateur est déjà connecté, on le redirige vers l'écran home
  // automatiquement. Ceci évite d'afficher l'écran de bienvenue.
  if (isAuthenticated) {
    router.push('/home');
    return null;
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <LinearGradient
        colors={[colors.primary, colors.accent, colors.gold]}
        style={{ flex: 1 }}
      >
        <View style={[commonStyles.content, { justifyContent: 'space-between', paddingVertical: 60 }]}>
          {/* Header Section */}
          {/* Section du haut contenant le logo et le titre de l'application */}
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.textWhite,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 30,
              boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.3)',
              elevation: 10,
            }}>
              <Icon name="restaurant" size={60} color={colors.primary} />
            </View>

            {/* Titre principal de l'app */}
            <Text style={[commonStyles.title, { 
              color: colors.textWhite, 
              fontSize: 32, 
              marginBottom: 15,
              textAlign: 'center',
            }]}>
              Saveurs d'Afrique
            </Text>
            
            <Text style={[commonStyles.text, { 
              color: colors.textWhite, 
              fontSize: 18,
              textAlign: 'center',
              marginBottom: 0,
              lineHeight: 26,
            }]}>
              Découvrez les trésors culinaires de Lubumbashi et partagez des moments inoubliables avec vos proches
            </Text>
          </View>

          {/* Features Section */}
          {/* Une petite zone visuelle qui montre trois fonctionnalités clés */}
          <View style={{ alignItems: 'center', marginVertical: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 30 }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.textWhite,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}>
                  <Icon name="search" size={28} color={colors.primary} />
                </View>
                <Text style={[commonStyles.text, { 
                  color: colors.textWhite, 
                  fontSize: 14, 
                  textAlign: 'center',
                  marginBottom: 0,
                }]}>
                  Explorez
                </Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.textWhite,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}>
                  <Icon name="people" size={28} color={colors.accent} />
                </View>
                <Text style={[commonStyles.text, { 
                  color: colors.textWhite, 
                  fontSize: 14, 
                  textAlign: 'center',
                  marginBottom: 0,
                }]}>
                  Invitez
                </Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.textWhite,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}>
                  <Icon name="heart" size={28} color={colors.gold} />
                </View>
                <Text style={[commonStyles.text, { 
                  color: colors.textWhite, 
                  fontSize: 14, 
                  textAlign: 'center',
                  marginBottom: 0,
                }]}>
                  Savourez
                </Text>
              </View>
            </View>

            {/* Cultural Message */}
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              padding: 20,
              marginHorizontal: 20,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}>
              <Text style={[commonStyles.text, { 
                color: colors.textWhite, 
                fontSize: 16,
                textAlign: 'center',
                marginBottom: 0,
                fontStyle: 'italic',
              }]}>
                "La nourriture est le langage universel de l'amour et de l'hospitalité africaine" 🌍
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {/* Boutons pour se connecter, s'inscrire ou utiliser un compte de test */}
          <View style={commonStyles.buttonContainer}>
            <TouchableOpacity
              style={[buttonStyles.primary, { 
                backgroundColor: colors.textWhite,
                marginBottom: 15,
                paddingVertical: 16,
              }]}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={[buttonStyles.text, { color: colors.primary, fontSize: 18 }]}>
                Se connecter
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttonStyles.secondary, { 
                borderColor: colors.textWhite,
                marginBottom: 15,
                paddingVertical: 16,
              }]}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={[buttonStyles.textSecondary, { color: colors.textWhite, fontSize: 18 }]}>
                S'inscrire
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 12,
                alignItems: 'center',
              }}
              onPress={handleTestLogin}
            >
              <Text style={[commonStyles.text, { 
                color: colors.textWhite, 
                fontSize: 16,
                textDecorationLine: 'underline',
                marginBottom: 0,
              }]}>
                Connexion test (développement)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
