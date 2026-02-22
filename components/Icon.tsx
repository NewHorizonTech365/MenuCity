// Icon.tsx corrigé
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconProps {
  // string → évite les erreurs TypeScript
  name: string;
  size?: number;
  style?: object;
  color?: string;
}

export default function Icon({ name, size = 40, style, color = "black" }: IconProps) {
  return (
    <View style={[styles.iconContainer, style]}>
      <Ionicons name={name as any} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
