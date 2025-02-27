<template>
    <div class="flex justify-center items-center h-screen bg-gray-200">
        <div class="bg-white p-6 rounded shadow-md w-96">
            <h2 class="text-2xl font-bold mb-4">用户注册</h2>

            <input v-model="username" type="text" placeholder="用户名" class="w-full border p-2 mb-2" />
            <p v-if="errors.username" class="text-red-500 text-sm">{{ errors.username }}</p>

            <input v-model="password" type="password" placeholder="密码" class="w-full border p-2 mb-2" />
            <p v-if="errors.password" class="text-red-500 text-sm">{{ errors.password }}</p>

            <button @click="register" :disabled="isSubmitting"
                class="w-full bg-green-500 text-white p-2 rounded mt-2 disabled:opacity-50">
                注册
            </button>

            <p v-if="serverError" class="text-red-500 mt-2">{{ serverError }}</p>

            <router-link to="/login" class="block text-center mt-2 text-blue-600">已有账号？登录</router-link>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const errors = ref({ username: "", password: "" });
const serverError = ref("");
const isSubmitting = ref(false);
const router = useRouter();

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

async function register() {
    if (!validateForm()) return;

    isSubmitting.value = true;
    serverError.value = "";

    try {
        const response = await fetch("http://localhost:3001/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username.value, password: password.value }),
        });

        const data = await response.json();

        if (response.ok) {
            router.push("/login");
        } else {
            serverError.value = data.error || "注册失败，请重试";
        }
    } catch (error) {
        serverError.value = "服务器错误，请稍后重试";
    } finally {
        isSubmitting.value = false;
    }
}
</script>