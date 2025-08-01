import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/styles/main.scss'

console.log('🚀 Starting ERP Database Update Tool...')

try {
  const app = createApp(App)
  app.use(createPinia())
  app.mount('#app')
  console.log('✅ App mounted successfully!')
} catch (error) {
  console.error('❌ Failed to mount app:', error)
}