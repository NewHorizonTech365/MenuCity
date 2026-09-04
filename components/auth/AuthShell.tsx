import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, layout, spacing, typography } from '../../styles/theme';
import AppHeader from '../ui/AppHeader';
import BrandMark from '../ui/BrandMark';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const router = useRouter();
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/home');
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.page}>
            <AppHeader title="" onBack={goBack} />
            <BrandMark />
            <View style={styles.intro}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xl },
  page: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: layout.screenPadding, gap: spacing.lg },
  intro: { gap: spacing.xs, marginTop: spacing.sm },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.7 },
  subtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 15, lineHeight: 22 },
});
