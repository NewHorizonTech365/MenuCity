// BottomNavigation.tsx modernisé glass + premium
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTheme } from '../styles/theme';
import Icon from './Icon';
import { Dimensions } from 'react-native';

interface BottomNavigationProps {
  currentRoute: string;
}

export default function BottomNavigation({ currentRoute }: BottomNavigationProps) {
  const router = useRouter();
  const { colors, radius, spacing } = useTheme();

  const scaleAnims = useRef({
    home: new Animated.Value(1),
    restaurants: new Animated.Value(1),
    profile: new Animated.Value(1),
  }).current;

  type TabKey = 'home' | 'restaurants' | 'profile';

  const handlePress = (route: TabKey, path: string) => {
    Animated.sequence([
      Animated.timing(scaleAnims[route], {
        toValue: 0.85,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[route], {
        toValue: 1,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start();

    router.push(path as any);
  };

  const tabs: {key: TabKey; label: string; icon: string; path: string;}[] = [
    { key: 'home', label: 'Accueil', icon: 'home', path: '/home' },
    { key: 'restaurants', label: 'Restaurants', icon: 'restaurant', path: '/restaurants' },
    { key: 'profile', label: 'Profil', icon: 'person', path: '/profile' },
  ];

  return (
    <View style={{ position: 'absolute', bottom: 18, left: 16, right: 16 }}>
      <BlurView
        intensity={60}
        tint="light"
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          borderRadius: radius.lg,
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: 'rgba(255,255,255,0.8)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = currentRoute === tab.key;

          return (
            <Animated.View
              key={tab.key}
              style={{
                transform: [{ scale: scaleAnims[tab.key] }],
              }}
            >
              <TouchableOpacity
                onPress={() => handlePress(tab.key, tab.path)}
                style={{
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: radius.md,
                  backgroundColor: isActive ? colors.primary : 'transparent',
                  minWidth: 70,
                }}
                activeOpacity={0.6}
              >
                <Icon
                  name={isActive ? tab.icon : `${tab.icon}-outline`}
                  size={26}
                  color={isActive ? '#fff' : colors.textLight}
                />
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 2,
                    color: isActive ? '#fff' : colors.textLight,
                    fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </BlurView>
    </View>
  );
}
