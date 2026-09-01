import type { ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { triggerHaptic, type HapticFeedback } from '../../lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, 'children' | 'style'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: HapticFeedback | false;
}

export default function PressableScale({
  children,
  style,
  scaleTo = 0.97,
  haptic = false,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPress={(event) => {
        if (haptic) triggerHaptic(haptic);
        onPress?.(event);
      }}
      onPressIn={(event) => {
        scale.value = withTiming(scaleTo, { duration: 90, reduceMotion: ReduceMotion.System });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 280,
          reduceMotion: ReduceMotion.System,
        });
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
