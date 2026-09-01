import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../styles/theme';

interface OfflineBannerProps { visible: boolean }

export default function OfflineBanner({ visible }: OfflineBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.banner} accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline-outline" size={18} color={colors.warning} />
      <Text style={styles.text}>Mode hors ligne : le dernier catalogue disponible est affiché.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E9D29E',
    backgroundColor: '#FFF6DC',
  },
  text: { flex: 1, color: colors.warning, fontFamily: typography.semiBold, fontSize: 12, lineHeight: 17 },
});
