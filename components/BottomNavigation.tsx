
// Bottom navigation bar
// Ce composant affiche une barre de navigation en bas avec 3 onglets.
// - `currentRoute` doit être une clé ('home'|'restaurants'|'profile') pour
//   indiquer quel onglet est actif.
// - Lorsqu'on appuie sur un onglet, on exécute une petite animation puis
//   on appelle `router.push` pour naviguer.
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface BottomNavigationProps {
  currentRoute: string;
}

export default function BottomNavigation({ currentRoute }: BottomNavigationProps) {
  const router = useRouter();
  // Animated values = échelle utilisée pour chaque onglet (pour l'effet "press")
  const scaleAnims = useRef({
    home: new Animated.Value(1),
    restaurants: new Animated.Value(1),
    profile: new Animated.Value(1),
  }).current;

  const handlePress = (route: string, path: string) => {
    console.log('Navigation vers:', path);
    
    // Animation de pression
    Animated.sequence([
      Animated.timing(scaleAnims[route], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[route], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    router.push(path);
  };

  // Configuration des onglets : clé, label, icône et chemin de navigation
  const tabs = [
    {
      key: 'home',
      label: 'Accueil',
      icon: 'home',
      path: '/home',
    },
    {
      key: 'restaurants',
      label: 'Restaurants',
      icon: 'restaurant',
      path: '/restaurants',
    },
    {
      key: 'profile',
      label: 'Profil',
      icon: 'person',
      path: '/profile',
    },
  ];

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.backgroundAlt,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: 20,
      paddingTop: 10,
      paddingHorizontal: 20,
      boxShadow: '0px -4px 15px rgba(0, 0, 0, 0.1)',
      elevation: 10,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        {tabs.map((tab) => {
          // isActive : indique si l'onglet courant est sélectionné
          const isActive = currentRoute === tab.key;
          
          return (
            <Animated.View
              key={tab.key}
              style={{
                // On utilise l'animation d'échelle pour créer un petit effet
                transform: [{ scale: scaleAnims[tab.key] }],
              }}
            >
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: isActive ? colors.primary : 'transparent',
                  minWidth: 70,
                }}
                // Lors d'un appui on déclenche handlePress
                onPress={() => handlePress(tab.key, tab.path)}
                activeOpacity={0.7}
              >
                {/* Icon : variant outline si inactif */}
                <Icon 
                  name={isActive ? tab.icon : `${tab.icon}-outline`} 
                  size={24} 
                  color={isActive ? colors.textWhite : colors.text} 
                />
                <Text style={{
                  fontSize: 12,
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? colors.textWhite : colors.text,
                  marginTop: 4,
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
