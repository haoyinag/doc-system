<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">我的文档</h1>
        <ul>
            <li v-for="doc in documents" :key="doc.id" class="mb-2">
                <router-link :to="'/editor/' + doc.id" class="text-blue-600">
                    {{ doc.title }}
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useDocumentStore } from '../store/index.js';

const store = useDocumentStore();
onMounted(() => {
    store.fetchDocuments();
});
</script>