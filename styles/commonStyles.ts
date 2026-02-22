
// commonStyles.ts
// Définit la palette de couleurs, les styles de boutons et styles globaux
// utilisés dans l'application. Modifier ces valeurs pour changer le thème.
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // Palette africaine inspirée
  primary: '#D2691E',      // Terre de Sienne (orange terreux)
  secondary: '#8B4513',    // Brun selle (marron profond)
  accent: '#FF8C00',       // Orange foncé (coucher de soleil)
  tertiary: '#228B22',     // Vert forêt (nature africaine)
  gold: '#DAA520',         // Or (richesse culturelle)
  
  background: '#FFF8DC',   // Blanc cassé (sable du désert)
  backgroundAlt: '#FFFFFF', // Blanc pur
  backgroundDark: '#8B4513', // Marron pour les sections sombres
  
  text: '#2F1B14',         // Brun très foncé (presque noir)
  textLight: '#8B7355',    // Brun clair
  textWhite: '#FFFFFF',    // Blanc pour contraste
  
  grey: '#D2B48C',         // Tan (beige sableux)
  card: '#FFFFFF',         // Blanc pour les cartes
  success: '#228B22',      // Vert forêt
  warning: '#FF8C00',      // Orange
  error: '#DC143C',        // Rouge cramoisi
  border: '#D2B48C',       // Beige pour les bordures
  
  // Couleurs spéciales pour le thème africain
  sunset: '#FF6347',       // Tomate (coucher de soleil)
  earth: '#A0522D',        // Brun sienna
  savanna: '#F4A460',      // Brun sable
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 15px rgba(210, 105, 30, 0.3)',
    elevation: 5,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accent: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 3px 10px rgba(255, 140, 0, 0.3)',
    elevation: 4,
  },
  text: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  textSecondary: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  textAccent: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textLight,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  restaurantCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 6px 20px rgba(210, 105, 30, 0.15)',
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
  },
  searchBar: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 4px 15px rgba(210, 105, 30, 0.2)',
    elevation: 4,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: colors.text,
  },
  africanPattern: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  gradientHeader: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
});
