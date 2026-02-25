import React, { useMemo } from "react";
import { View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../styles/theme";
import { useData } from "../providers/DataProvider";

export default function MapScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const { restaurants } = useData();

  const defaultRegion = {
    latitude: -11.6647,
    longitude: 27.4794,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  };

  const mapRestaurants = useMemo(
    () =>
      restaurants
        .map((restaurant) => {
          const lat = Number(restaurant.latitude);
          const lng = Number(restaurant.longitude);
          return {
            restaurant,
            lat,
            lng,
            valid: Number.isFinite(lat) && Number.isFinite(lng),
          };
        })
        .filter((item) => item.valid),
    [restaurants]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={defaultRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {mapRestaurants.map(({ restaurant, lat, lng }) => (
          <Marker
            key={restaurant.id}
            coordinate={{ latitude: lat, longitude: lng }}
            title={restaurant.nom}
            description={restaurant.adresse}
          />
        ))}
      </MapView>

      <View
        style={{
          position: "absolute",
          top: spacing.xl,
          left: spacing.lg,
          right: spacing.lg,
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
        }}
      >
        <Text style={{ fontFamily: typography.bold, color: colors.text, fontSize: 18 }}>
          Carte des restaurants
        </Text>
        <Text style={{ fontFamily: typography.regular, color: colors.textLight, marginTop: 4 }}>
          {mapRestaurants.length} restaurant(s) avec coordonnees valides
        </Text>
      </View>
    </View>
  );
}
