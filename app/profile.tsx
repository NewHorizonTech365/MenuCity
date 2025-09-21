
// Profile screen: affiche les informations utilisateur et permet modification
// - Permet de changer l'image de profil / couverture via l'image picker
// - Utilise AuthProvider pour obtenir et mettre à jour l'utilisateur
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useAuth } from '../providers/AuthProvider';
import BottomNavigation from '../components/BottomNavigation';
import ProfileEditSheet from '../components/ProfileEditSheet';
import SimpleBottomSheet from '../components/BottomSheet';
import Icon from '../components/Icon';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const router = useRouter();
  const [isEditSheetVisible, setIsEditSheetVisible] = useState(false);

  useEffect(() => {
    console.log('ProfileScreen - isAuthenticated:', isAuthenticated, 'user:', user);
  }, [isAuthenticated, user]);

  const handleImagePicker = async (type: 'profile' | 'cover') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        if (type === 'profile') {
          updateUser({ profileImage: imageUri });
        } else {
          updateUser({ coverImage: imageUri });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection d\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  // Afficher une page invitant à se connecter si l'utilisateur n'est pas
  // authentifié. Le BottomNavigation reste visible pour garder la cohérence.
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={[commonStyles.gradientHeader, { width: '100%', alignItems: 'center' }]}
          >
            <Icon name="person-circle-outline" size={80} color={colors.textWhite} />
            <Text style={[commonStyles.title, { color: colors.textWhite, marginTop: 20 }]}>
              Connexion requise
            </Text>
            <Text style={[commonStyles.text, { color: colors.textWhite, marginBottom: 0 }]}>
              Connectez-vous pour accéder à votre profil
            </Text>
          </LinearGradient>

          <View style={commonStyles.buttonContainer}>
            <TouchableOpacity style={buttonStyles.primary} onPress={handleLogin}>
              <Text style={buttonStyles.text}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomNavigation currentRoute="profile" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
  {/* Cover Image */}
  {/* Zone de couverture avec option de changer l'image */}
        <View style={{ position: 'relative', height: 200 }}>
          <LinearGradient
            colors={[colors.primary, colors.accent, colors.gold]}
            style={{ 
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {user.coverImage ? (
              <Image 
                source={{ uri: user.coverImage }} 
                style={{ width: '100%', height: '100%', position: 'absolute' }}
              />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Icon name="image-outline" size={40} color={colors.textWhite} />
                <Text style={[commonStyles.text, { color: colors.textWhite, marginTop: 10 }]}>
                  Photo de couverture
                </Text>
              </View>
            )}
          </LinearGradient>
          
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              backgroundColor: colors.backgroundAlt,
              borderRadius: 20,
              padding: 8,
              boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
              elevation: 4,
            }}
            onPress={() => handleImagePicker('cover')}
          >
            <Icon name="camera" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

  {/* Profile Section */}
  {/* Contient l'avatar, le nom et une courte description */}
        <View style={{ paddingHorizontal: 20, marginTop: -50, alignItems: 'center' }}>
          <View style={{ position: 'relative', marginBottom: 20 }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.backgroundAlt,
              borderWidth: 4,
              borderColor: colors.backgroundAlt,
              overflow: 'hidden',
              boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
              elevation: 6,
            }}>
              {user.profileImage ? (
                <Image 
                  source={{ uri: user.profileImage }} 
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <View style={{ 
                  flex: 1, 
                  backgroundColor: colors.primary, 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Text style={{ 
                    fontSize: 36, 
                    fontWeight: '700', 
                    color: colors.textWhite 
                  }}>
                    {user.nom.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: colors.primary,
                borderRadius: 15,
                padding: 6,
                borderWidth: 2,
                borderColor: colors.backgroundAlt,
              }}
              onPress={() => handleImagePicker('profile')}
            >
              <Icon name="camera" size={16} color={colors.textWhite} />
            </TouchableOpacity>
          </View>

          <Text style={[commonStyles.title, { marginBottom: 5 }]}>
            {user.nom}
          </Text>
          <Text style={[commonStyles.text, { marginBottom: 20 }]}>
            Passionné de gastronomie congolaise et exploratrice culinaire de Lubumbashi
          </Text>
        </View>

  {/* User Info Cards */}
  {/* Cartes affichant email, téléphone, ville etc. */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="mail" size={20} color={colors.primary} />
              <Text style={[commonStyles.subtitle, { marginLeft: 12, marginBottom: 0 }]}>
                Email
              </Text>
            </View>
            <Text style={[commonStyles.text, { marginBottom: 0, marginLeft: 32 }]}>
              {user.email}
            </Text>
          </View>

          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="call" size={20} color={colors.primary} />
              <Text style={[commonStyles.subtitle, { marginLeft: 12, marginBottom: 0 }]}>
                Téléphone
              </Text>
            </View>
            <Text style={[commonStyles.text, { marginBottom: 0, marginLeft: 32 }]}>
              {user.telephone}
            </Text>
          </View>

          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="location" size={20} color={colors.primary} />
              <Text style={[commonStyles.subtitle, { marginLeft: 12, marginBottom: 0 }]}>
                Ville
              </Text>
            </View>
            <Text style={[commonStyles.text, { marginBottom: 0, marginLeft: 32 }]}>
              Lubumbashi, République Démocratique du Congo
            </Text>
          </View>
        </View>

  {/* Action Buttons */}
  {/* Modifier le profil ou se déconnecter */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 12 }]}
            onPress={() => setIsEditSheetVisible(true)}
          >
            <Text style={buttonStyles.text}>Modifier le profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 12 }]}
            onPress={handleLogout}
          >
            <Text style={buttonStyles.textSecondary}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

  {/* African Cultural Section */}
  {/* Section décorative avec un message culturel */}
        <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
          <View style={[
            commonStyles.africanPattern,
            {
              borderRadius: 20,
              padding: 20,
            }
          ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="globe" size={24} color={colors.textWhite} />
              <Text style={[
                commonStyles.subtitle, 
                { color: colors.textWhite, marginLeft: 10, marginBottom: 0 }
              ]}>
                Votre Voyage Culinaire
              </Text>
            </View>
            <Text style={[
              commonStyles.text, 
              { color: colors.textWhite, marginBottom: 0, textAlign: 'left' }
            ]}>
              Explorez les saveurs authentiques de l'Afrique centrale et partagez vos découvertes 
              culinaires avec vos amis et votre famille.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation currentRoute="profile" />

      <SimpleBottomSheet
        isVisible={isEditSheetVisible}
        onClose={() => setIsEditSheetVisible(false)}
      >
        <ProfileEditSheet
          user={user}
          onUpdate={updateUser}
          onClose={() => setIsEditSheetVisible(false)}
        />
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
