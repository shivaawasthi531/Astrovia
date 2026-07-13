import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useStarfield } from '../../hooks/animations/useStarfield';
import { useParallaxTilt } from '../../hooks/animations/useParallaxTilt';
import { ShootingStar } from './ShootingStar';
import { useShootingStars } from '../../hooks/animations/useShootingStars';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(Animated.View);

function StarLayer({ stars, depthFactor, tiltX, tiltY }: any) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tiltX.value * depthFactor * 20 },
      { translateY: tiltY.value * depthFactor * 20 },
    ],
  }));

  return (
    <AnimatedView style={[StyleSheet.absoluteFill, animatedStyle]}>
      <Svg width={width} height={height}>
        {stars.map((star: any) => (
          <Circle key={star.id} cx={star.x} cy={star.y} r={star.radius} fill={Colors.star} opacity={star.opacity} />
        ))}
      </Svg>
    </AnimatedView>
  );
}

export function Starfield() {
  const layers = useStarfield();
  const { tiltX, tiltY } = useParallaxTilt();
  const shootingStars = useShootingStars();

  return (
    <>
      <StarLayer stars={layers.back} depthFactor={0.3} tiltX={tiltX} tiltY={tiltY} />
      <StarLayer stars={layers.mid} depthFactor={0.6} tiltX={tiltX} tiltY={tiltY} />
      <StarLayer stars={layers.front} depthFactor={1} tiltX={tiltX} tiltY={tiltY} />
      {shootingStars.map((star) => (
        <ShootingStar key={star.id} {...star} />
      ))}
    </>
  );
}