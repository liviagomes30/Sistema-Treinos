import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let _token: string | null = null;

export function setApiToken(token: string | null) {
  _token = token;
}

api.interceptors.request.use(
  (config) => {
    if (_token) {
      config.headers.Authorization = `Bearer ${_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      _token = null;
      await Promise.all([
        Preferences.remove({ key: 'token' }),
        Preferences.remove({ key: 'user' }),
      ]);
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  },
);

export default api;
