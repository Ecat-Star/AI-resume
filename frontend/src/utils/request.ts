/**
 * Axios 请求封装
 * 作用：统一配置请求基础路径、超时时间、token 携带、错误处理
 * 关键点：响应拦截器 return response.data 会"解包"一层，
 *         所以组件里拿到的 res 直接就是后端返回的 JSON 数据，不需要再 res.data
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',     // 所有请求自动加 /api 前缀，由 vite 代理到后端
  timeout: 120000      // 超时 2 分钟（AI 分析可能比较慢）
})

// 请求拦截器：每次请求自动带上 token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  // 成功时直接返回 data，组件不用再 .data
  (response) => response.data,
  (error) => {
    // 401 未授权：统一处理跳转登录
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      ElMessage.error('登录已过期，请重新登录')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    // 其他错误：不在这里弹提示，让组件自行处理
    return Promise.reject(error)
  }
)

export default request
