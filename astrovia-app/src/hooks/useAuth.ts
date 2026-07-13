/**
 * Wraps auth actions (signup/login/logout) with loading + error state,
 * so screens don't need to manage try/catch boilerplate themselves.
 */
import { useState } from 'react';
import { router } from 'expo-router';
import { authService } from '../services/authService';
import { useUserStore } from '../store/userStore';
import type { SignupPayload, LoginPayload } from '../types/user.types';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useUserStore((s) => s.setSession);
  const logoutStore = useUserStore((s) => s.logout);

  const signup = async (payload: SignupPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.signup(payload);
      setSession(data.access_token, data.user);
      router.replace(data.user.onboarding_complete ? '/(tabs)' : '/onboarding/birth-details');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(payload);
      setSession(data.access_token, data.user);
      router.replace(data.user.onboarding_complete ? '/(tabs)' : '/onboarding/birth-details');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutStore();
    router.replace('/onboarding');
  };

  return { signup, login, logout, isLoading, error, clearError: () => setError(null) };
}