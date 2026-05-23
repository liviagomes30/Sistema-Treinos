import api from './api';
import type { Workout, Exercise } from '../types';

export const workoutService = {
  async getAll(): Promise<Workout[]> {
    const response = await api.get<Workout[]>('/workouts');
    return response.data;
  },

  async getById(id: string): Promise<Workout> {
    const response = await api.get<Workout>(`/workouts/${id}`);
    return response.data;
  },

  async create(data: Partial<Workout>): Promise<Workout> {
    const response = await api.post<Workout>('/workouts', data);
    return response.data;
  },

  async update(id: string, data: Partial<Workout>): Promise<Workout> {
    const response = await api.put<Workout>(`/workouts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/workouts/${id}`);
  },

  // Workout Exercises
  async getExercises(workoutId: string): Promise<Exercise[]> {
    const response = await api.get<Exercise[]>(`/workouts/${workoutId}/exercises`);
    return response.data;
  },

  async addExercise(workoutId: string, data: Partial<Exercise>): Promise<Exercise> {
    const response = await api.post<Exercise>(`/workouts/${workoutId}/exercises`, data);
    return response.data;
  },

  async updateExercise(workoutId: string, id: string, data: Partial<Exercise>): Promise<Exercise> {
    const response = await api.put<Exercise>(`/workouts/${workoutId}/exercises/${id}`, data);
    return response.data;
  },

  async removeExercise(workoutId: string, id: string): Promise<void> {
    await api.delete(`/workouts/${workoutId}/exercises/${id}`);
  },

  async getLastLoads(workoutId: string): Promise<Record<string, { set_number: number; reps_done: number; weight_used_kg: number }[]>> {
    const response = await api.get(`/workouts/${workoutId}/last-loads`);
    return response.data;
  },
};
