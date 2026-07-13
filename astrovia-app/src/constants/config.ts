/**
 * App-wide configuration. API_BASE_URL must point to your FastAPI backend.
 * For local dev on a physical device, use your machine's LAN IP, not localhost.
 */

// Change this to your Railway URL once deployed, or your local IP for device testing
// e.g. 'http://192.168.1.5:8000' — find your IP with `ipconfig` on Windows
export const API_BASE_URL = 'http://10.138.185.29:8000/api/v1';

export const CONFIG = {
  MAX_IMAGE_SIZE_MB: 10,
  TOKEN_STORAGE_KEY: 'astrovia_access_token',
  USER_STORAGE_KEY: 'astrovia_user',
  ONBOARDING_COMPLETE_KEY: 'astrovia_onboarding_complete',
  API_TIMEOUT_MS: 30000,
};