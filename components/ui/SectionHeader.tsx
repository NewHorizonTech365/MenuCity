import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../styles/theme';

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, eyebrow, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  copy: { flex: 1 },
  eyebrow: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 20, lineHeight: 26 },
  action: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 14 },
});
