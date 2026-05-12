export interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

export interface LoginData {
  email: string;
  password?: string; // password opcional para login social ou similar, mas geralmente obrigatório
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ExerciseCatalogItem {
  _id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  instructions: string | null;
  image_url: string | null;
  is_active: boolean;
  is_system: boolean;
  created_by_user_id: string | null;
}


export interface Workout {
  _id: string;
  name: string;
  description: string | null;
}

export interface Exercise {
  _id: string;
  workout_id: string;
  exercise_catalog_id: string;
  name: string;
  muscle_group: string;
  set_type: string;
  series: number;
  reps: number;
  weight_kg: number;
  rest_seconds: number;
  order: number;
}

export interface ExerciseLog {
  series: number;
  reps_done: number;
  weight_used: number;
}

export interface SessionExercise {
  exercise_id: string;
  logs: ExerciseLog[];
}

export interface Session {
  _id: string;
  user_id?: string;
  workout_id: string;
  workoutName?: string;
  started_at: string;
  status: 'completed';
  exercises?: SessionExercise[];
}
