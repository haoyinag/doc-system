<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">我的文档</h1>

        <button @click="createDocument" class="bg-blue-500 text-white px-3 py-1 rounded mb-4">新建文档</button>

        <ul v-if="documents.length">
            <li v-for="doc in documents" :key="doc.id" class="flex justify-between items-center border-b p-2">
                <router-link :to="'/editor/' + doc.id" class="text-blue-600 hover:underline flex-1">{{ doc.title
                }}</router-link>
                <button v-if="doc.owner === currentUser" @click="deleteDocument(doc.id)"
                    class="text-red-500 ml-4">删除</button>
            </li>
        </ul>

        <p v-else class="text-gray-500">暂无文档</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth"; // ✅ 获取当前登录用户
import { fetchWithAuth } from "../store/fetchWithAuth";

const router = useRouter();
const authStore = useAuthStore();
const documents = ref([]);
const currentUser = ref(authStore.username); // ✅ 获取当前用户

async function fetchDocuments() {
    const response = await fetchWithAuth("http://localhost:3001/api/documents");
    if (response.ok) {
        const docs = await response.json();

        documents.value = docs.reverse();
    } else {
        alert("加载文档列表失败");
    }
}

async function createDocument() {
    const title = prompt("请输入文档标题");
    if (!title) return;

    const response = await fetchWithAuth("http://localhost:3001/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": authStore.token },
        body: JSON.stringify({ title, content: "" }),
    });

    if (response.ok) {
        const newDoc = await response.json();
        documents.value.unshift(newDoc);
        router.push(`/editor/${newDoc.id}`);
    } else {
        alert("创建失败，请重试");
    }
}

async function deleteDocument(id) {
    if (!confirm("确定要删除这个文档吗？")) return;

    const response = await fetchWithAuth(`http://localhost:3001/api/documents/${id}`, {
        method: "DELETE",
        headers: { "Authorization": authStore.token },
    });

    if (response.ok) {
        documents.value = documents.value.filter(doc => doc.id !== id);
    } else if (response.status === 403) {
        alert("无权限删除此文档");
    } else {
        alert("删除失败");
    }
}

onMounted(() => {
    fetchDocuments();
});
</script>