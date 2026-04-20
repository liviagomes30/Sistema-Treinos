import api from './api';
import type { Session } from '../types';

export const sessionService = {
  async getAll(params: Record<string, any> = {}): Promise<Session[]> {
    const response = await api.get<{ data: Session[] }>('/sessions', { params });
    // O backend retorna { data: [...], total, page, limit }
    return response.data.data;
  },

  async getById(id: string): Promise<Session> {
    const response = await api.get<Session>(`/sessions/${id}`);
    return response.data;
  },

  async create(data: Partial<Session>): Promise<Session> {
    const response = await api.post<Session>('/sessions', data);
    return response.data;
  },

  async update(id: string, data: Partial<Session>): Promise<Session> {
    const response = await api.put<Session>(`/sessions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/sessions/${id}`);
  },

  // Logs
  async addLog(sessionId: string, data: any): Promise<any> {
    const response = await api.post(`/sessions/${sessionId}/logs`, data);
    return response.data;
  },

  async updateLog(sessionId: string, logId: string, data: any): Promise<any> {
    const response = await api.put(`/sessions/${sessionId}/logs/${logId}`, data);
    return response.data;
  },

  async removeLog(sessionId: string, logId: string): Promise<void> {
    await api.delete(`/sessions/${sessionId}/logs/${logId}`);
  }
};
