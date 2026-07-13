/**
 * Primary CTA button — spring scale on press + amber gradient +
 * shimmer sweep animation + glow shadow + haptic feedback.
 * All buttons in the app should use this, not raw TouchableOpacity,
 * to keep press feedback consistent.
 */
import React, { useEffect } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Gradients } from '../../constants/colors';
import { Motion } from '../../constants/motion';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    if (variant === 'primary' && !disabled && !loading) {
      shimmer.value = withRepeat(
        withTiming(2, { duration: 2400, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [variant, disabled, loading]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0, 0.7]),
    transform: [{ scale: interpolate(glow.value, [0, 1], [0.85, 1.05]) }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [-1, 2], [-120, 320]) }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 14, stiffness: 400, mass: 0.6 });
    glow.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300, mass: 0.7 });
    glow.value = withSpring(0, { damping: 14, stiffness: 200 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[animatedStyle, styles.pressableWrapper, style, isDisabled && styles.disabled]}
      >
        {/* Outer glow bloom */}
        <AnimatedView style={[styles.glowBloom, glowStyle]} pointerEvents="none" />

        <LinearGradient
          colors={['#FFD580', '#FFB347', '#F97316', '#EA580C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          {/* Inner top-edge highlight */}
          <LinearGradient
            colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.innerHighlight}
            pointerEvents="none"
          />

          {/* Shimmer sweep */}
          {!loading && !isDisabled && (
            <AnimatedView style={[styles.shimmerMask, shimmerStyle]} pointerEvents="none">
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerStreak}
              />
            </AnimatedView>
          )}

          {loading ? (
            <ActivityIndicator color={Colors.background} size="small" />
          ) : (
            <Text style={styles.primaryLabel}>{label}</Text>
          )}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[animatedStyle, styles.pressableWrapper, style, isDisabled && styles.disabled]}
      >
        <LinearGradient
          colors={['rgba(255,179,71,0.18)', 'rgba(249,115,22,0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.secondaryButton}
        >
          {/* Amber border shimmer */}
          <View style={styles.secondaryBorder} />
          {loading ? (
            <ActivityIndicator color={Colors.amberLight} size="small" />
          ) : (
            <Text style={styles.secondaryLabel}>{label}</Text>
          )}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  // Ghost
  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[animatedStyle, styles.ghostButton, style, isDisabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.amberLight} size="small" />
      ) : (
        <Text style={styles.ghostLabel}>{label}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pressableWrapper: {
    position: 'relative',
  },
  glowBloom: {
    position: 'absolute',
    top: -12,
    bottom: -12,
    left: -12,
    right: -12,
    borderRadius: 28,
    backgroundColor: 'rgba(251, 146, 60, 0.45)',
    zIndex: -1,
  },
  gradientButton: {
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F97316',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  shimmerMask: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
  },
  shimmerStreak: {
    flex: 1,
    width: 80,
  },
  primaryLabel: {
    color: '#1A0800',
    fontFamily: 'Poppins_700Bold',
    fontSize: 15.5,
    letterSpacing: 0.4,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,179,71,0.55)',
    overflow: 'hidden',
  },
  secondaryBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  secondaryLabel: {
    color: Colors.amberLight,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15.5,
    letterSpacing: 0.3,
  },
  ghostButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostLabel: {
    color: Colors.textSecondary,
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(253,246,236,0.3)',
  },
  disabled: {
    opacity: 0.42,
  },
});