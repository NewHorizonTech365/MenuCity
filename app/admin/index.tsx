// app/admin/index.tsx
import React, { useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { useTheme } from "../../styles/theme";
import { useData } from "../../providers/DataProvider";
import Icon from "../../components/Icon";
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeInRight,
  ZoomIn,
} from "react-native-reanimated";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { restaurants } = useData();
  const { colors, spacing, radius, typography } = useTheme();

  // Sécurité admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/home");
    }
  }, [isAuthenticated, router, user]);

  // -------------------------------------------
  // 📊 STATISTIQUES CALCULÉES
  // -------------------------------------------
  const stats = useMemo(() => {
    const totalRestaurants = restaurants.length;

    const dishes = restaurants.flatMap((r) => r.menu || []);
    const totalDishes = dishes.length;

    // Répartition des cuisines
    const cuisineMap: Record<string, number> = {};
    restaurants.forEach((r) => {
      const c = (r.cuisine || "Autre").toLowerCase();
      cuisineMap[c] = (cuisineMap[c] || 0) + 1;
    });

    const cuisineDistribution = Object.entries(cuisineMap)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / totalRestaurants) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Top restaurants
    const topRestaurants = [...restaurants]
      .sort((a, b) => (b.note || 0) - (a.note || 0))
      .slice(0, 5);

    // Menus les plus variés
    const mostVaried = [...restaurants]
      .map((r) => ({
        ...r,
        count: r.menu?.length || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Photos total
    const totalPhotos = restaurants.reduce(
      (sum, r) => sum + (r.photos?.length || 0),
      0
    );

    const restaurantsWithoutMenu = restaurants.filter(
      (r) => !r.menu || r.menu.length === 0
    ).length;

    const dishesWithoutImage = dishes.filter(
      (d) => !d.photosMenu || d.photosMenu.length === 0
    ).length;

    return {
      totalRestaurants,
      totalDishes,
      cuisineDistribution,
      topRestaurants,
      mostVaried,
      totalPhotos,
      restaurantsWithoutMenu,
      dishesWithoutImage,
    };
  }, [restaurants]);

  if (user === null) {
    return null;
  }

  // Sortir du mode admin
  const exitAdmin = () => {
    logout();
    router.replace("/home");
  };

  // -----------------------------------------------------------
  // 🧨 UI DASHBOARD COMPLET
  // -----------------------------------------------------------
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
    >
      {/* TITLE */}
      <Animated.Text
        entering={FadeInDown.duration(500)}
        style={{
          fontFamily: typography.bold,
          fontSize: 32,
          color: colors.text,
          marginTop: spacing.lg,
        }}
      >
        Tableau de Bord Admin
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(100)}
        style={{
          fontFamily: typography.regular,
          fontSize: 16,
          color: colors.textLight,
          marginBottom: spacing.xl,
        }}
      >
        Bienvenue {user?.nom}. Gère et surveille toute l’application.
      </Animated.Text>

      {/* ===================== PARTIE 1 : STATS GLOBALES ===================== */}
      <SectionTitle icon="stats-chart" title="Vue d’ensemble" />

      <Animated.View entering={FadeInUp} style={{ gap: spacing.md }}>
        <BigStat label="Restaurants" value={stats.totalRestaurants} color="#FF6A00" />
        <BigStat label="Plats" value={stats.totalDishes} color="#6A11CB" />
        <BigStat label="Photos" value={stats.totalPhotos} color="#38EF7D" />
      </Animated.View>

      <View style={{ height: spacing.xl }} />

      {/* ===================== PARTIE 2 : RÉPARTITION CUISINES ===================== */}
      <SectionTitle icon="pie-chart" title="Répartition des cuisines" />

      {stats.cuisineDistribution.map((c, idx) => (
        <Animated.View
          entering={FadeInRight.delay(idx * 80)}
          key={idx}
          style={{ marginBottom: spacing.md }}
        >
          <CuisineBar item={c} />
        </Animated.View>
      ))}

      <View style={{ height: spacing.xl }} />

      {/* ===================== PARTIE 3 : TOP RESTAURANTS ===================== */}
      <SectionTitle icon="trophy" title="Top Restaurants" />

      {stats.topRestaurants.map((r, idx) => (
        <Animated.View key={idx} entering={FadeInUp.delay(idx * 80)}>
          <TopRestaurantCard restaurant={r} rank={idx + 1} />
        </Animated.View>
      ))}

      <View style={{ height: spacing.xl }} />

      {/* ===================== PARTIE 4 : MENUS VARIÉS ===================== */}
      <SectionTitle icon="fast-food" title="Menus les plus variés" />

      {stats.mostVaried.map((r, idx) => (
        <Animated.View key={idx} entering={FadeInUp.delay(idx * 100)}>
          <VariedMenuCard restaurant={r} />
        </Animated.View>
      ))}

      <View style={{ height: spacing.xl }} />

      {/* ===================== PARTIE 5 : ALERTES ===================== */}
      <SectionTitle icon="alert-circle" title="Alertes importantes" />

      <AlertCard
        label="Restaurants sans menu"
        value={stats.restaurantsWithoutMenu}
        color="#FF4D4D"
      />

      <AlertCard
        label="Plats sans images"
        value={stats.dishesWithoutImage}
        color="#FF8800"
      />

      <View style={{ height: spacing.xl }} />

      {/* ===================== ACTIONS / NAVIGATION ===================== */}
      <SectionTitle icon="grid" title="Navigation rapide" />

      <AdminButton
        icon="restaurant"
        label="Gérer les restaurants"
        onPress={() => router.replace("/admin/restaurantsAdmin")}
      />

      <AdminButton
        icon="stats-chart"
        label="Statistiques avancées"
        onPress={() => router.push("/admin/stats")}
      />

      <View style={{ height: spacing.xxl }} />

      {/* Logout */}
      <AdminButton
        icon="lock-closed"
        label="Quitter le mode admin"
        color={colors.primary}
        textColor="#fff"
        onPress={exitAdmin}
      />
    </ScrollView>
  );
}

/* ============================================================================
    COMPONENTS SIMPLES & ÉLÉGANTS
============================================================================ */

function SectionTitle({ icon, title }: any) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.md,
      }}
    >
      <Icon name={icon} size={22} color={colors.text} />
      <Text
        style={{
          marginLeft: spacing.md,
          fontFamily: typography.bold,
          fontSize: 20,
          color: colors.text,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function BigStat({ value, label, color }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontFamily: typography.bold,
          fontSize: 34,
          color,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: typography.regular,
          color: colors.textLight,
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function CuisineBar({ item }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View>
      <Text
        style={{
          fontFamily: typography.semiBold,
          color: colors.text,
          fontSize: 15,
          marginBottom: 6,
        }}
      >
        {item.name} • {item.count} restaurants ({item.percent}%)
      </Text>

      <View
        style={{
          height: 10,
          backgroundColor: colors.border,
          borderRadius: radius.pill,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${item.percent}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );
}

function TopRestaurantCard({ restaurant, rank }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
      }}
    >
      <Text
        style={{
          fontFamily: typography.bold,
          fontSize: 16,
        }}
      >
        #{rank} — {restaurant.nom}
      </Text>
      <Text
        style={{
          fontFamily: typography.regular,
          color: colors.textLight,
        }}
      >
        Note : {restaurant.note}
      </Text>
    </View>
  );
}

function VariedMenuCard({ restaurant }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
      }}
    >
      <Text style={{ fontFamily: typography.bold, fontSize: 16 }}>
        {restaurant.nom}
      </Text>
      <Text
        style={{
          fontFamily: typography.regular,
          color: colors.textLight,
        }}
      >
        {restaurant.count} plats au menu
      </Text>
    </View>
  );
}

function AlertCard({ label, value, color }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
      }}
    >
      <Text style={{ fontFamily: typography.semiBold }}>{label}</Text>
      <Text
        style={{
          fontFamily: typography.bold,
          fontSize: 22,
          color,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function AdminButton({ label, icon, onPress, color, textColor }: any) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: color || colors.card,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.md,
      }}
    >
      <Icon name={icon} size={22} color={textColor || colors.text} />
      <Text
        style={{
          marginLeft: spacing.md,
          fontFamily: typography.semiBold,
          color: textColor || colors.text,
          fontSize: 16,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
