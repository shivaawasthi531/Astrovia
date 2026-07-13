/**
 * Kundli state — caches the latest chart so the Kundli tab doesn't
 * refetch on every tab switch.
 */
import { create } from 'zustand';
import type { Kundli } from '../types/kundli.types';

interface KundliStore {
  kundli: Kundli | null;
  isGenerating: boolean;
  error: string | null;

  setKundli: (kundli: Kundli) => void;
  setGenerating: (value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useKundliStore = create<KundliStore>((set) => ({
  kundli: null,
  isGenerating: false,
  error: null,

  setKundli: (kundli) => set({ kundli, isGenerating: false, error: null }),
  setGenerating: (value) => set({ isGenerating: value, error: null }),
  setError: (error) => set({ error, isGenerating: false }),
}));