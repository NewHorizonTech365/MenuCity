import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, type LayoutChangeEvent, View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { triggerHaptic } from '../../lib/haptics';
import { colors, radius, typography } from '../../styles/theme';

interface Segment<T extends string> { key: T; label: string }
interface SegmentedControlProps<T extends string> { segments: Segment<T>[]; value: T; onChange: (value: T) => void }

export default function SegmentedControl<T extends string>({ segments, value, onChange }: SegmentedControlProps<T>) {
  const [segmentWidth, setSegmentWidth] = useState(0);
  const selectedIndex = Math.max(0, segments.findIndex((segment) => segment.key === value));
  const progress = useSharedValue(selectedIndex);

  useEffect(() => {
    progress.value = withTiming(selectedIndex, { duration: 210, reduceMotion: ReduceMotion.System });
  }, [progress, selectedIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: progress.value * segmentWidth }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    setSegmentWidth((event.nativeEvent.layout.width - 6) / Math.max(segments.length, 1));
  };

  return (
    <View style={styles.container} accessibilityRole="tablist" onLayout={handleLayout}>
      {segmentWidth > 0 ? <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} /> : null}
      {segments.map((segment) => {
        const selected = segment.key === value;
        return (
          <Pressable
            key={segment.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) {
                triggerHaptic('selection');
                onChange(segment.key);
              }
            }}
            style={({ pressed }) => [styles.segment, pressed && styles.pressed]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{segment.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 44, flexDirection: 'row', padding: 3, borderRadius: radius.md, backgroundColor: colors.backgroundAlt },
  indicator: { position: 'absolute', top: 3, bottom: 3, left: 3, borderRadius: 10, backgroundColor: colors.surface, shadowColor: '#111114', shadowOpacity: 0.07, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  segment: { zIndex: 1, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  label: { color: colors.textSecondary, fontFamily: typography.semiBold, fontSize: 13 },
  selectedLabel: { color: colors.primary },
  pressed: { opacity: 0.62 },
});
