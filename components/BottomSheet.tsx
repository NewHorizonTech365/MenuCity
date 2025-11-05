// components/BottomSheet.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useTheme } from "../styles/theme";

interface SimpleBottomSheetProps {
  children?: React.ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SNAP_POINTS = {
  HALF: SCREEN_HEIGHT * 0.5,
  FULL: SCREEN_HEIGHT * 0.82,
  CLOSED: SCREEN_HEIGHT,
};

export default function SimpleBottomSheet({
  children,
  isVisible = false,
  onClose,
}: SimpleBottomSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const gestureTranslateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [currentSnap, setCurrentSnap] = useState(SNAP_POINTS.HALF);
  const { colors, radius } = useTheme();

  useEffect(() => {
    if (isVisible) {
      setCurrentSnap(SNAP_POINTS.HALF);
      gestureTranslateY.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT - SNAP_POINTS.HALF,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.45,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setCurrentSnap(SNAP_POINTS.CLOSED);
      gestureTranslateY.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const close = () => onClose?.();

  const snapTo = (point: number) => {
    setCurrentSnap(point);
    gestureTranslateY.setValue(0);
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT - point,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const getClosestSnap = (finalY: number, velocityY: number) => {
    if (velocityY > 900) return SNAP_POINTS.CLOSED;
    if (velocityY < -900) return SNAP_POINTS.FULL;

    const curr = SCREEN_HEIGHT - finalY;
    const distHalf = Math.abs(curr - SNAP_POINTS.HALF);
    const distFull = Math.abs(curr - SNAP_POINTS.FULL);

    return distHalf < distFull ? SNAP_POINTS.HALF : SNAP_POINTS.FULL;
  };

  const onGestureEvent = (e: any) => {
    const { translationY } = e.nativeEvent;
    const base = SCREEN_HEIGHT - currentSnap;
    const pos = base + translationY;
    const min = SCREEN_HEIGHT - SNAP_POINTS.FULL;
    const max = SCREEN_HEIGHT;
    const clamp = Math.max(min, Math.min(max, pos));
    gestureTranslateY.setValue(clamp - base);
  };

  const onStateChange = (e: any) => {
    const { state, translationY, velocityY } = e.nativeEvent;
    if (state === State.END) {
      const base = SCREEN_HEIGHT - currentSnap;
      const pos = base + translationY;
      const min = SCREEN_HEIGHT - SNAP_POINTS.FULL;
      const max = SCREEN_HEIGHT;
      const final = Math.max(min, Math.min(max, pos));
      const target = getClosestSnap(final, velocityY);
      gestureTranslateY.setValue(0);
      if (target === SNAP_POINTS.CLOSED) close();
      else snapTo(target);
    }
  };

  return (
    <Modal visible={isVisible} transparent statusBarTranslucent>
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "#000",
            opacity: backdropOpacity,
          }}
        />
      </TouchableWithoutFeedback>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onStateChange}
      >
        <Animated.View
          style={{
            position: "absolute",
            width: "100%",
            height: SNAP_POINTS.FULL,
            bottom: 0,
            backgroundColor: colors.background,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            transform: [
              { translateY: Animated.add(translateY, gestureTranslateY) },
            ],
            paddingTop: 10,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: 44,
              height: 5,
              backgroundColor: colors.border,
              borderRadius: 3,
              alignSelf: "center",
              marginBottom: 6,
            }}
          />

          <View style={{ flex: 1 }}>{children}</View>
        </Animated.View>
      </PanGestureHandler>
    </Modal>
  );
}