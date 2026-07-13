/**
 * Auth API calls + secure token persistence.
 */
import * as SecureStore from 'expo-secure-store';
import { api } from './api';
import { CONFIG } from '../constants/config';
import type {
  SignupPayload,
  LoginPayload,
  BirthDetailsPayload,
  TokenResponse,
  User,
} from '../types/user.types';

export const authService = {
  async signup(payload: SignupPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/signup', payload);
    await this.persistSession(data);
    return data;
  },

  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/login', payload);
    await this.persistSession(data);
    return data;
  },

  async updateBirthDetails(payload: BirthDetailsPayload): Promise<User> {
    const { data } = await api.put<User>('/auth/birth-details', payload);
    await SecureStore.setItemAsync(CONFIG.USER_STORAGE_KEY, JSON.stringify(data));
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async persistSession(data: TokenResponse): Promise<void> {
    await SecureStore.setItemAsync(CONFIG.TOKEN_STORAGE_KEY, data.access_token);
    await SecureStore.setItemAsync(CONFIG.USER_STORAGE_KEY, JSON.stringify(data.user));
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(CONFIG.TOKEN_STORAGE_KEY);
    await SecureStore.deleteItemAsync(CONFIG.USER_STORAGE_KEY);
  },

  async restoreSession(): Promise<{ token: string; user: User } | null> {
    const token = await SecureStore.getItemAsync(CONFIG.TOKEN_STORAGE_KEY);
    const userJson = await SecureStore.getItemAsync(CONFIG.USER_STORAGE_KEY);
    if (!token || !userJson) return null;
    return { token, user: JSON.parse(userJson) as User };
  },
};