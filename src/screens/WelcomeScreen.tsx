import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
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

  useEffect(() => {
    orb1.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true);
    orb2.value = withRepeat(withTiming(1, { duration: 5000 }), -1, true);

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

  return (
    <View style={styles.root}>
      <View style={styles.ambienceLayer}>
        <Animated.View style={[styles.orb, styles.orbTop, orb1Style]} />
        <Animated.View style={[styles.orb, styles.orbBottom, orb2Style]} />
      </View>

      <View style={styles.screen}>
        <View style={styles.centerBlock}>
          <Animated.View entering={FadeInDown.duration(600).springify().delay(200)} style={styles.logoWrap}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>

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

        <Animated.View
          entering={FadeInUp.duration(500).springify().delay(800)}
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
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 64,
    zIndex: 1,
  },
  centerBlock: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    height: 110,
    width: 130,
  },
  title: {
    color: colors.text,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 48,
    letterSpacing: letterSpacings.widest,
    lineHeight: 56,
    marginBottom: spacing.lg,
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
});
