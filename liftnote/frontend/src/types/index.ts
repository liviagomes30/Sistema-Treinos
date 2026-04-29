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

export interface ExerciseCatalogRef {
  _id: string;
  name: string;
  muscle_group: string;
}

export interface WorkoutExerciseRef {
  _id: string;
  custom_name?: string;
  set_type?: string;
  order?: number;
  exercise_catalog_id: ExerciseCatalogRef;
}

export interface ExerciseLog {
  _id: string;
  session_id: string;
  workout_exercise_id: WorkoutExerciseRef;
  set_number: number;
  reps_done: number;
  weight_used_kg: number;
  logged_at: string;
  notes?: string | null;
  volume?: number;
}

export interface WorkoutRef {
  _id: string;
  name: string;
  description?: string | null;
}

export interface Session {
  _id: string;
  user_id?: string;
  workout_id: string | WorkoutRef;
  started_at: string;
  finished_at?: string | null;
  duration_seconds?: number | null;
  duration_formatted?: string | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  ai_summary?: string | null;
  logs?: ExerciseLog[];
}
