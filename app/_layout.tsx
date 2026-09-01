import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthProvider from '../providers/AuthProvider';
import { DataProvider } from '../providers/DataProvider';
import { colors, spacing, ThemeProvider, typography } from '../styles/theme';
import { setupErrorLogging } from '../utils/errorLogger';

function LoadingScreen() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.loadingText}>Préparation de MenuCity…</Text>
    </View>
  );
}

function MissingClerkConfiguration() {
  return (
    <SafeAreaProvider>
      <View style={styles.centered}>
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>Configuration Clerk manquante</Text>
          <Text style={styles.configText}>
            Ajoutez EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY dans votre environnement Expo,
            puis relancez le serveur avec npx expo start --clear.
          </Text>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    setupErrorLogging();
  }, []);

  if (!fontsLoaded) return <LoadingScreen />;

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return <MissingClerkConfiguration />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.flex}>
            <AuthProvider>
              <DataProvider>
                <StatusBar style="dark" backgroundColor={colors.background} />
                <Stack
                  initialRouteName="index"
                  screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: colors.background },
                  }}
                />
              </DataProvider>
            </AuthProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontFamily: typography.regular,
  },
  configCard: {
    width: '100%',
    maxWidth: 440,
    padding: spacing.lg,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  configTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 21,
    textAlign: 'center',
  },
  configText: {
    color: colors.textSecondary,
    fontFamily: typography.regular,
    lineHeight: 22,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
