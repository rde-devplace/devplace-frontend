import { createRouter, createWebHistory } from 'vue-router'
import Main from '@/components/Main.vue'
import Wetty from '@/components/Wetty.vue'

const routes = [
  {
    path: '/path-to-wetty',
    name: 'Wetty',
    component: () => import('@/components/Wetty.vue'),
  },
  {
    path: '/kube',
    component: Main,
  },
  {
    path: '/',
    component: Wetty,
  },
]

const router = createRouter({
  history: createWebHistory('/console/'),
  routes,
})

export default router

