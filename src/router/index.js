import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn, logout } from '../stores/auth.js'
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

let logoutNavigationPending = false

export async function logoutAndNavigate() {
  if (logoutNavigationPending) return

  logoutNavigationPending = true
  try {
    // Keep authentication intact until the page's leave guard allows navigation.
    const failure = await router.replace({ name: 'login' })
    if (!failure && router.currentRoute.value.name === 'login') {
      logout()
    }
  } finally {
    logoutNavigationPending = false
  }
}

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: 'login' }
  }

  if (to.name === 'login' && isLoggedIn.value && !logoutNavigationPending) {
    return { name: 'home' }
  }
})

export default router
