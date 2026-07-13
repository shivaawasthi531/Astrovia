/**
 * Central axios instance. Attaches the JWT token to every request
 * automatically, and redirects to login on 401.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, CONFIG } from '../constants/config';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: CONFIG.API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every outgoing request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync(CONFIG.TOKEN_STORAGE_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling — normalize error messages for UI consumption
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const message =
      error.response?.data?.detail || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);