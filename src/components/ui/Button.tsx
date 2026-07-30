import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { fontSizes, fontWeights, letterSpacings } from '../../theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'outline' | 'ghost';

type ButtonProps = ComponentProps<typeof Pressable> & {
  variant?: Variant;
  label: string;
};

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.accent, text: colors.text },
  outline: { bg: 'transparent', text: colors.accent, border: colors.accent },
  ghost: { bg: 'transparent', text: colors.textDim },
};

const Button = ({ variant = 'primary', label, style, disabled, ...props }: ButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const vars = variantStyles[variant];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.base,
        {
          backgroundColor: disabled ? colors.surfaceLight : vars.bg,
          borderColor: vars.border ?? 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.label,
          {
            color: disabled ? colors.textDark : vars.text,
          },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.xl,
  },
  label: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.wide,
  },
});
