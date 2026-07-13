/**
 * Reads device gyroscope tilt and exposes smoothed x/y offsets, used to
 * drive parallax movement on the starfield layers. Falls back gracefully
 * if the sensor is unavailable (e.g. simulator).
 */
import { useEffect } from 'react';
import { Gyroscope } from 'expo-sensors';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export function useParallaxTilt() {
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  useEffect(() => {
    let subscription: ReturnType<typeof Gyroscope.addListener> | null = null;

    Gyroscope.isAvailableAsync().then((available) => {
      if (!available) return;
      Gyroscope.setUpdateInterval(100);
      subscription = Gyroscope.addListener(({ x, y }) => {
        // Clamp + smooth so small hand jitter doesn't cause a jumpy background
        tiltX.value = withTiming(Math.max(-1, Math.min(1, x * 2)), { duration: 300 });
        tiltY.value = withTiming(Math.max(-1, Math.min(1, y * 2)), { duration: 300 });
      });
    });

    return () => subscription?.remove();
  }, []);

  return { tiltX, tiltY };
}