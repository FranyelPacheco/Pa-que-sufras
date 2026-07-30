import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/colors';
import { fontSizes, fontWeights, letterSpacings } from '../theme/typography';
import { spacing } from '../theme/spacing';
import Button from '../components/ui/Button';

const TAGLINES = [
  'Rompe el hielo. Sube el tono.',
  'Atrévete a preguntar.',
  'Una pregunta. Una verdad. Una noche.',
  '¿Te animas a jugar?',
];

type WelcomeScreenProps = {
  onStart: () => void;
};

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [taglineIndex, setTaglineIndex] = useState(0);

  const orb1 = useSharedValue(0);
  const orb2 = useSharedValue(0);
  const dogFloat = useSharedValue(0);
  const foxFloat = useSharedValue(0);

  useEffect(() => {
    orb1.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true);
    orb2.value = withRepeat(withTiming(1, { duration: 5000 }), -1, true);
    dogFloat.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true);
    foxFloat.value = withDelay(
      500,
      withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true),
    );

    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    opacity: 0.06 + orb1.value * 0.04,
    transform: [
      { translateX: orb1.value * 20 },
      { translateY: orb1.value * -15 },
    ],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    opacity: 0.05 + orb2.value * 0.03,
    transform: [
      { translateX: orb2.value * -15 },
      { translateY: orb2.value * 20 },
    ],
  }));

  const dogStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (dogFloat.value - 0.5) * 16 }],
  }));

  const foxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (foxFloat.value - 0.5) * 16 }],
  }));

  return (
    <View style={styles.root}>
      <View style={styles.ambienceLayer}>
        <Animated.View style={[styles.orb, styles.orbTop, orb1Style]} />
        <Animated.View style={[styles.orb, styles.orbBottom, orb2Style]} />
      </View>

      <View style={styles.screen}>
        <Animated.View entering={FadeInDown.duration(600).springify().delay(200)} style={styles.logoSection}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <View style={styles.centerBlock}>
          <Animated.Text
            entering={FadeInDown.duration(600).springify().delay(400)}
            style={styles.title}
          >
            Pa' que sufras
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.duration(600).springify().delay(600)}
            key={taglineIndex}
            style={styles.tagline}
          >
            {TAGLINES[taglineIndex]}
          </Animated.Text>
        </View>

        <Animated.View entering={FadeInDown.duration(600).springify().delay(800)} style={styles.charactersRow}>
          <Animated.View style={[styles.charBox, dogStyle]}>
            <Image source={require('../../assets/bodies/perro_cuerpo_completo2.png')} style={styles.charImg} resizeMode="contain" />
            <Text style={styles.charLabel}>Perro</Text>
          </Animated.View>
          <Animated.View style={[styles.charBox, foxStyle]}>
            <Image source={require('../../assets/bodies/zorra_cuerpo_completo2.png')} style={styles.charImg} resizeMode="contain" />
            <Text style={styles.charLabel}>Zorra</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(500).springify().delay(1000)}
        >
          <Button label="ENTRAR" onPress={onStart} />
        </Animated.View>
      </View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  ambienceLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  orb: {
    borderRadius: 999,
    position: 'absolute',
  },
  orbTop: {
    backgroundColor: '#8B5CF6',
    height: 260,
    opacity: 0.06,
    right: -80,
    top: -60,
    width: 260,
  },
  orbBottom: {
    backgroundColor: colors.accent,
    bottom: 60,
    height: 200,
    left: -70,
    opacity: 0.05,
    width: 200,
  },
  screen: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 28,
    paddingVertical: 40,
    zIndex: 1,
  },
  logoSection: {
    alignItems: 'center',
  },
  logo: {
    height: 100,
    width: 120,
  },
  centerBlock: {
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 44,
    letterSpacing: letterSpacings.widest,
    lineHeight: 52,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  tagline: {
    color: colors.textDim,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacings.wider,
    lineHeight: 22,
    textAlign: 'center',
  },
  charactersRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: spacing.sm,
  },
  charBox: {
    alignItems: 'center',
    flex: 1,
    maxWidth: '45%',
  },
  charImg: {
    height: 180,
    width: '100%',
  },
  charLabel: {
    color: colors.textDim,
    fontSize: fontSizes.sm,
    letterSpacing: letterSpacings.widest,
    marginTop: spacing.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
