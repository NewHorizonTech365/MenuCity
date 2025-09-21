
// Home screen: tableau de bord principal après la connexion
// Montre un header personnalisé, des actions rapides et des recommandations.
import React, { useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../providers/AuthProvider';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import BottomNavigation from '../components/BottomNavigation';
import Icon from '../components/Icon';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée séquentielle
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const quickActions = [
    {
      title: 'Restaurants',
      subtitle: 'Découvrir & Inviter',
      icon: 'restaurant',
      color: colors.primary,
      route: '/restaurants',
    },
    {
      title: 'Mon Profil',
      subtitle: 'Gérer mon compte',
      icon: 'person',
      color: colors.accent,
      route: '/profile',
    },
    {
      title: 'Invitations',
      subtitle: 'Mes invitations',
      icon: 'mail',
      color: colors.tertiary,
      route: '/restaurants', // Place-holder : modifier si une route dédiée est ajoutée
    },
  ];

  const handleQuickAction = (route: string) => {
    console.log('Navigation vers:', route);
    router.push(route);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header avec animation */}
        {/* Contient le greeting et accès rapide au profil */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={[commonStyles.gradientHeader, { marginBottom: 30 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { color: colors.textWhite, fontSize: 14, marginBottom: 5 }]}>
                  Bonjour,
                </Text>
                <Text style={[commonStyles.title, { color: colors.textWhite, fontSize: 24, marginBottom: 0 }]}>
                  {user?.nom || 'Utilisateur'} 👋
                </Text>
              </View>
              <TouchableOpacity 
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 25,
                  padding: 12,
                }}
                onPress={() => router.push('/profile')}
              >
                <Icon name="person" size={24} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
            <Text style={[commonStyles.text, { color: colors.textWhite, marginBottom: 0 }]}>
              Prêt à découvrir de nouveaux restaurants ?
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Section statistiques */}
        {/* Petites cartes résumant des métriques (visites, invitations, etc.) */}
        <Animated.View
          style={{
            paddingHorizontal: 20,
            marginBottom: 30,
            opacity: scaleAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <View style={{
              backgroundColor: colors.backgroundAlt,
              borderRadius: 15,
              padding: 16,
              flex: 1,
              marginRight: 10,
              alignItems: 'center',
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
              boxShadow: '0px 4px 15px rgba(210, 105, 30, 0.1)',
              elevation: 3,
            }}>
              <Icon name="restaurant" size={24} color={colors.primary} />
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text,
                marginTop: 8,
              }}>
                12
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.textLight,
                textAlign: 'center',
              }}>
                Restaurants visités
              </Text>
            </View>

            <View style={{
              backgroundColor: colors.backgroundAlt,
              borderRadius: 15,
              padding: 16,
              flex: 1,
              marginLeft: 10,
              alignItems: 'center',
              borderLeftWidth: 4,
              borderLeftColor: colors.accent,
              boxShadow: '0px 4px 15px rgba(255, 140, 0, 0.1)',
              elevation: 3,
            }}>
              <Icon name="people" size={24} color={colors.accent} />
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text,
                marginTop: 8,
              }}>
                8
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.textLight,
                textAlign: 'center',
              }}>
                Amis invités
              </Text>
            </View>
          </View>
        </Animated.View>

  {/* Actions rapides */}
  {/* Liste d'actions cliquables pour navigation rapide */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={[commonStyles.subtitle, { marginBottom: 20, textAlign: 'left' }]}>
            Actions rapides
          </Text>
          
          {quickActions.map((action, index) => (
            <Animated.View
              key={action.title}
              style={{
                opacity: cardsAnim,
                transform: [
                  {
                    translateY: cardsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  }
                ],
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: colors.backgroundAlt,
                  borderRadius: 15,
                  padding: 20,
                  marginBottom: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderLeftWidth: 4,
                  borderLeftColor: action.color,
                  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                  elevation: 4,
                }}
                onPress={() => handleQuickAction(action.route)}
                activeOpacity={0.8}
              >
                <View style={{
                  backgroundColor: action.color,
                  borderRadius: 25,
                  padding: 12,
                  marginRight: 16,
                }}>
                  <Icon name={action.icon} size={24} color={colors.textWhite} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: 4,
                  }}>
                    {action.title}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: colors.textLight,
                  }}>
                    {action.subtitle}
                  </Text>
                </View>
                
                <Icon name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Section recommandations */}
        {/* Carte mettant en avant un restaurant recommandé */}
        <Animated.View
          style={{
            paddingHorizontal: 20,
            opacity: cardsAnim,
          }}
        >
          <Text style={[commonStyles.subtitle, { marginBottom: 20, textAlign: 'left' }]}>
            Recommandé pour vous
          </Text>
          
          <View style={{
            backgroundColor: colors.backgroundAlt,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
            boxShadow: '0px 6px 20px rgba(210, 105, 30, 0.15)',
            elevation: 5,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Icon name="star" size={20} color={colors.gold} />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginLeft: 8,
              }}>
                Restaurant du jour
              </Text>
            </View>
            
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.primary,
              marginBottom: 8,
            }}>
              Chez Mama Koko
            </Text>
            
            <Text style={{
              fontSize: 14,
              color: colors.textLight,
              marginBottom: 15,
              lineHeight: 20,
            }}>
              Cuisine congolaise authentique dans une ambiance chaleureuse. 
              Parfait pour un dîner entre amis !
            </Text>
            
            <TouchableOpacity
              style={[buttonStyles.accent, { alignSelf: 'flex-start' }]}
              onPress={() => router.push('/restaurants')}
            >
              <Text style={buttonStyles.textAccent}>Découvrir</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Barre de navigation placée en bas. Voir components/BottomNavigation.tsx */}
      <BottomNavigation currentRoute="home" />
    </SafeAreaView>
  );
}
