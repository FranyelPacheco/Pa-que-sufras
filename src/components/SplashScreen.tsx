import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';

import { colors } from '../theme/colors';
import { letterSpacings } from '../theme/typography';

const SplashScreen = () => {
  const orb1 = useSharedValue(0);
  const orb2 = useSharedValue(0);

  useEffect(() => {
    orb1.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
    orb2.value = withRepeat(
      withSequence(withTiming(1, { duration: 2000 }), withTiming(0, { duration: 2000 })),
      -1,
      true,
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: orb1.value * 15 },
      { translateY: orb1.value * -12 },
    ],
    opacity: 0.06 + orb1.value * 0.04,
  }));

  const orb2Style = useAnimatedStyle(() => ({
    opacity: 0.03 + orb2.value * 0.05,
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.orb, styles.orbTop, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orbBottom, orb2Style]} />

      <Animated.View entering={FadeIn.duration(800)} style={styles.center}>
        <Animated.Text style={styles.title}>Pa' que sufras</Animated.Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: {
    borderRadius: 999,
    position: 'absolute',
  },
  orbTop: {
    backgroundColor: colors.accent,
    height: 260,
    opacity: 0.06,
    right: -80,
    top: -60,
    width: 260,
  },
  orbBottom: {
    backgroundColor: '#8B5CF6',
    bottom: 60,
    height: 200,
    left: -70,
    opacity: 0.05,
    width: 200,
  },
  center: {
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 48,
    letterSpacing: letterSpacings.widest,
    lineHeight: 56,
    textAlign: 'center',
  },
});
