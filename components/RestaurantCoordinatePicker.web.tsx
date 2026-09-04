import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../styles/theme';

interface RestaurantCoordinatePickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (latitude: number, longitude: number) => void;
}

export default function RestaurantCoordinatePicker({ latitude, longitude, onChange }: RestaurantCoordinatePickerProps) {
  const update = (key: 'latitude' | 'longitude', value: string) => {
    const parsed = Number(value.replace(',', '.'));
    if (!Number.isFinite(parsed)) return;
    onChange(key === 'latitude' ? parsed : latitude ?? -11.6647, key === 'longitude' ? parsed : longitude ?? 27.4794);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Renseignez les coordonnées du repère. Le placement visuel sera disponible dans l’application Android.</Text>
      <View style={styles.row}>
        <TextInput accessibilityLabel="Latitude" defaultValue={latitude === undefined ? '' : String(latitude)} keyboardType="numbers-and-punctuation" onEndEditing={(event) => update('latitude', event.nativeEvent.text)} placeholder="Latitude" placeholderTextColor={colors.textMuted} style={styles.input} />
        <TextInput accessibilityLabel="Longitude" defaultValue={longitude === undefined ? '' : String(longitude)} keyboardType="numbers-and-punctuation" onEndEditing={(event) => update('longitude', event.nativeEvent.text)} placeholder="Longitude" placeholderTextColor={colors.textMuted} style={styles.input} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  hint: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11, lineHeight: 16 },
  row: { flexDirection: 'row', gap: spacing.sm },
  input: { flex: 1, minHeight: 48, paddingHorizontal: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, fontFamily: typography.regular },
});
