/**
 * 简历状态管理（Pinia Store）
 * 作用：管理当前简历的分析数据和历史记录
 * 数据流：组件调用 action → action 调 API → 更新 state → 页面响应式更新
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ResumeItem } from '@/types'
import { getHistory, getResumeById } from '@/api/resume'

export const useResumeStore = defineStore('resume', () => {
  // ===== 状态 =====
  const originalText = ref('')           // 原始简历文本
  const jobDescription = ref('')         // 岗位描述
  const matchScore = ref<number | null>(null)  // 匹配分数
  const missingKeywords = ref<string[]>([])    // 缺失关键词
  const suggestions = ref<string[]>([])        // 优化建议
  const optimizedResume = ref('')              // 优化后的简历
  const historyList = ref<ResumeItem[]>([])    // 历史记录列表
  const currentResume = ref<ResumeItem | null>(null)  // 当前查看的简历

  // ===== 方法 =====

  // 获取历史记录列表
  const fetchHistory = async () => {
    try {
      const res: any = await getHistory()
      historyList.value = res
    } catch {}
  }

  // 根据 ID 获取简历详情，同时更新所有状态
  const fetchResumeById = async (id: string) => {
    try {
      const res: any = await getResumeById(id)
      currentResume.value = res
      originalText.value = res.originalText || ''
      jobDescription.value = res.jobDescription || ''
      matchScore.value = res.matchScore
      missingKeywords.value = res.missingKeywords || []
      suggestions.value = res.suggestions || []
      optimizedResume.value = res.optimizedResume || ''
    } catch {}
  }

  // 重置当前状态（切换简历时调用）
  const resetCurrent = () => {
    originalText.value = ''
    jobDescription.value = ''
    matchScore.value = null
    missingKeywords.value = []
    suggestions.value = []
    optimizedResume.value = ''
    currentResume.value = null
  }

  return {
    originalText, jobDescription, matchScore, missingKeywords,
    suggestions, optimizedResume, historyList, currentResume,
    fetchHistory, fetchResumeById, resetCurrent
  }
})
