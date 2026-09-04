import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../styles/theme';

interface BrandMarkProps {
  variant?: 'mark' | 'full';
  size?: number;
}

export default function BrandMark({ variant = 'full', size = 46 }: BrandMarkProps) {
  return (
    <View accessibilityRole="image" accessibilityLabel="MenuCity" style={styles.row}>
      <View style={[styles.mark, { width: size, height: size, borderRadius: Math.max(radius.md, size * 0.25) }]}>
        <Image
          source={require('../../assets/images/menu-city-logo.png')}
          resizeMode="contain"
          style={styles.image}
        />
      </View>
      {variant === 'full' ? <Text style={styles.wordmark}>MenuCity</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  mark: { overflow: 'hidden', backgroundColor: '#FBF1E5' },
  image: { width: '100%', height: '100%' },
  wordmark: { color: colors.text, fontFamily: typography.bold, fontSize: 21, letterSpacing: -0.4 },
});
