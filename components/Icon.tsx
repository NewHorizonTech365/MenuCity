// Icon wrapper
// Ce petit composant encapsule les icônes Ionicons utilisées dans l'application.
// Il permet :
// - de centraliser la taille par défaut et le style des icônes
// - d'utiliser TypeScript pour s'assurer que le nom d'icône est valide
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/commonStyles';

interface IconProps {
  // `name` est une clé valide du glyphMap d'Ionicons (typage fort)
  name: keyof typeof Ionicons.glyphMap;
  size?: number; // taille en pixels
  style?: object; // style optionnel pour wrapper View
  color?: string; // couleur de l'icône
}

export default function Icon({ name, size = 40, style, color = "black" }: IconProps) {
  // Retourne simplement l'icône Ionicons dans une View pour pouvoir
  // ajouter du padding ou des styles communs si nécessaire.
  return (
    <View style={[styles.iconContainer, style]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
