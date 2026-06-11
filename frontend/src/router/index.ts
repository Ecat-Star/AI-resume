/**
 * 路由配置
 * 作用：定义页面路径和对应组件，配置路由守卫做登录拦截
 */
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue')
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }  // 需要登录才能访问
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('@/views/HistoryList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/result/:id',          // :id 是动态参数，表示简历 ID
      name: 'Result',
      component: () => import('@/views/ResultPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/dashboard'        // 根路径重定向到首页
    }
  ]
})

// 路由守卫：未登录时跳转到登录页
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  // 如果目标路由需要登录，且当前没有 token，则跳转到登录页
  // && 逻辑与符，当两个条件都为 true 时，结果为 true
  // 当任意一个条件为 false 时，结果为 false
  // 所以，这里判断目标路由是否需要登录，且当前没有 token
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
