import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: string;
  staffId?: string | null;
  patientId?: string | null;
  preferredLanguage?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setTokens: (accessToken: string) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: '',
      isAuthenticated: false,

      setUser: (user) => set({ user }),

      setTokens: (accessToken) => set({ accessToken }),

      login: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: '',
          isAuthenticated: false,
        }),
    }),
    {
      name: 'medicare-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
