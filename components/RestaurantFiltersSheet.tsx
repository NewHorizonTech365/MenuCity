import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../styles/theme';
import SimpleBottomSheet from './BottomSheet';
import AppButton from './ui/AppButton';
import Chip from './ui/Chip';

export type BudgetFilter = 'all' | 'economical' | 'standard' | 'premium';

export interface RestaurantFilters {
  openNow: boolean;
  nearMe: boolean;
  budget: BudgetFilter;
  quartier: string;
}

interface RestaurantFiltersSheetProps {
  visible: boolean;
  filters: RestaurantFilters;
  quartiers: string[];
  resultCount: number;
  isLocating: boolean;
  onChange: (filters: RestaurantFilters) => void;
  onEnableNearby: () => Promise<boolean>;
  onClose: () => void;
}

const budgets: { key: BudgetFilter; label: string }[] = [
  { key: 'all', label: 'Tous les budgets' },
  { key: 'economical', label: 'Jusqu’à 15 USD' },
  { key: 'standard', label: '15 à 25 USD' },
  { key: 'premium', label: '25 USD et plus' },
];

export default function RestaurantFiltersSheet({
  visible,
  filters,
  quartiers,
  resultCount,
  isLocating,
  onChange,
  onEnableNearby,
  onClose,
}: RestaurantFiltersSheetProps) {
  const toggleNearby = async (enabled: boolean) => {
    if (!enabled) {
      onChange({ ...filters, nearMe: false });
      return;
    }
    const available = await onEnableNearby();
    if (available) onChange({ ...filters, nearMe: true });
  };

  const reset = () => onChange({ openNow: false, nearMe: false, budget: 'all', quartier: 'Tous' });

  return (
    <SimpleBottomSheet isVisible={visible} onClose={onClose} closeAccessibilityLabel="Fermer les filtres">
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Affiner la recherche</Text>
          <Text style={styles.title}>Filtres</Text>
        </View>
        <AppButton label="Réinitialiser" compact variant="ghost" onPress={reset} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.toggleCard}>
          <View style={styles.toggleIcon}><Ionicons name="time-outline" size={21} color={colors.primary} /></View>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleTitle}>Ouvert maintenant</Text>
            <Text style={styles.toggleText}>Masquer les restaurants actuellement fermés.</Text>
          </View>
          <Switch
            accessibilityLabel="Afficher uniquement les restaurants ouverts"
            value={filters.openNow}
            onValueChange={(openNow) => onChange({ ...filters, openNow })}
            trackColor={{ false: colors.borderStrong, true: colors.primaryLight }}
            thumbColor={filters.openNow ? colors.primary : colors.surface}
          />
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleIcon}><Ionicons name="navigate-outline" size={21} color={colors.primary} /></View>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleTitle}>À proximité</Text>
            <Text style={styles.toggleText}>{isLocating ? 'Recherche de votre position…' : 'Adresses situées à moins de 8 km.'}</Text>
          </View>
          <Switch
            accessibilityLabel="Afficher les restaurants à proximité"
            disabled={isLocating}
            value={filters.nearMe}
            onValueChange={(enabled) => void toggleNearby(enabled)}
            trackColor={{ false: colors.borderStrong, true: colors.primaryLight }}
            thumbColor={filters.nearMe ? colors.primary : colors.surface}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Budget moyen</Text>
          <View style={styles.wrap}>
            {budgets.map((budget) => (
              <Chip key={budget.key} label={budget.label} selected={filters.budget === budget.key} onPress={() => onChange({ ...filters, budget: budget.key })} />
            ))}
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Quartier ou zone</Text>
          <View style={styles.wrap}>
            {['Tous', ...quartiers].map((quartier) => (
              <Chip key={quartier} label={quartier} selected={filters.quartier === quartier} onPress={() => onChange({ ...filters, quartier })} />
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <AppButton label={`Afficher ${resultCount} adresse${resultCount > 1 ? 's' : ''}`} onPress={onClose} />
      </View>
    </SimpleBottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  scroll: { flex: 1 },
  eyebrow: { color: colors.primary, fontFamily: typography.semiBold, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase' },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 24, marginTop: 2 },
  content: { padding: spacing.lg, gap: spacing.lg },
  toggleCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  toggleIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  toggleCopy: { flex: 1 },
  toggleTitle: { color: colors.text, fontFamily: typography.semiBold, fontSize: 14 },
  toggleText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11, lineHeight: 16, marginTop: 2 },
  group: { gap: spacing.sm },
  groupTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 15 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
});
