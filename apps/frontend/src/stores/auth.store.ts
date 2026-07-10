import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@learnflow/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  guestId: string | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  updateUser: (partial: Partial<User>) => void;
  setGuest: (isGuest: boolean, guestId?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isGuest: false,
      guestId: null,
      setAccessToken: (token) => set({ accessToken: token, isAuthenticated: !!token }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateUser: (partial) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...partial } });
      },
      setGuest: (isGuest, guestId) => set({ isGuest, guestId: guestId ?? null, isAuthenticated: !isGuest }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false, isGuest: false, guestId: null }),
    }),
    {
      name: 'learnflow-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        guestId: state.guestId,
      }),
    }
  )
);
