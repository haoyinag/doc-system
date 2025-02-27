<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">{{ docTitle }}</h1>

        <label class="block text-gray-700 font-bold mb-2" for="document-content">文档内容：</label>
        <textarea id="document-content" v-model="content" class="w-full border p-2 rounded min-h-[200px]"
            readonly></textarea>

        <button @click="editDocument" class="bg-blue-500 text-white px-3 py-1 rounded mt-4">编辑</button>
        <button @click="saveDocument" class="bg-green-500 text-white px-3 py-1 rounded mt-4 ml-2"
            v-if="isEditing">保存</button>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import { fetchWithAuth } from "../store/fetchWithAuth";

const route = useRoute();
const router = useRouter();
const docId = route.params.id;
const docTitle = ref("加载中...");
const content = ref("");
const isEditing = ref(false);
const authStore = useAuthStore();

async function loadDocument() {
    const response = await fetchWithAuth(`http://localhost:3001/api/documents/${docId}`);
    const doc = await response.json();

    if (response.success) {
        docTitle.value = doc.title;
        content.value = doc.content || "";
    } else {
        alert("加载文档失败");
        router.push("/"); // 重定向回文档列表
    }
}

function editDocument() {
    isEditing.value = true;
    document.getElementById("document-content").removeAttribute("readonly");
}

async function saveDocument() {
    isEditing.value = false;
    document.getElementById("document-content").setAttribute("readonly", "true");

    const response = await fetchWithAuth(`http://localhost:3001/api/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": authStore.token },
        body: JSON.stringify({ content: content.value }),
    });

    if (response.success) {
        alert("文档已保存！");
    } else {
        alert("保存失败，请重试");
    }
}

onMounted(() => {
    loadDocument();
});
</script>

<style>
/* ✅ 简化样式 */
textarea {
    font-size: 16px;
    line-height: 1.6;
    resize: vertical;
}
</style>