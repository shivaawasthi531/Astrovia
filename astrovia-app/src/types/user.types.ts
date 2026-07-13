export interface User {
  id: string;
  email: string;
  full_name: string | null;
  onboarding_complete: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SignupPayload {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface BirthDetailsPayload {
  birth_date: string; // ISO date string YYYY-MM-DD
  birth_time: string; // HH:MM:SS
  birth_place: string;
  birth_latitude: number;
  birth_longitude: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}