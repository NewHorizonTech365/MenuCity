import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../styles/theme';
import PressableScale from './PressableScale';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const palette: Record<ButtonVariant, { background: string; border: string; foreground: string }> = {
  primary: { background: colors.primary, border: colors.primary, foreground: colors.white },
  secondary: { background: colors.primarySoft, border: colors.primarySoft, foreground: colors.primaryDark },
  ghost: { background: 'transparent', border: colors.border, foreground: colors.text },
  danger: { background: colors.error, border: colors.error, foreground: colors.white },
};

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  compact = false,
  style,
  accessibilityLabel,
}: AppButtonProps) {
  const tone = palette[variant];
  const unavailable = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      haptic={variant === 'primary' ? 'soft' : 'selection'}
      onPress={onPress}
      style={[
        styles.button,
        compact && styles.compact,
        { backgroundColor: tone.background, borderColor: tone.border },
        unavailable && styles.disabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={tone.foreground} /> : icon}
      <Text style={[styles.label, { color: tone.foreground }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  compact: { minHeight: 42, paddingHorizontal: spacing.md },
  label: { fontFamily: typography.semiBold, fontSize: 15 },
  disabled: { opacity: 0.48 },
});
