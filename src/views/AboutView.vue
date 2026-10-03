<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="content-card">
    <span class="eyebrow">ABOUT</span>
    <h1>关于这个 Demo</h1>
    <p class="description">一个简单的 Vue 3 示例，演示页面路由和模拟登录。</p>
    <div class="info-panel">
      <h2>它是怎么工作的？</h2>
      <p>未登录时隐藏导航，并提示登录。点击右上角「登录」后，统一进入 Home。</p>
      <p>登录状态保存在 localStorage 中；点击「退出登录」会清除状态，并回到登录提示页。</p>
    </div>
    <RouterLink class="text-link" to="/home">
      返回 Home
      <span aria-hidden="true">→</span>
    </RouterLink>
  </section>
</template>
