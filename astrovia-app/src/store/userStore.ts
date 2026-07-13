/**
 * Global auth/user state via Zustand. Kept minimal — the source of truth
 * for the token itself lives in SecureStore; this holds the in-memory copy
 * for fast UI reads.
 */
import { create } from 'zustand';
import { authService } from '../services/authService';
import type { User } from '../types/user.types';

interface UserStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean; // true while restoring session on app boot

  hydrate: () => Promise<void>;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrating: true,

  hydrate: async () => {
    const session = await authService.restoreSession();
    if (session) {
      set({ user: session.user, accessToken: session.token, isAuthenticated: true, isHydrating: false });
    } else {
      set({ isHydrating: false });
    }
  },

  setSession: (token, user) => {
    set({ accessToken: token, user, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await authService.logout();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));