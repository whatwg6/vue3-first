<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="content-card">
    <span class="eyebrow">HOME</span>
    <h1>欢迎来到首页</h1>
    <p class="description">你已经登录，现在可以自由访问 Home 和 About 页面。</p>
    <div class="info-panel">
      <h2>试一试</h2>
      <p>切换页面，体验路由跳转；点击右上角「退出登录」，查看未登录时的提示。</p>
      <p>登录状态会保存在 localStorage 中，刷新页面也不会退出登录。</p>
    </div>
    <RouterLink class="text-link" to="/about"
      >前往 About <span aria-hidden="true">→</span></RouterLink
    >
  </section>
</template>
