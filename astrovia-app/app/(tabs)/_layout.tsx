/**
 * Bottom tab navigator — Home, Kundli, History, Profile.
 * Redirects to onboarding if user isn't authenticated yet.
 * Premium tab bar with active glow indicator and scale animation.
 */
import { Redirect, Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IoniconsName;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabIconWrap}>
      {focused && (
        <LinearGradient
          colors={['rgba(255,179,71,0.28)', 'rgba(249,115,22,0.08)']}
          style={styles.activeBlob}
        />
      )}
      <Ionicons
        name={focused ? name : (`${name}-outline` as IoniconsName)}
        size={focused ? 23 : 21}
        color={color}
      />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function TabsLayout() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.amberLight,
        tabBarInactiveTintColor: 'rgba(253,246,236,0.35)',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(10,6,3,0)', 'rgba(10,6,3,0.85)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.tabBarTopBorder} />
          </View>
        ),
        tabBarLabelStyle: {
          fontFamily: 'Poppins_500Medium',
          fontSize: 10.5,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="kundli"
        options={{
          title: 'Kundli',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="planet" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="time" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 36,
  },
  activeBlob: {
    position: 'absolute',
    width: 44,
    height: 34,
    borderRadius: 12,
  },
  activeDot: {
    position: 'absolute',
    bottom: 1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.amberLight,
  },
  tabBarTopBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,179,71,0.18)',
  },
});