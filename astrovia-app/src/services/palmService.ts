/**
 * Palm scan API calls. Uploads image as multipart/form-data.
 * Photos always come from the device camera (expo-camera), which
 * captures as JPEG — so we hardcode the type rather than guessing
 * from the URI, which can be unreliable across platforms.
 */
import { api } from './api';
import type { PalmReading } from '../types/palm.types';

export const palmService = {
  async scanPalm(imageUri: string): Promise<PalmReading> {
    const formData = new FormData();

    formData.append('file', {
      uri: imageUri,
      name: 'palm.jpg',
      type: 'image/jpeg',
    } as any);

    const { data } = await api.post<PalmReading>('/palm/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return data;
  },

  async getReading(readingId: string): Promise<PalmReading> {
    const { data } = await api.get<PalmReading>(`/palm/reading/${readingId}`);
    return data;
  },
};