import { type ComponentProps } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { fontSizes } from '../../theme/typography';

type InputProps = ComponentProps<typeof TextInput> & {
  isDisabled?: boolean;
};

const Input = ({ style, isDisabled, ...props }: InputProps) => {
  const isFocused = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(
      isFocused.value ? colors.accent : colors.border,
      { duration: 200 },
    ),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused.value ? 0.6 : 0, { duration: 200 }),
  }));

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <TextInput
        style={[
          styles.input,
          isDisabled && styles.disabled,
          style,
        ]}
        placeholderTextColor={colors.textDark}
        onFocus={() => { isFocused.value = 1; }}
        onBlur={() => { isFocused.value = 0; }}
        {...props}
      />
      <Animated.View style={[styles.focusGlow, glowStyle]} />
    </Animated.View>
  );
};

export default Input;

const styles = StyleSheet.create({
  wrapper: {
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    fontSize: fontSizes.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  focusGlow: {
    backgroundColor: colors.accent,
    bottom: 0,
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
