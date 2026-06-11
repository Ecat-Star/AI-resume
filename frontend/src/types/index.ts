export interface UserInfo {
  id: string
  username: string
}

export interface AuthResponse {
  message: string
  token: string
  user: UserInfo
}

// 简历记录
export interface ResumeItem {
  _id: string
  userId: string
  originalText: string
  jobDescription: string
  matchScore: number | null
  missingKeywords: string[]
  analysisResult: string
  suggestions: string[]
  optimizedResume: string
  createdAt: string
}

// AI 分析结果
export interface AnalysisResult {
  matchScore: number
  missingKeywords: string[]
  analysisResult: string
  suggestions: string[]
  optimizedResume: string
}
