import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

type CardProps = ViewProps & {
  variant?: 'standard' | 'premium' | 'glass';
  children: ReactNode;
};

const variantStyles = {
  standard: { bg: colors.surface, border: colors.border },
  premium: { bg: colors.surface, border: colors.accent },
  glass: { bg: colors.glass, border: colors.glassBorder },
};

const Card = ({ variant = 'standard', style, children, ...props }: CardProps) => {
  const vars = variantStyles[variant];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: vars.bg,
          borderColor: vars.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing['2xl'],
  },
});
