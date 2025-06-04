import {create} from 'zustand';
import {api} from '../api/client';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  signUp: async (data) => {
    set({isLoading: true, error: null});
    try {
      const response = await api.post('/auth/signup', data);
      const {token, user} = response.data;
      localStorage.setItem('token', token);
      set({user, token, isLoading: false});
    } catch (error: any) {
      set({error: error.response?.data?.message || 'Failed to sign up', isLoading: false});
      throw error;
    }
  },

  signIn: async (data) => {
    set({isLoading: true, error: null});
    try {
      const response = await api.post('/auth/signin', data);
      const {token, user} = response.data;
      localStorage.setItem('token', token);
      set({user, token, isLoading: false});
    } catch (error: any) {
      set({error: error.response?.data?.message || 'Failed to sign in', isLoading: false});
      throw error;
    }
  },

  signOut: () => {
    localStorage.removeItem('token');
    set({user: null, token: null});
  },
}))
