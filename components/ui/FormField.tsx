import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '../../styles/theme';
import PressableScale from './PressableScale';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

export default function FormField({ label, error, hint, secureTextEntry, style, ...props }: FormFieldProps) {
  const [visible, setVisible] = useState(false);
  const isSecret = Boolean(secureTextEntry);
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error && styles.fieldError]}>
        <TextInput
          {...props}
          accessibilityLabel={props.accessibilityLabel || label}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isSecret && !visible}
          showSoftInputOnFocus
          style={[styles.input, style]}
        />
        {isSecret ? (
          <PressableScale accessibilityRole="button" accessibilityLabel={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} haptic="selection" hitSlop={8} onPress={() => setVisible((value) => !value)} style={styles.eye}>
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
          </PressableScale>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 7 },
  label: { color: colors.text, fontFamily: typography.semiBold, fontSize: 13 },
  field: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md },
  fieldError: { borderColor: colors.error },
  input: { flex: 1, minHeight: 52, color: colors.text, fontFamily: typography.regular, fontSize: 15, paddingVertical: 0 },
  eye: { width: 40, height: 46, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 12 },
  hint: { color: colors.textMuted, fontFamily: typography.regular, fontSize: 12, lineHeight: 17 },
});
