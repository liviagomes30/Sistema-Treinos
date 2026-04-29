import api from './api';
import type { Session } from '../types';

export interface SessionQuery {
  workout_id?: string;
  status?: string;
  page?: number;
  limit?: number;
  date_from?: string;
  date_to?: string;
  include_logs?: boolean;
}

export const sessionService = {
  async getAll(params: SessionQuery = {}): Promise<Session[]> {
    const query: Record<string, any> = { ...params };
    if (params.include_logs !== undefined) {
      query.include_logs = params.include_logs ? 'true' : 'false';
    }
    const response = await api.get<{ data: Session[] }>('/sessions', { params: query });
    return response.data.data;
  },

  async getByMonth(year: number, month: number): Promise<Session[]> {
    const date_from = new Date(year, month - 1, 1).toISOString();
    const date_to = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
    return sessionService.getAll({ date_from, date_to, include_logs: true, limit: 200 });
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
