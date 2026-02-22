// Root layout for the app (used by expo-router)

import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

// Providers
import AuthProvider from '../providers/AuthProvider';
import { DataProvider } from '../providers/DataProvider';   // 💥 AJOUTÉ

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    setupErrorLogging();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          {/* 🔥 Tout ton app peut désormais accéder aux restaurants */}
          <DataProvider>

            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'default',
              }}
            />

          </DataProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}