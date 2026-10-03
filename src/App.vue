<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { isLoggedIn, login } from './stores/auth.js'
import { logoutAndNavigate } from './router/index.js'

const router = useRouter()

async function toggleLogin() {
  if (isLoggedIn.value) {
    await logoutAndNavigate()
  } else {
    login()
    await router.replace({ name: 'home' })
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <div class="brand"><span class="brand-mark" aria-hidden="true">V</span> Vue Demo</div>
      <div class="header-actions">
        <span class="login-status" role="status">
          <span class="status-dot" :class="{ online: isLoggedIn }" aria-hidden="true"></span>
          {{ isLoggedIn ? '已登录' : '未登录' }}
        </span>
        <button class="auth-button" type="button" @click="toggleLogin">
          {{ isLoggedIn ? '退出登录' : '登录' }}
        </button>
      </div>
    </header>

    <div class="page-container">
      <nav v-if="isLoggedIn" class="navigation" aria-label="页面导航">
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
      <main>
        <RouterView />
      </main>
      <footer>Vue 3 + Vue Router · 模拟登录演示</footer>
    </div>
  </div>
</template>
