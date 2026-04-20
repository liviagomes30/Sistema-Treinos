import api from './api';
import type { ExerciseCatalogItem } from '../types';

export const exerciseService = {
  async getAll(params: Record<string, any> = {}): Promise<ExerciseCatalogItem[]> {
    const response = await api.get<ExerciseCatalogItem[]>('/catalog', { params });
    return response.data;
  },

  async getById(id: string): Promise<ExerciseCatalogItem> {
    const response = await api.get<ExerciseCatalogItem>(`/catalog/${id}`);
    return response.data;
  },

  async getHistory(catalogId: string): Promise<any[]> {
    const response = await api.get(`/catalog/${catalogId}/history`);
    return response.data;
  }
};
