import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, typeScale } from '../../styles/theme';
import PressableScale from './PressableScale';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, onBack, action }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Revenir en arrière"
          haptic="selection"
          onPress={onBack}
          hitSlop={6}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  title: { color: colors.text, fontFamily: typography.bold, ...typeScale.h2 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.regular, marginTop: 2, lineHeight: 19 },
  action: { marginLeft: 'auto' },
});
