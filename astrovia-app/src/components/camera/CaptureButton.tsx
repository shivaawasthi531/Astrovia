/**
 * Large circular shutter button with spring press feedback + haptics.
 */
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { Motion } from '../../constants/motion';

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CaptureButton({ onPress, disabled }: CaptureButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => (scale.value = withSpring(0.88, Motion.springs.stiff))}
      onPressOut={() => (scale.value = withSpring(1, Motion.springs.stiff))}
      disabled={disabled}
      style={[styles.outerRing, animatedStyle, disabled && styles.disabled]}
    >
      <Animated.View style={styles.innerCircle} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  outerRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: Colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.amberLight,
  },
  disabled: { opacity: 0.5 },
});