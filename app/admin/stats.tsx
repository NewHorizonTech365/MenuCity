import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../../components/ui/AppHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import StateView from '../../components/ui/StateView';
import { useAuth } from '../../providers/AuthProvider';
import { useData } from '../../providers/DataProvider';
import { colors, layout, radius, spacing, typography } from '../../styles/theme';

const summaryEntering = FadeInUp.duration(220).reduceMotion(ReduceMotion.System);
const rankingAnimations = [0, 1, 2, 3, 4, 5].map((index) => FadeInUp.duration(190).delay(index * 32).reduceMotion(ReduceMotion.System));

export default function AdminStatsScreen() {
  const router = useRouter();
  const { isAuthReady, user } = useAuth();
  const { restaurants } = useData();

  useEffect(() => {
    if (isAuthReady && user?.role !== 'admin') router.replace('/home');
  }, [isAuthReady, router, user?.role]);

  const stats = useMemo(() => {
    const ranked = [...restaurants].sort((a, b) => b.note - a.note);
    return { menuItems: restaurants.reduce((sum, restaurant) => sum + (restaurant.menu?.length || 0), 0), ranked };
  }, [restaurants]);

  if (!isAuthReady || user?.role !== 'admin') return <SafeAreaView style={styles.safe}><StateView title="Vérification de l’accès…" loading /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <AppHeader title="Statistiques" subtitle="Lecture synthétique du catalogue local." onBack={() => router.replace('/admin')} />
          <Animated.View entering={summaryEntering} style={styles.summary}>
            <View style={styles.summaryItem}><Text style={styles.summaryValue}>{restaurants.length}</Text><Text style={styles.summaryLabel}>Restaurants</Text></View>
            <View style={styles.verticalDivider} />
            <View style={styles.summaryItem}><Text style={styles.summaryValue}>{stats.menuItems}</Text><Text style={styles.summaryLabel}>Plats</Text></View>
            <View style={styles.verticalDivider} />
            <View style={styles.summaryItem}><Text style={styles.summaryValue}>{restaurants.length ? (restaurants.reduce((sum, restaurant) => sum + restaurant.note, 0) / restaurants.length).toFixed(1) : '—'}</Text><Text style={styles.summaryLabel}>Note moyenne</Text></View>
          </Animated.View>
          <View style={styles.section}>
            <SectionHeader title="Classement par note" />
            <View style={styles.ranking}>
              {stats.ranked.map((restaurant, index) => {
                const width = `${Math.max(0, Math.min(100, restaurant.note / 5 * 100))}%` as `${number}%`;
                return <Animated.View key={restaurant.id} entering={rankingAnimations[Math.min(index, 5)]} style={[styles.rankRow, index < stats.ranked.length - 1 && styles.divider]}><View style={styles.rankTop}><Text style={styles.rankName}>{index + 1}. {restaurant.nom}</Text><Text style={styles.rankScore}>{restaurant.note.toFixed(1)}/5</Text></View><View style={styles.track}><View style={[styles.fill, { width }]} /></View></Animated.View>;
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: layout.screenPadding, gap: spacing.lg },
  summary: { flexDirection: 'row', alignItems: 'stretch', paddingVertical: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  summaryItem: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs },
  summaryValue: { color: colors.primary, fontFamily: typography.bold, fontSize: 24 },
  summaryLabel: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11, textAlign: 'center', marginTop: 4 },
  verticalDivider: { width: 1, backgroundColor: colors.border },
  section: { gap: spacing.md },
  ranking: { paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  rankRow: { paddingVertical: spacing.md, gap: spacing.xs },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rankTop: { flexDirection: 'row', gap: spacing.sm },
  rankName: { flex: 1, color: colors.text, fontFamily: typography.semiBold, fontSize: 13 },
  rankScore: { color: colors.primary, fontFamily: typography.bold, fontSize: 12 },
  track: { height: 7, overflow: 'hidden', borderRadius: radius.pill, backgroundColor: colors.backgroundAlt },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
});
