/**
 * Centralized animation configs — durations, easings, spring params.
 * All hooks/components pull from here so timing stays consistent app-wide.
 */
import { Easing } from 'react-native-reanimated';

export const Motion = {
  // Spring configs for reanimated
  springs: {
    gentle: { damping: 15, stiffness: 120, mass: 1 },
    bouncy: { damping: 8, stiffness: 150, mass: 1 },
    stiff: { damping: 20, stiffness: 300, mass: 0.8 },
    cardTilt: { damping: 12, stiffness: 100, mass: 1 },
  },

  // Durations in ms
  durations: {
    fast: 200,
    normal: 350,
    slow: 600,
    lineDrawing: 1800,
    shootingStar: 2200,
  },

  // Easing curves
  easings: {
    standard: Easing.bezier(0.4, 0, 0.2, 1),
    decelerate: Easing.bezier(0, 0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0, 1, 1),
  },

  // Shooting star timing
  shootingStar: {
    minIntervalMs: 4000,
    maxIntervalMs: 8000,
  },

  // Card tilt sensitivity (degrees per pixel of drag)
  cardTilt: {
    maxRotation: 12,
    scaleOnPress: 0.97,
  },

  // Button press feedback
  buttonPress: {
    scale: 0.95,
  },
} as const;