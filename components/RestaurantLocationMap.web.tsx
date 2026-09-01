import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

type Props = { latitude: number; longitude: number; title: string; description: string; hasValidCoords: boolean };

export default function RestaurantLocationMap({ latitude, longitude, title, description, hasValidCoords }: Props) {
  const url = hasValidCoords ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}` : `https://www.openstreetmap.org/search?query=${encodeURIComponent(description)}`;
  return (
    <View style={{ width: "100%", height: 180, backgroundColor: "#e7e5e4", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Text style={{ color: "#292524", fontWeight: "700", textAlign: "center" }}>{title}</Text>
      <Text style={{ color: "#57534e", marginTop: 6, textAlign: "center" }}>{description}</Text>
      <TouchableOpacity onPress={() => void Linking.openURL(url)} style={{ marginTop: 14, backgroundColor: "#ea580c", borderRadius: 999, paddingHorizontal: 18, paddingVertical: 9 }}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>Ouvrir la carte</Text>
      </TouchableOpacity>
    </View>
  );
}
