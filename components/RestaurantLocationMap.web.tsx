import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../styles/theme';

type Props = { latitude: number; longitude: number; title: string; description: string; hasValidCoords: boolean };

export default function RestaurantLocationMap({ latitude, longitude, title, description, hasValidCoords }: Props) {
  const url = hasValidCoords ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}` : `https://www.openstreetmap.org/search?query=${encodeURIComponent(description)}`;
  return (
    <View style={styles.map}>
      <View style={styles.pin}><Ionicons name="location" size={24} color={colors.primary} /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>
      <Pressable onPress={() => void Linking.openURL(url)} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>Voir sur la carte</Text>
        <Ionicons name="open-outline" size={16} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: 196, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.backgroundAlt },
  pin: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 14, textAlign: 'center', marginTop: spacing.xs },
  description: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, textAlign: 'center', marginTop: 3 },
  button: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, paddingHorizontal: 15, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.primary },
  buttonText: { color: colors.white, fontFamily: typography.semiBold, fontSize: 12 },
  pressed: { opacity: 0.75 },
});
