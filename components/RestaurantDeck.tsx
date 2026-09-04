import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { triggerHaptic } from '../lib/haptics';
import { colors, radius, shadows, spacing, typography } from '../styles/theme';
import type { Restaurant } from '../types/Restaurant';
import FadeInImage from './ui/FadeInImage';
import PressableScale from './ui/PressableScale';
import RestaurantTile from './ui/RestaurantTile';
import StateView from './ui/StateView';

interface RestaurantDeckProps {
  restaurants: Restaurant[];
  onOpen: (restaurant: Restaurant) => void;
  onInvite: (restaurant: Restaurant) => void;
  distanceById?: ReadonlyMap<string, number | null>;
}

export default function RestaurantDeck({ restaurants, onOpen, onInvite, distanceById }: RestaurantDeckProps) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const thresholdReached = useSharedValue(false);
  const current = restaurants[index];
  const next = restaurants[index + 1];

  useEffect(() => {
    setIndex(0);
    translateX.value = 0;
    translateY.value = 0;
    thresholdReached.value = false;
  }, [restaurants, thresholdReached, translateX, translateY]);

  const finishSwipe = useCallback((direction: -1 | 1) => {
    translateX.value = 0;
    translateY.value = 0;
    thresholdReached.value = false;

    if (direction > 0 && current) {
      onOpen(current);
      return;
    }

    setIndex((value) => value + 1);
  }, [current, onOpen, thresholdReached, translateX, translateY]);

  const launchSwipe = useCallback((direction: -1 | 1) => {
    translateX.value = withTiming(direction * Math.max(width, 420), { duration: 210 }, (finished) => {
      if (finished) runOnJS(finishSwipe)(direction);
    });
  }, [finishSwipe, translateX, width]);

  const pan = useMemo(() => Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-22, 22])
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.12;
      const threshold = Math.min(width * 0.24, 110);
      const crossedThreshold = Math.abs(event.translationX) > threshold;

      if (crossedThreshold && !thresholdReached.value) {
        thresholdReached.value = true;
        runOnJS(triggerHaptic)('soft');
      } else if (!crossedThreshold && thresholdReached.value) {
        thresholdReached.value = false;
      }
    })
    .onEnd((event) => {
      const threshold = Math.min(width * 0.24, 110);
      thresholdReached.value = false;
      if (Math.abs(event.translationX) > threshold) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * Math.max(width, 420), { duration: 210 }, (finished) => {
          if (finished) runOnJS(finishSwipe)(direction);
        });
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
      }
    }), [finishSwipe, thresholdReached, translateX, translateY, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-width, 0, width], [-7, 0, 7])}deg` },
    ],
  }));
  const nextCardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(translateX.value), [0, width * 0.35], [0.52, 0.9], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(Math.abs(translateX.value), [0, width * 0.35], [0.965, 0.995], Extrapolation.CLAMP) }],
  }));
  const passBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-width * 0.24, -width * 0.08, 0], [1, 0.25, 0], Extrapolation.CLAMP),
  }));
  const discoverBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, width * 0.08, width * 0.24], [0, 0.25, 1], Extrapolation.CLAMP),
  }));

  if (!current) {
    return <StateView title="Vous avez vu toutes les adresses" message="Changez de filtre ou revenez à la liste complète." icon="checkmark-circle-outline" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.stack}>
        {next ? (
          <Animated.View style={[styles.nextCard, nextCardStyle]} importantForAccessibility="no-hide-descendants">
            <FadeInImage accessible={false} source={{ uri: next.image }} style={styles.nextImage} resizeMode="cover" />
            <Text style={styles.nextTitle}>{next.nom}</Text>
          </Animated.View>
        ) : null}
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.currentCard, animatedStyle]}>
            <RestaurantTile restaurant={current} variant="deck" distanceKm={distanceById?.get(current.id) ?? null} onPress={() => onOpen(current)} />
            <Animated.View pointerEvents="none" style={[styles.swipeBadge, styles.passBadge, passBadgeStyle]}>
              <Text style={[styles.swipeBadgeText, styles.passBadgeText]}>PASSER</Text>
            </Animated.View>
            <Animated.View pointerEvents="none" style={[styles.swipeBadge, styles.discoverBadge, discoverBadgeStyle]}>
              <Text style={[styles.swipeBadgeText, styles.discoverBadgeText]}>DÉCOUVRIR</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      <Text style={styles.hint}>Glissez à gauche pour passer, à droite pour découvrir.</Text>
      <View style={styles.actions}>
        <PressableScale accessibilityRole="button" accessibilityLabel="Passer ce restaurant" haptic="selection" onPress={() => launchSwipe(-1)} style={styles.roundButton}>
          <Ionicons name="close" size={25} color={colors.textSecondary} />
        </PressableScale>
        <PressableScale accessibilityRole="button" accessibilityLabel={`Découvrir ${current.nom}`} haptic="soft" onPress={() => onOpen(current)} style={styles.discoverButton}>
          <Ionicons name="restaurant-outline" size={19} color={colors.white} />
          <Text style={styles.discoverLabel}>Découvrir</Text>
        </PressableScale>
        <PressableScale accessibilityRole="button" accessibilityLabel={`Inviter un ami chez ${current.nom}`} haptic="soft" onPress={() => onInvite(current)} style={styles.roundButton}>
          <Ionicons name="person-add-outline" size={22} color={colors.primary} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  stack: { minHeight: 420, justifyContent: 'center' },
  currentCard: { width: '100%' },
  nextCard: { position: 'absolute', left: 10, right: 10, top: 10, bottom: 2, overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  nextImage: { width: '100%', height: 220 },
  nextTitle: { padding: spacing.md, color: colors.text, fontFamily: typography.bold, fontSize: 18 },
  swipeBadge: { position: 'absolute', top: spacing.lg, zIndex: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.94)', borderWidth: 2 },
  passBadge: { left: spacing.md, borderColor: colors.textSecondary, transform: [{ rotate: '-5deg' }] },
  discoverBadge: { right: spacing.md, borderColor: colors.primary, transform: [{ rotate: '5deg' }] },
  swipeBadgeText: { fontFamily: typography.bold, fontSize: 12, letterSpacing: 0.8 },
  passBadgeText: { color: colors.textSecondary },
  discoverBadgeText: { color: colors.primary },
  hint: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 12, textAlign: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  roundButton: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  discoverButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingHorizontal: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.primary },
  discoverLabel: { color: colors.white, fontFamily: typography.semiBold, fontSize: 14 },
});
