/**
 * Home screen — starfield background, animated welcome header,
 * glowing palm scan CTA card, and secondary Kundli nav card.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Starfield } from '../../src/components/common/Starfield';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { useUserStore } from '../../src/store/userStore';
import { Colors, Gradients } from '../../src/constants/colors';

export default function HomeScreen() {
  const user = useUserStore((s) => s.user);
  const firstName = user?.full_name?.split(' ')[0] || 'Traveler';

  // Entrance animations
  const headerY = useSharedValue(-30);
  const headerOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.88);
  const cardOpacity = useSharedValue(0);
  const secondCardY = useSharedValue(40);
  const secondCardOpacity = useSharedValue(0);

  // Pulsing orb behind the icon
  const orbScale = useSharedValue(1);
  const orbOpacity = useSharedValue(0.5);

  // Icon float
  const iconY = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance
    headerY.value = withSpring(0, { damping: 18, stiffness: 120 });
    headerOpacity.value = withTiming(1, { duration: 500 });

    setTimeout(() => {
      cardScale.value = withSpring(1, { damping: 14, stiffness: 100 });
      cardOpacity.value = withTiming(1, { duration: 400 });
    }, 150);

    setTimeout(() => {
      secondCardY.value = withSpring(0, { damping: 16, stiffness: 120 });
      secondCardOpacity.value = withTiming(1, { duration: 400 });
    }, 320);

    // Breathe orb
    orbScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    orbOpacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Float icon
    iconY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const ctaCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const secondCardStyle = useAnimatedStyle(() => ({
    opacity: secondCardOpacity.value,
    transform: [{ translateY: secondCardY.value }],
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    opacity: orbOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconY.value }],
  }));

  return (
    <View style={styles.root}>
      <LinearGradient colors={Gradients.backgroundRadial} style={StyleSheet.absoluteFill} />
      <Starfield />

      {/* Ambient radial behind CTA card */}
      <View style={styles.ambientLight} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{firstName} ✦</Text>
          <Text style={styles.tagline}>Your cosmic journey awaits</Text>
        </Animated.View>

        {/* Palm Scan CTA Card */}
        <Animated.View style={ctaCardStyle}>
          <Card style={styles.ctaCard}>
            {/* Background palm illustration gradient */}
            <LinearGradient
              colors={['rgba(255,179,71,0.10)', 'rgba(249,115,22,0.04)', 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Orb glow + icon */}
            <View style={styles.ctaIconArea}>
              <Animated.View style={[styles.orbRing2, orbStyle]} />
              <Animated.View style={[styles.orbRing1, orbStyle]} />
              <LinearGradient
                colors={['rgba(255,179,71,0.25)', 'rgba(249,115,22,0.12)']}
                style={styles.ctaIconWrap}
              >
                <Animated.View style={iconStyle}>
                  <Ionicons name="hand-left" size={36} color={Colors.amberLight} />
                </Animated.View>
              </LinearGradient>
            </View>

            <Text style={styles.ctaTitle}>Scan Your Palm</Text>
            <Text style={styles.ctaSubtitle}>
              Unlock the secrets hidden in your heart, head, life & fate lines — powered by AI.
            </Text>

            <View style={styles.divider} />

            <View style={styles.featureRow}>
              {[
                { icon: 'heart', label: 'Heart Line' },
                { icon: 'flash', label: 'Head Line' },
                { icon: 'leaf', label: 'Life Line' },
                { icon: 'star', label: 'Fate Line' },
              ].map(({ icon, label }) => (
                <View key={label} style={styles.featurePill}>
                  <Ionicons name={icon as any} size={11} color={Colors.amberMid} />
                  <Text style={styles.featurePillText}>{label}</Text>
                </View>
              ))}
            </View>

            <Button label="Start Palm Scan" onPress={() => router.push('/camera')} style={styles.ctaButton} />
          </Card>
        </Animated.View>

        {/* Kundli nav card */}
        <Animated.View style={secondCardStyle}>
          <Pressable onPress={() => router.push('/(tabs)/kundli')} accessibilityRole="button">
            <Card style={styles.secondaryCard} glow={false}>
              <View style={styles.secondaryRow}>
                <LinearGradient
                  colors={['rgba(124,58,237,0.28)', 'rgba(76,29,149,0.16)']}
                  style={styles.secondaryIconWrap}
                >
                  <Ionicons name="planet" size={22} color="#A78BFA" />
                </LinearGradient>
                <View style={styles.secondaryTextWrap}>
                  <Text style={styles.secondaryTitle}>Your Kundli</Text>
                  <Text style={styles.secondarySubtitle}>View your Vedic birth chart & Dasha</Text>
                </View>
                <View style={styles.chevronWrap}>
                  <Ionicons name="chevron-forward" size={18} color={Colors.amberLight} />
                </View>
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        {/* History quick link */}
        <Animated.View style={secondCardStyle}>
          <Pressable onPress={() => router.push('/(tabs)/history')} accessibilityRole="button">
            <Card style={styles.secondaryCard} glow={false}>
              <View style={styles.secondaryRow}>
                <LinearGradient
                  colors={['rgba(74,222,128,0.18)', 'rgba(74,222,128,0.08)']}
                  style={styles.secondaryIconWrap}
                >
                  <Ionicons name="time" size={22} color="#4ADE80" />
                </LinearGradient>
                <View style={styles.secondaryTextWrap}>
                  <Text style={styles.secondaryTitle}>Reading History</Text>
                  <Text style={styles.secondarySubtitle}>Revisit your past palm readings</Text>
                </View>
                <View style={styles.chevronWrap}>
                  <Ionicons name="chevron-forward" size={18} color={Colors.amberLight} />
                </View>
              </View>
            </Card>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  ambientLight: {
    position: 'absolute',
    top: 200,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(249,115,22,0.07)',
    pointerEvents: 'none',
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 68, paddingBottom: 120, gap: 14 },

  // Header
  header: { marginBottom: 10 },
  greeting: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: Colors.textPrimary,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  tagline: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,179,71,0.7)',
    marginTop: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // CTA Card
  ctaCard: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  ctaIconArea: { alignItems: 'center', justifyContent: 'center', marginBottom: 20, height: 100, width: 100 },
  orbRing2: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(249,115,22,0.15)',
  },
  orbRing1: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,179,71,0.2)',
  },
  ctaIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,179,71,0.5)',
  },
  ctaTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  ctaSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  divider: {
    height: 1,
    width: '85%',
    backgroundColor: 'rgba(255,179,71,0.15)',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 22,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,179,71,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,71,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  featurePillText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: Colors.amberLight,
  },
  ctaButton: { width: '100%' },

  // Secondary cards
  secondaryCard: { paddingVertical: 14, paddingHorizontal: 18 },
  secondaryRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  secondaryIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTextWrap: { flex: 1 },
  secondaryTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  secondarySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chevronWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,179,71,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});