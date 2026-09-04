import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type LatLng, type MapPressEvent, type MarkerDragStartEndEvent } from 'react-native-maps';

import { colors, radius, spacing, typography } from '../styles/theme';

interface RestaurantCoordinatePickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (latitude: number, longitude: number) => void;
}

const defaultRegion = { latitude: -11.6647, longitude: 27.4794, latitudeDelta: 0.11, longitudeDelta: 0.11 };

export default function RestaurantCoordinatePicker({ latitude, longitude, onChange }: RestaurantCoordinatePickerProps) {
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const select = ({ latitude: nextLatitude, longitude: nextLongitude }: LatLng) => onChange(nextLatitude, nextLongitude);
  const handleMapPress = (event: MapPressEvent) => select(event.nativeEvent.coordinate);
  const handleMarkerDragEnd = (event: MarkerDragStartEndEvent) => select(event.nativeEvent.coordinate);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={hasCoordinates ? { latitude: latitude!, longitude: longitude!, latitudeDelta: 0.045, longitudeDelta: 0.045 } : defaultRegion} onPress={handleMapPress} toolbarEnabled={false}>
        {hasCoordinates ? <Marker draggable coordinate={{ latitude: latitude!, longitude: longitude! }} pinColor={colors.primary} onDragEnd={handleMarkerDragEnd} /> : null}
      </MapView>
      <Text style={styles.hint}>{hasCoordinates ? 'Touchez ou déplacez le repère pour ajuster la position.' : 'Touchez la carte pour placer le restaurant.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  map: { width: '100%', height: 210 },
  hint: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11, lineHeight: 16, padding: spacing.sm },
});
