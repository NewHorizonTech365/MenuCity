import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticFeedback = 'selection' | 'soft' | 'success';

export function triggerHaptic(feedback: HapticFeedback = 'selection') {
  if (Platform.OS === 'web') return;

  const request = feedback === 'success'
    ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    : feedback === 'soft'
      ? Platform.OS === 'android'
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Context_Click)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
      : Haptics.selectionAsync();

  void request.catch(() => undefined);
}
