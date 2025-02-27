<template>
    <div class="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
        <h2 class="text-2xl font-bold mb-4">个人中心</h2>

        <div class="flex items-center">
            <img v-if="avatarUrl" :src="avatarUrl" class="w-20 h-20 rounded-full border" alt="头像" />
            <label class="ml-4 cursor-pointer bg-blue-500 text-white px-3 py-1 rounded">
                上传头像
                <input type="file" @change="uploadAvatar" class="hidden" />
            </label>
        </div>

        <h3 class="text-lg font-semibold mt-4">修改密码</h3>
        <input v-model="oldPassword" type="password" placeholder="旧密码" class="w-full border p-2 mb-2" />
        <input v-model="newPassword" type="password" placeholder="新密码" class="w-full border p-2 mb-2" />
        <button @click="changePassword" class="w-full bg-blue-500 text-white p-2 rounded mt-2">
            修改密码
        </button>
        <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
        <p v-if="success" class="text-green-500 mt-2">密码修改成功！</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const username = ref("");
const oldPassword = ref("");
const newPassword = ref("");
const error = ref("");
const success = ref("");
const avatarUrl = ref("");

onMounted(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch("http://localhost:3001/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('onMounted', response);
        

        if (response.ok) {
            const data = await response.json();
            username.value = data.username;
            avatarUrl.value = `http://localhost:3001/auth/avatar/${username.value}`;
        } else {
            localStorage.removeItem("token");
        }
    } catch (error) {
        localStorage.removeItem("token");
    }
});

async function uploadAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:3001/auth/upload-avatar", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }, // ✅ 需要 Authorization 头
            body: formData,
        });

        const data = await response.json();
        if (response.success) {
            // ✅ 直接使用相对路径，避免 CORS 问题
            avatarUrl.value = `http://localhost:3001${data.avatarUrl}`;
        } else {
            error.value = data.error;
        }
    } catch (err) {
        error.value = "头像上传失败，请稍后重试";
    }
}


</script>