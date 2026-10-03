import { readonly, ref } from 'vue'

const STORAGE_KEY = 'vue-demo-logged-in'
const loggedIn = ref(localStorage.getItem(STORAGE_KEY) === 'true')

export const isLoggedIn = readonly(loggedIn)

export function login() {
  localStorage.setItem(STORAGE_KEY, 'true')
  loggedIn.value = true
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
  loggedIn.value = false
}
