import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { fontSizes, fontWeights } from '../../theme/typography';

type Gender = 'H' | 'M';

type GenderSelectorProps = {
  value: Gender;
  onChange: (gender: Gender) => void;
  disabled?: boolean;
};

const OPTIONS: { value: Gender; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { value: 'H', label: 'Hombre', icon: 'gender-male' },
  { value: 'M', label: 'Mujer', icon: 'gender-female' },
];

const GenderSelector = ({ value, onChange, disabled }: GenderSelectorProps) => (
  <View style={styles.row}>
    {OPTIONS.map((opt, index) => {
      const isActive = value === opt.value;
      return (
        <Pressable
          key={opt.value}
          disabled={disabled}
          onPress={() => onChange(opt.value)}
          style={[
            styles.button,
            index === 0 && styles.buttonLeft,
            index === OPTIONS.length - 1 && styles.buttonRight,
            isActive && styles.buttonActive,
            disabled && styles.disabled,
          ]}
        >
          <MaterialCommunityIcons
            name={opt.icon}
            size={18}
            color={isActive ? colors.accent : colors.textDim}
          />
          <Text
            style={[
              styles.label,
              isActive && styles.labelActive,
            ]}
          >
            {opt.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export default GenderSelector;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  buttonLeft: {
    borderBottomLeftRadius: borderRadius.md,
    borderTopLeftRadius: borderRadius.md,
    marginRight: -1,
  },
  buttonRight: {
    borderBottomRightRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  buttonActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
    zIndex: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.textDim,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  labelActive: {
    color: colors.accent,
  },
});
