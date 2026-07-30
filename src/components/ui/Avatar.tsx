import { Image, StyleSheet, View } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  name: string;
  gender: 'H' | 'M';
  color: string;
  imageIndex: number;
  size?: AvatarSize;
};

const AVATAR_IMAGES: Record<'H' | 'M', ReturnType<typeof require>[]> = {
  H: [
    require('../../../assets/avatars/perro_1.png'),
    require('../../../assets/avatars/perro_2.png'),
    require('../../../assets/avatars/perro_3.png'),
    require('../../../assets/avatars/perro_4.png'),
    require('../../../assets/avatars/perro_5.png'),
    require('../../../assets/avatars/perro_6.png'),
  ],
  M: [
    require('../../../assets/avatars/zorra_1.png'),
    require('../../../assets/avatars/zorra_2.png'),
    require('../../../assets/avatars/zorra_3.png'),
    require('../../../assets/avatars/zorra_4.png'),
    require('../../../assets/avatars/zorra_5.png'),
    require('../../../assets/avatars/zorra_6.png'),
  ],
};

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
};

const Avatar = ({ gender, color, imageIndex, size = 'md' }: AvatarProps) => {
  const dim = sizeMap[size];
  const source = AVATAR_IMAGES[gender][imageIndex % 6];

  return (
    <View
      style={[
        styles.base,
        {
          borderColor: color,
          height: dim,
          width: dim,
        },
      ]}
    >
      <Image source={source} style={styles.image} resizeMode="contain" />
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
