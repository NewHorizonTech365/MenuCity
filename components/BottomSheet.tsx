import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { ReduceMotion, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing } from '../styles/theme';

interface SimpleBottomSheetProps {
  children?: ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
  closeAccessibilityLabel?: string;
}

const sheetEntering = SlideInDown.duration(240).reduceMotion(ReduceMotion.System);

export default function SimpleBottomSheet({ children, isVisible = false, onClose, closeAccessibilityLabel = 'Fermer la fenêtre' }: SimpleBottomSheetProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.min(height * 0.86, 720);

  return (
    <Modal
      visible={isVisible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeAccessibilityLabel}
          onPress={onClose}
          style={styles.backdrop}
        />
        <KeyboardAvoidingView
          pointerEvents="box-none"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardArea}
        >
          <Animated.View
            accessibilityViewIsModal
            entering={sheetEntering}
            style={[styles.sheet, { height: sheetHeight, paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
          >
            <View style={styles.handle} />
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  keyboardArea: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.raised,
  },
  handle: {
    width: 44,
    height: 5,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  content: { flex: 1 },
});
