/**
 * Palm reading history API calls.
 */
import { api } from './api';
import type { PalmReading } from '../types/palm.types';

export const historyService = {
  async listReadings(limit = 20, offset = 0): Promise<PalmReading[]> {
    const { data } = await api.get<PalmReading[]>('/history/readings', {
      params: { limit, offset },
    });
    return data;
  },
};