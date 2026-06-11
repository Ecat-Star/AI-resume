import request from '@/utils/request'

// 创建简历（粘贴文本）
export const createResume = (data: { originalText: string; jobDescription: string }) =>
  request.post('/resume/create', data)

// 获取历史记录
export const getHistory = () => request.get('/resume/history')

// 获取简历详情
export const getResumeById = (id: string) => request.get(`/resume/${id}`)

// 流式分析接口地址（前端用 fetch 调用，不走 axios）
export const analyzeResumeStream = (id: string) => `/api/resume/${id}/analyze-stream`

// 删除简历
export const deleteResume = (id: string) => request.delete(`/resume/${id}`)
