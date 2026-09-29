import { create } from "zustand";
import api from "../lib/axios";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null, user: null, token: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    try {
      const response = await api.post("/users/login", { email, password });
      const { token, ...user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token, isLoading: false, error: null });
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "Login failed",
        isLoading: false,
        user: null,
        token: null,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
