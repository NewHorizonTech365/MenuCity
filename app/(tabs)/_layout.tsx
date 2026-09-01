import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, type ComponentProps } from 'react';
import { Easing, Platform, StyleSheet } from 'react-native';
import Animated, { interpolate, interpolateColor, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { triggerHaptic } from '../../lib/haptics';
import { colors, typography } from '../../styles/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
const icons: Record<string, { active: IconName; inactive: IconName }> = {
  home: { active: 'home', inactive: 'home-outline' },
  restaurants: { active: 'compass', inactive: 'compass-outline' },
  map: { active: 'map', inactive: 'map-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

interface TabIconProps {
  focused: boolean;
  color: string;
  icon: { active: IconName; inactive: IconName };
}

function TabIcon({ focused, color, icon }: TabIconProps) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 190, reduceMotion: ReduceMotion.System });
  }, [focused, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['rgba(255,122,0,0)', colors.primary]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.88, 1]) }],
  }));

  return (
    <Animated.View style={[styles.tabIcon, animatedStyle]}>
      <Ionicons name={focused ? icon.active : icon.inactive} color={focused ? colors.white : color} size={20} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenListeners={{ tabPress: () => triggerHaptic('selection') }} screenOptions={({ route }) => ({
      headerShown: false,
      animation: 'shift',
      transitionSpec: { animation: 'timing', config: { duration: 220, easing: Easing.out(Easing.cubic) } },
      sceneStyle: { backgroundColor: colors.background },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarHideOnKeyboard: true,
      tabBarLabelStyle: { fontFamily: typography.semiBold, fontSize: 10, marginTop: 1 },
      tabBarStyle: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: Platform.OS === 'android' ? 10 : 8,
        height: Platform.OS === 'android' ? 66 : 72,
        paddingTop: 6,
        paddingBottom: Platform.OS === 'android' ? 6 : 10,
        borderTopWidth: 0,
        borderRadius: 22,
        backgroundColor: colors.surface,
        shadowColor: '#111114',
        shadowOpacity: 0.12,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 12,
      },
      tabBarItemStyle: { borderRadius: 18 },
      tabBarIcon: ({ focused, color }) => {
        const icon = icons[route.name] || icons.home;
        return <TabIcon focused={focused} color={color} icon={icon} />;
      },
    })}>
      <Tabs.Screen name="home" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="restaurants" options={{ title: 'Découvrir' }} />
      <Tabs.Screen name="map" options={{ title: 'Carte' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
