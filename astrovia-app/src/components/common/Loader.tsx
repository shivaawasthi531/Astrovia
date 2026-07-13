/**
 * Custom "cosmic orb" loader — pulsing gradient sphere with orbiting
 * particles. Replaces generic ActivityIndicator everywhere in the app.
 * Degrades to a simple fade-pulse if reduce-motion is enabled.
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';

interface LoaderProps {
  size?: number;
}

export function Loader({ size = 64 }: LoaderProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const pulse = useSharedValue(1);
  const orbitAngle = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    if (reduceMotion) {
      pulse.value = withRepeat(withSequence(withTiming(0.5, { duration: 800 }), withTiming(1, { duration: 800 })), -1, true);
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    orbitAngle.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1, false);
  }, [reduceMotion]);

  const sphereStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const particleStyle = useAnimatedStyle(() => {
    const radius = size * 0.75;
    const rad = (orbitAngle.value * Math.PI) / 180;
    return {
      transform: [
        { translateX: Math.cos(rad) * radius },
        { translateY: Math.sin(rad) * radius },
      ],
    };
  });

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      {!reduceMotion && (
        <Animated.View style={[styles.particle, particleStyle]} />
      )}
      <Animated.View style={[sphereStyle, { width: size, height: size, borderRadius: size / 2 }]}>
        <LinearGradient
          colors={Gradients.amberGlow}
          style={[styles.sphere, { width: size, height: size, borderRadius: size / 2 }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphere: {
    shadowColor: Colors.amberMid,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.amberLight,
  },
});