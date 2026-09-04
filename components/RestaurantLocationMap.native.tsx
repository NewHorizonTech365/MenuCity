import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { colors } from '../styles/theme';

type Props = { latitude: number; longitude: number; title: string; description: string; hasValidCoords: boolean };

export default function RestaurantLocationMap({ latitude, longitude, title, description, hasValidCoords }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{ latitude, longitude, latitudeDelta: 0.035, longitudeDelta: 0.035 }}
      loadingEnabled
      loadingBackgroundColor={colors.backgroundAlt}
      loadingIndicatorColor={colors.primary}
      pitchEnabled={false}
      rotateEnabled={false}
      scrollEnabled={false}
      toolbarEnabled={false}
      zoomEnabled={false}
    >
      {hasValidCoords ? <Marker coordinate={{ latitude, longitude }} pinColor={colors.primary} title={title} description={description} /> : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: 196 },
});
