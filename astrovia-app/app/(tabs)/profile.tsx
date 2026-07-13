/**
 * Profile tab — premium user info, avatar initials, stats row, logout.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { useUserStore } from '../../src/store/userStore';
import { useAuth } from '../../src/hooks/useAuth';
import { Colors, Gradients } from '../../src/constants/colors';

export default function ProfileScreen() {
  const user = useUserStore((s) => s.user);
  const { logout } = useAuth();

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '✦';

  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardScale.value = withSpring(1, { damping: 16, stiffness: 110 });
    cardOpacity.value = withTiming(1, { duration: 450 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const infoRows = [
    {
      icon: 'checkmark-circle' as const,
      label: 'Onboarding',
      value: user?.onboarding_complete ? 'Complete' : 'Incomplete',
      valueColor: user?.onboarding_complete ? Colors.success : Colors.warning,
    },
    {
      icon: 'mail-outline' as const,
      label: 'Email',
      value: user?.email || '—',
      valueColor: Colors.textSecondary,
    },
  ];

  return (
    <View style={styles.root}>
      <LinearGradient colors={Gradients.backgroundRadial} style={StyleSheet.absoluteFill} />

      {/* Top ambient glow */}
      <View style={styles.topGlow} pointerEvents="none" />

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <LinearGradient
              colors={['#FFD580', '#F97316', '#EA580C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarInitials}>{initials}</Text>
            </LinearGradient>
          </View>
          <View style={styles.onlineDot} />
        </View>

        <Text style={styles.name}>{user?.full_name || 'Astrovia User'}</Text>
        <Text style={styles.emailSmall}>{user?.email}</Text>

        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Ionicons name="star" size={10} color={Colors.amberLight} />
            <Text style={styles.tagText}>Cosmic Explorer</Text>
          </View>
        </View>

        {/* Info card */}
        <Animated.View style={[styles.cardWrap, animStyle]}>
          <Card style={styles.infoCard}>
            <Text style={styles.sectionLabel}>Account Details</Text>
            {infoRows.map(({ icon, label, value, valueColor }, i) => (
              <View key={label}>
                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <Ionicons name={icon} size={14} color={Colors.amberMid} />
                    <Text style={styles.infoLabel}>{label}</Text>
                  </View>
                  <Text style={[styles.infoValue, { color: valueColor }]}>{value}</Text>
                </View>
                {i < infoRows.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </Card>

          {/* Sign out */}
          <Button label="Sign Out" onPress={logout} variant="secondary" style={styles.logoutButton} />

          <Text style={styles.version}>Astrovia v1.0.0 · Made with ✦</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topGlow: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,179,71,0.08)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
  },

  // Avatar
  avatarSection: { position: 'relative', marginBottom: 18 },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    padding: 3,
    backgroundColor: 'rgba(255,179,71,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,179,71,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: '#1A0800',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },

  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 23,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  emailSmall: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  tagRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 28 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,179,71,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,71,0.28)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: Colors.amberLight,
  },

  cardWrap: { width: '100%', gap: 14 },
  infoCard: { width: '100%' },
  sectionLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: Colors.amberMid,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,179,71,0.1)',
  },

  logoutButton: { width: '100%' },
  version: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});