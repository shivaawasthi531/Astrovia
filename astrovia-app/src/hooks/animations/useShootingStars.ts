/**
 * Manages a queue of shooting stars that spawn at random intervals
 * (4-8s), stream across the screen with an arc trajectory, then despawn.
 * Tapping an active star triggers a "make a wish" glow flash callback.
 */
import { useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import { Motion } from '../../constants/motion';

export interface ShootingStarInstance {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const { width, height } = Dimensions.get('window');

export function useShootingStars() {
  const [activeStars, setActiveStars] = useState<ShootingStarInstance[]>([]);
  const idCounter = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const spawnStar = () => {
      const id = idCounter.current++;
      // Start near a top corner, arc diagonally across the screen
      const startX = Math.random() * width * 0.4;
      const startY = Math.random() * height * 0.3;
      const endX = startX + width * 0.6 + Math.random() * width * 0.3;
      const endY = startY + height * 0.4 + Math.random() * height * 0.3;

      setActiveStars((prev) => [...prev, { id, startX, startY, endX, endY }]);

      // Remove after animation completes
      setTimeout(() => {
        setActiveStars((prev) => prev.filter((s) => s.id !== id));
      }, Motion.durations.shootingStar);

      const nextDelay =
        Motion.shootingStar.minIntervalMs +
        Math.random() * (Motion.shootingStar.maxIntervalMs - Motion.shootingStar.minIntervalMs);
      timeoutRef.current = setTimeout(spawnStar, nextDelay);
    };

    timeoutRef.current = setTimeout(spawnStar, 1500); // first star appears quickly

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return activeStars;
}