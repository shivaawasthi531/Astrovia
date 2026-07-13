import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
const LETTERS = "ASTROVIA".split("");

const TIMINGS = {
  letterStagger: 150,
  letterDuration: 700,
  taglineDelay: 2400,
  taglineDuration: 900,
  holdBeforeNavigate: 3000,
};

function Star({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
        withTiming(0.3, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) })
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.star,
        { left: x, top: y, width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

function AnimatedLetter({ char, index }: { char: string; index: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);

  useEffect(() => {
    const delay = 400 + index * TIMINGS.letterStagger;
    opacity.value = withDelay(delay, withTiming(1, { duration: TIMINGS.letterDuration }));
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: TIMINGS.letterDuration, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.Text style={[styles.letter, style]}>{char}</Animated.Text>;
}

export default function SplashScreen() {
  const router = useRouter();
  const taglineOpacity = useSharedValue(0);
  const hasNavigated = useRef(false);

  useEffect(() => {
    taglineOpacity.value = withDelay(
      TIMINGS.taglineDelay,
      withTiming(1, { duration: TIMINGS.taglineDuration })
    );

    const totalDuration =
      TIMINGS.taglineDelay + TIMINGS.taglineDuration + TIMINGS.holdBeforeNavigate;

    const timer = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.replace("/onboarding");
      }
    }, totalDuration);

    return () => clearTimeout(timer);
  }, []);

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const stars = useRef(
    Array.from({ length: 40 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.7,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 1200,
    }))
  ).current;

  return (
    <View style={styles.container}>
      {stars.map((s, i) => (
        <Star key={i} x={s.x} y={s.y} size={s.size} delay={s.delay} />
      ))}

      <View style={styles.glow} />

      <View style={styles.titleRow}>
        {LETTERS.map((char, i) => (
          <AnimatedLetter key={i} char={char} index={i} />
        ))}
      </View>

      <Animated.Text style={[styles.tagline, taglineStyle]}>
        Your palm. Your stars. Your story.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0603",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#F97316",
    opacity: 0.08,
  },
  star: {
    position: "absolute",
    backgroundColor: "#FFD9A0",
  },
  titleRow: {
    flexDirection: "row",
  },
  letter: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 44,
    color: "#FDF6EC",
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: "#C9B8A8",
    marginTop: 16,
    letterSpacing: 0.5,
  },
});