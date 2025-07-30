import { createRouter, createWebHistory } from 'vue-router'

// Lazy load HomePage
const HomePage = () => import('../views/HomePage.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'ERP Database Update Tool'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guards
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = to.meta.title || 'ERP Database Update Tool'
  next()
})

console.log('✅ Router configured successfully')

export default router