// components/Button.tsx
import { Text, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "../styles/theme";

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

export default function Button({ text, onPress, style, textStyle }: ButtonProps) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: colors.primary,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.pill,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: "#fff",
            fontFamily: typography.semiBold,
            fontSize: 16,
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}