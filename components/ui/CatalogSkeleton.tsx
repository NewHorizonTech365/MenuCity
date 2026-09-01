import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, spacing } from '../../styles/theme';

type SkeletonVariant = 'home' | 'deck' | 'list';

interface CatalogSkeletonProps {
  variant: SkeletonVariant;
}

const listRows = ['row-1', 'row-2', 'row-3', 'row-4'];

export default function CatalogSkeleton({ variant }: CatalogSkeletonProps) {
  const opacity = useSharedValue(0.56);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.72;
      return;
    }

    opacity.value = withRepeat(withTiming(1, { duration: 720 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const blockStyle = [styles.block, animatedStyle];

  if (variant === 'list') {
    return (
      <View accessible accessibilityLabel="Chargement des restaurants" accessibilityLiveRegion="polite" style={styles.list}>
        {listRows.map((row) => (
          <View key={row} style={styles.row}>
            <Animated.View style={[blockStyle, styles.thumbnail]} />
            <View style={styles.rowCopy}>
              <Animated.View style={[blockStyle, styles.lineStrong]} />
              <Animated.View style={[blockStyle, styles.line]} />
              <Animated.View style={[blockStyle, styles.lineShort]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View accessible accessibilityLabel="Chargement du catalogue" accessibilityLiveRegion="polite" style={styles.feature}>
      {variant === 'home' ? <Animated.View style={[blockStyle, styles.sectionTitle]} /> : null}
      <Animated.View style={[blockStyle, variant === 'deck' ? styles.deckImage : styles.featureImage]} />
      <Animated.View style={[blockStyle, styles.lineStrong]} />
      <Animated.View style={[blockStyle, styles.line]} />
      {variant === 'deck' ? <Animated.View style={[blockStyle, styles.lineShort]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.border },
  feature: { gap: spacing.sm },
  featureImage: { height: 235, borderRadius: radius.lg },
  deckImage: { height: 330, borderRadius: radius.lg },
  sectionTitle: { width: '48%', height: 18, borderRadius: radius.pill },
  lineStrong: { width: '66%', height: 16, borderRadius: radius.pill },
  line: { width: '82%', height: 12, borderRadius: radius.pill },
  lineShort: { width: '42%', height: 12, borderRadius: radius.pill },
  list: { gap: spacing.sm },
  row: { height: 112, flexDirection: 'row', gap: spacing.sm, padding: 6, borderRadius: radius.lg, backgroundColor: colors.surface },
  thumbnail: { width: 100, height: 100, borderRadius: radius.md },
  rowCopy: { flex: 1, justifyContent: 'center', gap: spacing.sm },
});
