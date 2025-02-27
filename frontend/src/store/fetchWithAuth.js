import { useAuthStore } from "./auth";
import { useRouter } from "vue-router";

export async function fetchWithAuth(url, options = {}) {
  const authStore = useAuthStore();
  const router = useRouter();

  // **自动附加 Authorization 头**
  if (authStore.token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${authStore.token}`,
    };
  }

  try {
    const response = await fetch(url, options);

    // **如果 token 过期或无效，自动登出**
    if (response.status === 401) {
      authStore.logout();
      router.push("/login");
      throw new Error("登录已过期，请重新登录");
    }

    return response;
  } catch (error) {
    console.error("请求错误:", error);
    throw error;
  }
}
