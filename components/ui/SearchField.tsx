import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../styles/theme';
import PressableScale from './PressableScale';

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchField({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Restaurant, cuisine ou spécialité',
  autoFocus = false,
}: SearchFieldProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.field}>
      <PressableScale accessibilityRole="button" accessibilityLabel="Activer la recherche" onPress={() => inputRef.current?.focus()} style={styles.searchIcon}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
      </PressableScale>
      <TextInput
        ref={inputRef}
        accessibilityLabel="Rechercher un restaurant"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCorrect={false}
        autoFocus={autoFocus}
        showSoftInputOnFocus
        style={styles.input}
      />
      {value ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          haptic="selection"
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={styles.clear}
        >
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </PressableScale>
      ) : null}
      {onSubmit ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Lancer la recherche"
          haptic="soft"
          onPress={onSubmit}
          style={styles.submit}
        >
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchIcon: { width: 28, height: 40, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, color: colors.text, fontFamily: typography.regular, fontSize: 14, paddingVertical: 0 },
  clear: { width: 32, height: 40, alignItems: 'center', justifyContent: 'center' },
  submit: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
});
