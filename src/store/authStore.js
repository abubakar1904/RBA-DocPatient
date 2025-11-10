import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,

      login: (token, user, role) => {
        set({ token, user, role, isAuthenticated: true });
      },

      logout: () => {
        set({ token: null, user: null, role: null, isAuthenticated: false });
        localStorage.clear();
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },
    }),
    {
      name: "auth-storage",
    }
  )
);


