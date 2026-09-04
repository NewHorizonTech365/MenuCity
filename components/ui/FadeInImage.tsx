import { useEffect, useState } from 'react';
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

const fallbackImage = require('../../assets/images/menu-city-logo.png');

export default function FadeInImage({ source, style, onError, onLoad, onLoadStart, ...props }: FadeInImageProps) {
  const opacity = useSharedValue(0);
  const [failed, setFailed] = useState(false);
  const sourceKey = typeof source === 'object' && source && 'uri' in source ? source.uri : undefined;

  useEffect(() => {
    opacity.value = 0;
    setFailed(false);
  }, [opacity, sourceKey]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Image
      {...props}
      source={failed ? fallbackImage : source}
      progressiveRenderingEnabled
      onLoadStart={() => {
        opacity.value = 0;
        onLoadStart?.();
      }}
      onLoad={(event) => {
        opacity.value = withTiming(1, { duration: 220, reduceMotion: ReduceMotion.System });
        onLoad?.(event);
      }}
      onError={(event) => {
        if (!failed) setFailed(true);
        opacity.value = withTiming(1, { duration: 120, reduceMotion: ReduceMotion.System });
        onError?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
