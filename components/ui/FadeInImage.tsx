import { useEffect } from 'react';
import {
  type ImageProps,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface FadeInImageProps extends Omit<ImageProps, 'style'> {
  style?: StyleProp<ImageStyle>;
}

export default function FadeInImage({ source, style, onLoad, onLoadStart, ...props }: FadeInImageProps) {
  const opacity = useSharedValue(0);
  const sourceKey = typeof source === 'object' && source && 'uri' in source ? source.uri : undefined;

  useEffect(() => {
    opacity.value = 0;
  }, [opacity, sourceKey]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Image
      {...props}
      source={source}
      onLoadStart={() => {
        opacity.value = 0;
        onLoadStart?.();
      }}
      onLoad={(event) => {
        opacity.value = withTiming(1, { duration: 220, reduceMotion: ReduceMotion.System });
        onLoad?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
