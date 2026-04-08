import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';
import { mockUsers } from '../data/mock';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, _password: string) => {
        // Demo: find user by email in mock data
        const found = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
          set({ user: found, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'superdental-auth',
    }
  )
);

export const getRoleLabel = (role: UserRole): string => {
  const labels = { admin: 'Administrador', manager: 'Gestor', employee: 'Colaborador' };
  return labels[role];
};
