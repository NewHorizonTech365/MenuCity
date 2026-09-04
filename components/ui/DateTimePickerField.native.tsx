import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../../styles/theme';
import AppButton from './AppButton';
import PressableScale from './PressableScale';

interface DateTimePickerFieldProps {
  label: string;
  mode: 'date' | 'time';
  value: Date;
  onChange: (value: Date) => void;
  minimumDate?: Date;
  disabled?: boolean;
}

const formatValue = (value: Date, mode: 'date' | 'time') => mode === 'date'
  ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(value)
  : new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(value);

export default function DateTimePickerField({ label, mode, value, onChange, minimumDate, disabled = false }: DateTimePickerFieldProps) {
  const [iosPickerVisible, setIosPickerVisible] = useState(false);
  const [draftValue, setDraftValue] = useState(value);

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode,
        is24Hour: true,
        minimumDate: mode === 'date' ? minimumDate : undefined,
        onChange: (event: DateTimePickerEvent, selectedValue?: Date) => {
          if (event.type === 'set' && selectedValue) onChange(selectedValue);
        },
      });
      return;
    }

    setDraftValue(value);
    setIosPickerVisible(true);
  };

  const confirmIosValue = () => {
    onChange(draftValue);
    setIosPickerVisible(false);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Choisir ${label.toLowerCase()}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        haptic="selection"
        onPress={openPicker}
        style={[styles.control, disabled && styles.disabled]}
      >
        <View style={styles.icon}><Ionicons name={mode === 'date' ? 'calendar-outline' : 'time-outline'} size={19} color={colors.primary} /></View>
        <Text style={styles.value}>{formatValue(value, mode)}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </PressableScale>

      {Platform.OS === 'ios' ? (
        <Modal visible={iosPickerVisible} transparent statusBarTranslucent animationType="fade" onRequestClose={() => setIosPickerVisible(false)}>
          <View style={styles.modalRoot}>
            <Pressable accessibilityRole="button" accessibilityLabel="Fermer le sélecteur" onPress={() => setIosPickerVisible(false)} style={styles.backdrop} />
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>{label}</Text>
              <DateTimePicker
                value={draftValue}
                mode={mode}
                display="spinner"
                locale="fr-FR"
                minimumDate={mode === 'date' ? minimumDate : undefined}
                onChange={(_event, selectedValue) => {
                  if (selectedValue) setDraftValue(selectedValue);
                }}
              />
              <AppButton label="Confirmer" onPress={confirmIosValue} />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { color: colors.text, fontFamily: typography.semiBold, fontSize: 13 },
  control: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  icon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  value: { flex: 1, color: colors.text, fontFamily: typography.semiBold, fontSize: 14 },
  disabled: { opacity: 0.5 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  sheet: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, backgroundColor: colors.surface, ...shadows.raised },
  handle: { width: 42, height: 5, alignSelf: 'center', borderRadius: radius.pill, backgroundColor: colors.borderStrong },
  sheetTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 19, textAlign: 'center' },
});
