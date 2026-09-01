import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Easing, useWindowDimensions } from 'react-native';

import { colors, typography } from '../../styles/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
const icons: Record<string, { active: IconName; inactive: IconName }> = {
  home: { active: 'home', inactive: 'home-outline' },
  restaurants: { active: 'compass', inactive: 'compass-outline' },
  map: { active: 'map', inactive: 'map-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export default function WebTabsLayout() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      animation: 'fade',
      transitionSpec: { animation: 'timing', config: { duration: 180, easing: Easing.out(Easing.cubic) } },
      sceneStyle: { backgroundColor: colors.background },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarPosition: isWide ? 'left' : 'bottom',
      tabBarVariant: isWide ? 'material' : 'uikit',
      tabBarLabelPosition: 'below-icon',
      tabBarLabelStyle: { fontFamily: typography.semiBold, fontSize: 11 },
      tabBarItemStyle: isWide ? { minHeight: 74 } : undefined,
      tabBarStyle: isWide
        ? { width: 106, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: colors.surface, paddingVertical: 18 }
        : { height: 66, paddingTop: 7, paddingBottom: 8, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
      tabBarIcon: ({ focused, color, size }) => {
        const icon = icons[route.name] || icons.home;
        return <Ionicons name={focused ? icon.active : icon.inactive} color={color} size={size} />;
      },
    })}>
      <Tabs.Screen name="home" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="restaurants" options={{ title: 'Découvrir' }} />
      <Tabs.Screen name="map" options={{ title: 'Carte' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
