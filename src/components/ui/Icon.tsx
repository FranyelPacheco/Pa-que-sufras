import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';

import { colors } from '../../theme/colors';
import { iconSizes } from '../../theme/spacing';

type IconProps = Omit<ComponentProps<typeof MaterialCommunityIcons>, 'size'> & {
  size?: keyof typeof iconSizes;
};

const Icon = ({ size = 'md', color = colors.textDim, ...props }: IconProps) => (
  <MaterialCommunityIcons size={iconSizes[size]} color={color} {...props} />
);

export default Icon;
