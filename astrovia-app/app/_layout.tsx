/**
 * Root layout — loads fonts, hydrates auth session, and defines the
 * top-level Stack navigator. Every screen mounts under this.
 */
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { PlayfairDisplay_700Bold, PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '../src/store/userStore';
import { Colors } from '../src/constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrate = useUserStore((s) => s.hydrate);
  const isHydrating = useUserStore((s) => s.isHydrating);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
  });

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isHydrating) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isHydrating]);

  if (!fontsLoaded || isHydrating) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        initialRouteName="splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="onboarding/birth-details" />
        <Stack.Screen name="camera/index" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="camera/guide" />
        <Stack.Screen name="result/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}