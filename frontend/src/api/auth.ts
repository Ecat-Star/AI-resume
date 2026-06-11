import request from '@/utils/request'

// 注册：用户名 + 密码
export const register = (data: { username: string; password: string }) =>
  request.post('/auth/register', data)

// 登录：用户名 + 密码
export const login = (data: { username: string; password: string }) =>
  request.post('/auth/login', data)
