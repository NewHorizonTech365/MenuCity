import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../styles/theme';
import AppButton from './AppButton';

interface StateViewProps {
  title: string;
  message?: string;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export default function StateView({
  title,
  message,
  loading = false,
  icon = 'restaurant-outline',
  actionLabel,
  onAction,
  compact = false,
}: StateViewProps) {
  return (
    <View style={[styles.container, compact && styles.compact]} accessibilityLiveRegion="polite">
      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <View style={styles.iconBox}><Ionicons name={icon} size={28} color={colors.primary} /></View>
      )}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} variant="secondary" compact /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  compact: { paddingVertical: spacing.lg },
  iconBox: { width: 58, height: 58, borderRadius: radius.lg, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 18, textAlign: 'center' },
  message: { maxWidth: 360, color: colors.textSecondary, fontFamily: typography.regular, lineHeight: 21, textAlign: 'center' },
});
