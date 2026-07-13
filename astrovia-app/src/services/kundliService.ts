/**
 * Kundli generation + retrieval API calls.
 */
import { api } from './api';
import type { Kundli } from '../types/kundli.types';

export const kundliService = {
  async generate(): Promise<Kundli> {
    const { data } = await api.post<Kundli>('/kundli/generate', {});
    return data;
  },

  async getLatest(): Promise<Kundli | null> {
    try {
      const { data } = await api.get<Kundli>('/kundli/latest');
      return data;
    } catch {
      return null; // 404 = no kundli generated yet, not a real error
    }
  },
};