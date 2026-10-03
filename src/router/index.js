import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '../stores/auth.js'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'home' } },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: 'login' }
  }

  if (to.name === 'login' && isLoggedIn.value) {
    return { name: 'home' }
  }
})

export default router
