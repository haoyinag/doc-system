<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

const isAuthenticated = ref(false);
const router = useRouter();
const route = useRoute();

// 监听用户登录状态
onMounted(() => {
  isAuthenticated.value = !!localStorage.getItem('token');

  // 如果未登录并且当前不是在 /login 页面，则跳转到 /login
  if (!isAuthenticated.value && route.path !== '/login') {
    router.push('/login');
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 只有登录后才显示导航栏 -->
    <Navbar v-if="isAuthenticated" />

    <div class="">
      <!-- router-view 必须始终存在，否则 /login 可能无法正确渲染 -->
      <router-view />
    </div>
  </div>
</template>
