import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    username: localStorage.getItem("username") || null,
    token: localStorage.getItem("token") || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token, // ✅ 判断用户是否已登录
  },

  actions: {
    async login(username, password) {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        this.username = username;
        this.token = data.token;
        localStorage.setItem("username", username);
        localStorage.setItem("token", data.token);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || "登录失败");
      }
    },

    async register(username, password) {
      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        return this.login(username, password);
      } else {
        const error = await response.json();
        throw new Error(error.message || "注册失败");
      }
    },

    logout() {
      this.username = null;
      this.token = null;
      localStorage.removeItem("username");
      localStorage.removeItem("token");
    },
  },
});
