<template>
    <div class="flex justify-center items-center h-screen bg-gray-200">
        <div class="bg-white p-6 rounded shadow-md w-96">
            <h2 class="text-2xl font-bold mb-4">用户登录</h2>

            <input v-model="username" type="text" placeholder="用户名" class="w-full border p-2 mb-2" />
            <p v-if="errors.username" class="text-red-500 text-sm">{{ errors.username }}</p>

            <input v-model="password" type="password" placeholder="密码" class="w-full border p-2 mb-2" />
            <p v-if="errors.password" class="text-red-500 text-sm">{{ errors.password }}</p>

            <button @click="login" :disabled="isSubmitting"
                class="w-full bg-blue-500 text-white p-2 rounded mt-2 disabled:opacity-50">
                登录
            </button>
            <button @click="register" :disabled="isSubmitting"
                class="w-full bg-blue-500 text-white p-2 rounded mt-2 disabled:opacity-50">
                注册
            </button>

            <p v-if="serverError" class="text-red-500 mt-2">{{ serverError }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const username = ref("");
const password = ref("");
const errors = ref({ username: "", password: "" });
const serverError = ref("");
const isSubmitting = ref(false);
const router = useRouter();
const authStore = useAuthStore();

// 校验输入
function validateForm() {
    errors.value = { username: "", password: "" };
    let isValid = true;

    if (!username.value.trim()) {
        errors.value.username = "用户名不能为空";
        isValid = false;
    }

    if (!password.value.trim()) {
        errors.value.password = "密码不能为空";
        isValid = false;
    }

    return isValid;
}


function register() {
    router.push("/register");
}

// 处理登录请求
async function login() {
    if (!validateForm()) return;

    isSubmitting.value = true;
    serverError.value = "";

    try {
        const response = await fetch("http://localhost:3001/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username.value, password: password.value }),
        });

        const data = await response.json();

        if (response.ok) {
            await authStore.login(username.value, password.value);
            localStorage.setItem("token", data.token);
            router.push("/");
        } else {
            serverError.value = data.error || "登录失败，请检查用户名和密码";
        }
    } catch (error) {
        serverError.value = "服务器错误，请稍后重试";
    } finally {
        isSubmitting.value = false;
    }
}
</script>