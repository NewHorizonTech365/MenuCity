import React from "react";
import MapView, { Marker } from "react-native-maps";

type Props = { latitude: number; longitude: number; title: string; description: string; hasValidCoords: boolean };

export default function RestaurantLocationMap({ latitude, longitude, title, description, hasValidCoords }: Props) {
  return (
    <MapView style={{ width: "100%", height: 180 }} initialRegion={{ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }} scrollEnabled={false}>
      {hasValidCoords && <Marker coordinate={{ latitude, longitude }} title={title} description={description} />}
    </MapView>
  );
}
