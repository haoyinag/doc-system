<template>
    <nav class="bg-gray-800 p-4 text-white flex justify-between items-center">
        <router-link to="/" class="font-bold">文档管理</router-link>
        <div class="flex items-center">
            <router-link v-if="isAuthenticated" to="/profile" class="bg-yellow-500 px-3 py-1 rounded">个人中心</router-link>
            <img v-if="avatarUrl" :src="avatarUrl" class="w-10 h-10 rounded-full border ml-3" alt="头像" />
            <router-link v-if="!isAuthenticated" to="/login" class="bg-blue-500 px-3 py-1 rounded ml-2">登录</router-link>
            <router-link v-if="!isAuthenticated" to="/register"
                class="bg-green-500 px-3 py-1 rounded ml-2">注册</router-link>
            <button v-else @click="logout" class="bg-red-500 px-3 py-1 rounded ml-2">退出</button>
        </div>
    </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const isAuthenticated = ref(false);
const avatarUrl = ref("");
const router = useRouter();

onMounted(() => {
    isAuthenticated.value = !!localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (username) {
        avatarUrl.value = `http://localhost:3001/auth/avatar/${username}`;
    }
});

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    isAuthenticated.value = false;
    router.push("/login");
}
</script>