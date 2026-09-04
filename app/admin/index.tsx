import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '../../components/ui/AppButton';
import AppHeader from '../../components/ui/AppHeader';
import PressableScale from '../../components/ui/PressableScale';
import SectionHeader from '../../components/ui/SectionHeader';
import StateView from '../../components/ui/StateView';
import { useAuth } from '../../providers/AuthProvider';
import { useData } from '../../providers/DataProvider';
import { colors, layout, radius, spacing, typography } from '../../styles/theme';

interface MetricCardProps { icon: keyof typeof Ionicons.glyphMap; label: string; value: number; index: number; tone?: 'primary' | 'success' | 'warning' }

function MetricCard({ icon, label, value, index, tone = 'primary' }: MetricCardProps) {
  const color = tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : colors.primary;
  return (
    <Animated.View entering={FadeInUp.duration(200).delay(index * 35).reduceMotion(ReduceMotion.System)} style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}16` }]}><Ionicons name={icon} size={21} color={color} /></View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthReady, isAuthenticated, isDevelopmentSession } = useAuth();
  const { restaurants } = useData();
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/profile');

  useEffect(() => {
    if (isAuthReady && (!isAuthenticated || user?.role !== 'admin')) router.replace('/home');
  }, [isAuthReady, isAuthenticated, router, user?.role]);

  const stats = useMemo(() => {
    const menuItems = restaurants.flatMap((restaurant) => restaurant.menu || []);
    const cuisines = new Map<string, number>();
    restaurants.forEach((restaurant) => cuisines.set(restaurant.cuisine || 'Autre', (cuisines.get(restaurant.cuisine || 'Autre') || 0) + 1));
    return {
      restaurants: restaurants.length,
      dishes: menuItems.length,
      photos: restaurants.reduce((total, restaurant) => total + restaurant.photos.length, 0),
      withoutMenu: restaurants.filter((restaurant) => !restaurant.menu?.length).length,
      cuisines: [...cuisines.entries()].sort((left, right) => right[1] - left[1]).slice(0, 5),
    };
  }, [restaurants]);

  if (!isAuthReady || !user || user.role !== 'admin') {
    return <SafeAreaView style={styles.safe}><StateView title="Vérification de l’accès…" loading /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Animated.View entering={FadeInUp.duration(200).reduceMotion(ReduceMotion.System)}><AppHeader title="Administration" subtitle={`Bonjour ${user.nom}. Pilotez le catalogue MenuCity.`} onBack={goBack} /></Animated.View>
          {isDevelopmentSession ? (
            <Animated.View entering={FadeInUp.duration(210).delay(35).reduceMotion(ReduceMotion.System)} style={styles.devBanner}>
              <Ionicons name="construct-outline" size={21} color={colors.warning} />
              <View style={styles.devCopy}><Text style={styles.devTitle}>Administration locale de développement</Text><Text style={styles.devText}>Les changements servent aux tests Expo Go et ne modifient ni Neon ni Cloudflare.</Text></View>
            </Animated.View>
          ) : null}

          <View style={styles.section}><SectionHeader eyebrow="Vue d’ensemble" title="Le catalogue en un coup d’œil" /><View style={styles.metrics}>
            <MetricCard icon="restaurant-outline" label="Restaurants" value={stats.restaurants} index={0} />
            <MetricCard icon="fast-food-outline" label="Plats" value={stats.dishes} index={1} tone="success" />
            <MetricCard icon="images-outline" label="Photos" value={stats.photos} index={2} />
            <MetricCard icon="alert-circle-outline" label="Sans menu" value={stats.withoutMenu} index={3} tone="warning" />
          </View></View>

          <View style={styles.section}>
            <SectionHeader title="Actions rapides" />
            <PressableScale accessibilityRole="button" accessibilityLabel="Gérer les restaurants" haptic="selection" onPress={() => router.push('/admin/restaurantsAdmin')} style={styles.actionCard}>
              <View style={styles.actionIcon}><Ionicons name="restaurant-outline" size={23} color={colors.primary} /></View>
              <View style={styles.actionCopy}><Text style={styles.actionTitle}>Gérer les restaurants</Text><Text style={styles.actionText}>Créer, modifier, archiver et gérer les menus.</Text></View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </PressableScale>
            <PressableScale accessibilityRole="button" accessibilityLabel="Consulter les statistiques" haptic="selection" onPress={() => router.push('/admin/stats')} style={styles.actionCard}>
              <View style={styles.actionIcon}><Ionicons name="stats-chart-outline" size={23} color={colors.primary} /></View>
              <View style={styles.actionCopy}><Text style={styles.actionTitle}>Consulter les statistiques</Text><Text style={styles.actionText}>Notes, menus et répartition du catalogue.</Text></View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </PressableScale>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Cuisines représentées" />
            <View style={styles.cuisineCard}>
              {stats.cuisines.length ? stats.cuisines.map(([name, count], index) => {
                const percent = stats.restaurants ? Math.round((count / stats.restaurants) * 100) : 0;
                return <View key={name} style={[styles.cuisineRow, index < stats.cuisines.length - 1 && styles.divider]}><View style={styles.cuisineCopy}><Text style={styles.cuisineName}>{name}</Text><Text style={styles.cuisineCount}>{count} restaurant{count > 1 ? 's' : ''}</Text></View><Text style={styles.percent}>{percent}%</Text></View>;
              }) : <Text style={styles.emptyText}>Aucune donnée disponible.</Text>}
            </View>
          </View>

          <AppButton label="Quitter l’administration" variant="ghost" icon={<Ionicons name="exit-outline" size={19} color={colors.text} />} onPress={() => router.replace('/home')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
  page: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.screenPadding, gap: spacing.lg },
  devBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: '#E9D29E', backgroundColor: '#FFF6DC' },
  devCopy: { flex: 1 },
  devTitle: { color: colors.warning, fontFamily: typography.bold, fontSize: 14 },
  devText: { color: '#805A14', fontFamily: typography.regular, fontSize: 12, lineHeight: 18, marginTop: 3 },
  section: { gap: spacing.md },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: { minWidth: 145, flexGrow: 1, flexBasis: '46%', padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  metricIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  metricValue: { fontFamily: typography.bold, fontSize: 28, marginTop: spacing.sm },
  metricLabel: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, marginTop: 2 },
  actionCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  actionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  actionCopy: { flex: 1 },
  actionTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 15 },
  actionText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 17, marginTop: 3 },
  cuisineCard: { paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  cuisineRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center' },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  cuisineCopy: { flex: 1 },
  cuisineName: { color: colors.text, fontFamily: typography.semiBold, fontSize: 14, textTransform: 'capitalize' },
  cuisineCount: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11, marginTop: 2 },
  percent: { color: colors.primary, fontFamily: typography.bold, fontSize: 14 },
  emptyText: { color: colors.textSecondary, fontFamily: typography.regular, paddingVertical: spacing.lg, textAlign: 'center' },
});
