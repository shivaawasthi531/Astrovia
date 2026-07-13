/**
 * Palm reading state — current scan in progress + latest result,
 * so the result screen can read it without an extra API round-trip.
 */
import { create } from 'zustand';
import type { PalmReading } from '../types/palm.types';

interface PalmStore {
  isScanning: boolean;
  currentReading: PalmReading | null;
  error: string | null;

  setScanning: (value: boolean) => void;
  setReading: (reading: PalmReading) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePalmStore = create<PalmStore>((set) => ({
  isScanning: false,
  currentReading: null,
  error: null,

  setScanning: (value) => set({ isScanning: value, error: null }),
  setReading: (reading) => set({ currentReading: reading, isScanning: false, error: null }),
  setError: (error) => set({ error, isScanning: false }),
  reset: () => set({ isScanning: false, currentReading: null, error: null }),
}));