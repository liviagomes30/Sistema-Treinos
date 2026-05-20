import api from './api';
import type { GymPlace } from '../types';

export const placesService = {
  async searchGyms(params: { lat?: number; lng?: number; city?: string }): Promise<GymPlace[]> {
    const response = await api.get<{ data: GymPlace[] }>('/places/gyms', { params });
    return response.data.data;
  },
};
