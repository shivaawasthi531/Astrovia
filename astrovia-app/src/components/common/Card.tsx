/**
 * Glassmorphism card — layered translucent panel with ambient amber glow,
 * animated border shimmer, and rich multi-layer depth effect.
 * Used for CTAs, reading result cards, kundli info panels, etc.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  /** Show animated amber glow border (default true) */
  glow?: boolean;
}

export function Card({ children, style, intensity = 35, glow = true }: CardProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (glow) {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [glow]);

  const borderGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.45, 1]),
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0, 0.08]),
  }));

  return (

    <View style={[styles.wrapper, style]}>
      {/* Ambient outer glow */}
      {glow && (
        <Animated.View style={[styles.outerGlow, borderGlowStyle]} />
      )}

      {/* Blur background */}
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />

      {/* Base glass fill */}
      <View style={[StyleSheet.absoluteFill, styles.glassFill]} />

      {/* Ambient colour wash that breathes */}
      {glow && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.ambientWash, innerGlowStyle]} />
      )}

      {/* Top-edge specular highlight */}
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topHighlight}
      />

      {/* Left-edge vertical shimmer */}
      <LinearGradient
        colors={['rgba(255,179,71,0.18)', 'rgba(255,179,71,0)', 'rgba(255,179,71,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.leftEdge}
      />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,179,71,0.32)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    // Shadow for depth
    shadowColor: '#FFB347',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  outerGlow: {
    position: 'absolute',
    top: -3,
    bottom: -3,
    left: -3,
    right: -3,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,179,71,0.22)',
    zIndex: -1,
  },
  glassFill: {
    backgroundColor: 'rgba(20, 12, 6, 0.52)',
    borderRadius: 22,
  },
  ambientWash: {
    backgroundColor: 'rgba(255,140,50,1)',
    borderRadius: 22,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  leftEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 2,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  content: {
    padding: 22,
  },
});