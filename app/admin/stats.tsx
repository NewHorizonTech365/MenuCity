// app/admin/statistiques.tsx
import React, { useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { useData } from "../../providers/DataProvider";
import { useTheme } from "../../styles/theme";
import Icon from "../../components/Icon";
import Animated, { FadeInUp, FadeInRight } from "react-native-reanimated";

export default function AdminStatsScreen() {
  const router = useRouter();
  const { isAuthReady, user } = useAuth();
  const { restaurants } = useData();
  const { colors, spacing, radius, typography } = useTheme();

  // Securite : acces admin uniquement
  useEffect(() => {
    if (!isAuthReady) return;
    if (!user || user.role !== "admin") {
      router.replace("/home");
    }
  }, [isAuthReady, router, user]);

  const stats = useMemo(() => {
    const totalRestaurants = restaurants.length;

    const totalMenus = restaurants.reduce(
      (sum, r) => sum + (r.menu?.length || 0),
      0
    );

    const prixMoyens = restaurants
      .map((r) => parseFloat(r.prixMoyen) || 0)
      .filter((x) => x > 0);

    const prixMoyenGlobal =
      prixMoyens.length > 0
        ? (prixMoyens.reduce((a, b) => a + b, 0) / prixMoyens.length).toFixed(2)
        : "-";

    const restaurantsParNote = [...restaurants].sort(
      (a, b) => (b.note || 0) - (a.note || 0)
    );

    const meilleur = restaurantsParNote[0] || null;
    const pire = restaurantsParNote[restaurantsParNote.length - 1] || null;

    return {
      totalRestaurants,
      totalMenus,
      prixMoyenGlobal,
      meilleur,
      pire,
    };
  }, [restaurants]);

  if (!isAuthReady || !user) {
    return null;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.xl }}>
        <TouchableOpacity onPress={() => router.replace("/admin")}>
          <Icon name="arrow-back" size={22} color={colors.textLight} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: typography.bold,
            fontSize: 26,
            color: colors.text,
          }}
        >
          Statistiques avancees
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <SectionTitle icon="stats-chart" title="Indicateurs cles" />

      <Animated.View entering={FadeInUp.delay(100)}>
        <StatCard label="Nombre total de restaurants" value={stats.totalRestaurants} color="#ff6b6b" />
        <StatCard label="Nombre total de plats" value={stats.totalMenus} color="#4dabf7" />
        <StatCard label="Prix moyen global" value={`${stats.prixMoyenGlobal} $`} color="#51cf66" />
      </Animated.View>

      <View style={{ height: spacing.xl }} />

      <SectionTitle icon="trophy" title="Meilleur restaurant" />
      {stats.meilleur ? (
        <Animated.View entering={FadeInRight.delay(100)}>
          <HighlightCard
            title={stats.meilleur.nom}
            subtitle={`Note : ${stats.meilleur.note}`}
            color="#ffd43b"
          />
        </Animated.View>
      ) : null}

      <View style={{ height: spacing.xl }} />

      <SectionTitle icon="sad" title="Restaurant le moins note" />
      {stats.pire ? (
        <Animated.View entering={FadeInRight.delay(200)}>
          <HighlightCard
            title={stats.pire.nom}
            subtitle={`Note : ${stats.pire.note}`}
            color="#ff8787"
          />
        </Animated.View>
      ) : null}

      <View style={{ height: spacing.xl }} />

      <SectionTitle icon="bar-chart" title="Distribution des notes" />

      {restaurants.map((r, idx) => (
        <Animated.View
          key={idx}
          entering={FadeInUp.delay(idx * 60)}
          style={{ marginBottom: spacing.md }}
        >
          <ScoreBar restaurant={r} />
        </Animated.View>
      ))}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

function SectionTitle({ icon, title }: any) {
  const { typography, spacing, colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.lg }}>
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

function StatCard({ label, value, color }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
      }}
    >
      <Text style={{ fontFamily: typography.regular, color: colors.textLight }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: typography.bold,
          fontSize: 28,
          marginTop: 4,
          color,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function HighlightCard({ title, subtitle, color }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        padding: spacing.lg,
        borderRadius: radius.xl,
        borderWidth: 2,
        borderColor: color,
      }}
    >
      <Text style={{ fontFamily: typography.bold, fontSize: 20, marginBottom: 6 }}>
        {title}
      </Text>
      <Text style={{ fontFamily: typography.regular, color: colors.textLight }}>
        {subtitle}
      </Text>
    </View>
  );
}

function ScoreBar({ restaurant }: any) {
  const { colors, radius, typography } = useTheme();
  const note = restaurant.note || 0;
  const width = Math.min((note / 5) * 100, 100);

  return (
    <View>
      <Text
        style={{
          fontFamily: typography.semiBold,
          color: colors.text,
          marginBottom: 4,
        }}
      >
        {restaurant.nom} - {note}/5
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
            width: `${width}%`,
            backgroundColor: note >= 4 ? "#51cf66" : note >= 3 ? "#fcc419" : "#ff6b6b",
          }}
        />
      </View>
    </View>
  );
}
