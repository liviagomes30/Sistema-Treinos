import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useAuthStore } from './store/authStore'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

const authStore = useAuthStore()
authStore.restoreAuthFromStorage().then(() => {
  app.use(router)
  app.mount('#app')
})
