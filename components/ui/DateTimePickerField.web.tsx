import { Ionicons } from '@expo/vector-icons';
import type { ChangeEvent, CSSProperties } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../styles/theme';

interface DateTimePickerFieldProps {
  label: string;
  mode: 'date' | 'time';
  value: Date;
  onChange: (value: Date) => void;
  minimumDate?: Date;
  disabled?: boolean;
}

const pad = (value: number) => String(value).padStart(2, '0');
const toDateValue = (value: Date) => `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
const toTimeValue = (value: Date) => `${pad(value.getHours())}:${pad(value.getMinutes())}`;

export default function DateTimePickerField({ label, mode, value, onChange, minimumDate, disabled = false }: DateTimePickerFieldProps) {
  const updateValue = (event: ChangeEvent<HTMLInputElement>) => {
    const next = new Date(value);
    if (mode === 'date') {
      const [year, month, day] = event.target.value.split('-').map(Number);
      if (year && month && day) next.setFullYear(year, month - 1, day);
    } else {
      const [hour, minute] = event.target.value.split(':').map(Number);
      if (Number.isFinite(hour) && Number.isFinite(minute)) next.setHours(hour, minute, 0, 0);
    }
    onChange(next);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.control, disabled && styles.disabled]}>
        <View style={styles.icon}><Ionicons name={mode === 'date' ? 'calendar-outline' : 'time-outline'} size={19} color={colors.primary} /></View>
        <input
          aria-label={`Choisir ${label.toLowerCase()}`}
          disabled={disabled}
          min={mode === 'date' && minimumDate ? toDateValue(minimumDate) : undefined}
          onChange={updateValue}
          style={inputStyle}
          type={mode}
          value={mode === 'date' ? toDateValue(value) : toTimeValue(value)}
        />
      </View>
    </View>
  );
}

const inputStyle: CSSProperties = {
  minWidth: 0,
  flex: 1,
  height: 50,
  border: 0,
  outline: 'none',
  background: 'transparent',
  color: colors.text,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 14,
  fontWeight: 600,
};

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { color: colors.text, fontFamily: typography.semiBold, fontSize: 13 },
  control: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  icon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  disabled: { opacity: 0.5 },
});
