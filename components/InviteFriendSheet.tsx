
// InviteFriendSheet
// Ce composant fournit une UI complète pour préparer et partager une
// invitation à un restaurant. Il inclut :
// - Un formulaire (nom, email, date, heure, message)
// - Des fonctions pour partager via WhatsApp, Facebook, Instagram, Email, SMS
// - Des animations d'entrée et d'affichage des options de partage
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Animated, Linking, Platform } from 'react-native';
import { Restaurant } from '../types/Restaurant';
import { colors, commonStyles, buttonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

interface InviteFriendSheetProps {
  restaurant: Restaurant;
  onClose: () => void;
  onSendInvitation: (inviteData: {
    restaurantId: string;
    inviteEmail: string;
    inviteNom: string;
    message: string;
    dateProposee: string;
    heureProposee: string;
  }) => void;
}

export default function InviteFriendSheet({ restaurant, onClose, onSendInvitation }: InviteFriendSheetProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNom, setInviteNom] = useState('');
  const [message, setMessage] = useState(`Salut ! J'aimerais t'inviter à dîner chez ${restaurant.nom}. C'est un excellent restaurant de ${restaurant.cuisine.toLowerCase()} à Lubumbashi. Qu'en dis-tu ?`);
  const [dateProposee, setDateProposee] = useState('');
  const [heureProposee, setHeureProposee] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const shareOptionsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateShareOptions = () => {
    setShowShareOptions(!showShareOptions);
    Animated.spring(shareOptionsAnim, {
      toValue: showShareOptions ? 0 : 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const generateInviteMessage = () => {
    const appDownloadLink = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/votre-app' 
      : 'https://play.google.com/store/apps/details?id=votre.app';
    
    // Retourne le texte complet à partager. Inclut le message personnalisé,
    // les informations du restaurant et un lien de téléchargement vers l'app.
    return `${message}\n\n📍 ${restaurant.nom}\n📍 ${restaurant.adresse}\n🍽️ ${restaurant.cuisine}\n📅 ${dateProposee} à ${heureProposee}\n\n💫 Télécharge notre app pour réserver: ${appDownloadLink}`;
  };

  const shareViaWhatsApp = async () => {
    const phoneNumber = ''; // Vous pouvez demander le numéro de téléphone
    const text = encodeURIComponent(generateInviteMessage());
    const url = `whatsapp://send?text=${text}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        console.log('Invitation partagée via WhatsApp');
      } else {
        Alert.alert('WhatsApp non disponible', 'WhatsApp n\'est pas installé sur cet appareil');
      }
    } catch (error) {
      console.log('Erreur WhatsApp:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp');
    }
  };

  const shareViaFacebook = async () => {
    const text = encodeURIComponent(generateInviteMessage());
    const url = `fb://facewebmodal/f?href=https://www.facebook.com/sharer/sharer.php?u=${text}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        console.log('Invitation partagée via Facebook');
      } else {
        // Fallback vers le navigateur web
        const webUrl = `https://www.facebook.com/sharer/sharer.php?u=${text}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.log('Erreur Facebook:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir Facebook');
    }
  };

  const shareViaInstagram = async () => {
    // Instagram ne permet pas le partage direct de texte, on copie dans le presse-papier
    await Clipboard.setStringAsync(generateInviteMessage());
    Alert.alert(
      'Message copié !',
      'Le message d\'invitation a été copié. Vous pouvez maintenant l\'ouvrir Instagram et le coller dans un message.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Ouvrir Instagram', 
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL('instagram://');
              if (supported) {
                await Linking.openURL('instagram://');
              } else {
                Alert.alert('Instagram non disponible', 'Instagram n\'est pas installé sur cet appareil');
              }
            } catch (error) {
              console.log('Erreur Instagram:', error);
            }
          }
        }
      ]
    );
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Invitation à dîner chez ${restaurant.nom}`);
    const body = encodeURIComponent(generateInviteMessage());
    const url = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application email');
    });
  };

  const shareViaGeneric = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(generateInviteMessage());
        console.log('Invitation partagée via partage générique');
      } else {
        // Fallback: copier dans le presse-papier
        await Clipboard.setStringAsync(generateInviteMessage());
        Alert.alert('Message copié !', 'Le message d\'invitation a été copié dans le presse-papier');
      }
    } catch (error) {
      console.log('Erreur partage:', error);
      Alert.alert('Erreur', 'Impossible de partager le message');
    }
  };

  const copyInviteLink = async () => {
    const appDownloadLink = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/votre-app' 
      : 'https://play.google.com/store/apps/details?id=votre.app';
    
    await Clipboard.setStringAsync(appDownloadLink);
    Alert.alert('Lien copié !', 'Le lien de téléchargement de l\'app a été copié');
  };

  const handleSendInvitation = () => {
    if (!inviteNom.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le nom de votre ami');
      return;
    }

    if (!dateProposee.trim()) {
      Alert.alert('Erreur', 'Veuillez proposer une date');
      return;
    }

    if (!heureProposee.trim()) {
      Alert.alert('Erreur', 'Veuillez proposer une heure');
      return;
    }

    // Animation de succès
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onSendInvitation({
      restaurantId: restaurant.id,
      inviteEmail: inviteEmail.trim(),
      inviteNom: inviteNom.trim(),
      message: message.trim(),
      dateProposee: dateProposee.trim(),
      heureProposee: heureProposee.trim(),
    });

    Alert.alert(
      'Prêt à partager !',
      `Votre invitation pour ${restaurant.nom} est prête. Choisissez comment la partager.`,
      [{ text: 'OK', onPress: () => setShowShareOptions(true) }]
    );
  };

  const shareOptions = [
    { name: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366', action: shareViaWhatsApp },
    { name: 'Facebook', icon: 'logo-facebook', color: '#1877F2', action: shareViaFacebook },
    { name: 'Instagram', icon: 'logo-instagram', color: '#E4405F', action: shareViaInstagram },
    { name: 'Email', icon: 'mail', color: colors.primary, action: shareViaEmail },
    { name: 'Autre', icon: 'share', color: colors.accent, action: shareViaGeneric },
  ];

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            { scale: scaleAnim }
          ],
        }
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inviter un ami</Text>
        <TouchableOpacity style={styles.shareToggleButton} onPress={animateShareOptions}>
          <Icon name="share" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.restaurantInfo,
            {
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0.9, 1],
                    outputRange: [0.95, 1],
                  }),
                }
              ],
            }
          ]}
        >
          <Icon name="restaurant" size={24} color={colors.primary} />
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantName}>{restaurant.nom}</Text>
            <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
            <Text style={styles.restaurantAddress}>{restaurant.adresse}</Text>
          </View>
        </Animated.View>

        {/* Options de partage animées */}
        {showShareOptions && (
          <Animated.View 
            style={[
              styles.shareOptionsContainer,
              {
                opacity: shareOptionsAnim,
                transform: [
                  {
                    scale: shareOptionsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  }
                ],
              }
            ]}
          >
            <Text style={styles.shareTitle}>Partager l'invitation</Text>
            <View style={styles.shareOptions}>
              {shareOptions.map((option, index) => (
                <Animated.View
                  key={option.name}
                  style={[
                    {
                      transform: [
                        {
                          scale: shareOptionsAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                          }),
                        }
                      ],
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.shareOption, { backgroundColor: option.color }]}
                    onPress={option.action}
                  >
                    <Icon name={option.icon} size={24} color={colors.textWhite} />
                    <Text style={styles.shareOptionText}>{option.name}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
            
            <TouchableOpacity style={styles.copyLinkButton} onPress={copyInviteLink}>
              <Icon name="link" size={20} color={colors.primary} />
              <Text style={styles.copyLinkText}>Copier le lien de téléchargement</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de votre ami</Text>
            <TextInput
              style={styles.input}
              value={inviteNom}
              onChangeText={setInviteNom}
              placeholder="Ex: Jean Mukendi"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email de votre ami (optionnel)</Text>
            <TextInput
              style={styles.input}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Ex: jean@example.com"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.dateTimeContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Date proposée</Text>
              <TextInput
                style={styles.input}
                value={dateProposee}
                onChangeText={setDateProposee}
                placeholder="Ex: 25/01/2024"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Heure proposée</Text>
              <TextInput
                style={styles.input}
                value={heureProposee}
                onChangeText={setHeureProposee}
                placeholder="Ex: 19h30"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message personnalisé</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={message}
              onChangeText={setMessage}
              placeholder="Écrivez votre message d'invitation..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.sendButton} onPress={handleSendInvitation}>
          <Icon name="send" size={20} color={colors.textWhite} />
          <Text style={styles.sendButtonText}>Préparer l'invitation</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  shareToggleButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 15,
    padding: 16,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    boxShadow: '0px 4px 15px rgba(210, 105, 30, 0.2)',
    elevation: 4,
  },
  restaurantDetails: {
    marginLeft: 12,
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  restaurantAddress: {
    fontSize: 12,
    color: colors.textLight,
  },
  shareOptionsContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  shareOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  shareOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
  shareOptionText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textWhite,
    marginTop: 4,
  },
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  copyLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  form: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    ...commonStyles.input,
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: colors.backgroundAlt,
  },
  messageInput: {
    height: 100,
    paddingTop: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  footer: {
    padding: 20,
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sendButton: {
    ...buttonStyles.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
  },
  sendButtonText: {
    ...buttonStyles.text,
    marginLeft: 8,
    fontSize: 16,
  },
});
