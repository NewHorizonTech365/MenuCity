import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, spacing, typography } from '../../styles/theme';
import PressableScale from './PressableScale';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export default function Chip({ label, selected = false, onPress }: ChipProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, {
      duration: 180,
      reduceMotion: ReduceMotion.System,
    });
  }, [progress, selected]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surface, colors.primary]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.primary]),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.textSecondary, colors.white]),
  }));

  return (
    <PressableScale
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected }}
      disabled={!onPress}
      haptic={onPress ? 'selection' : false}
      onPress={onPress}
      scaleTo={0.95}
      style={[styles.chip, containerStyle]}
    >
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: { height: 38, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.textSecondary, fontFamily: typography.semiBold, fontSize: 12 },
});
