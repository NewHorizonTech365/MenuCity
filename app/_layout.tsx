
// Root layout for the app (used by expo-router)
// Ce fichier définit le layout global de l'application — il s'exécute autour
// de toutes les routes définies dans le dossier `app/`.
// - Il configure les polices, le fournisseur d'auth et les handlers globaux.
// - Important pour tout nouveau développeur : c'est le point d'entrée visuel
//   de l'application côté React.
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import AuthProvider from '../providers/AuthProvider';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    setupErrorLogging();
  }, []);

  // Si les polices ne sont pas chargées, on n'affiche rien pour éviter
  // des problèmes de rendu. Un développeur peut remplacer `null` par un
  // écran de chargement si nécessaire.
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      {/* GestureHandlerRootView : requis pour react-native-gesture-handler */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* AuthProvider : enveloppe l'application et fournit le contexte d'authentification */}
        <AuthProvider>
          {/* Stack d'expo-router : affiche les pages selon la route. */}
          <Stack
            screenOptions={{
              // headerShown false => les en-têtes natifs ne sont pas affichés
              headerShown: false,
              // animation par défaut pour la navigation
              animation: 'default',
            }}
          />
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
