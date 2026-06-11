<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">分析结果</h1>
        <div class="flex gap-3">
          <router-link to="/dashboard">
            <el-button plain>返回首页</el-button>
          </router-link>
          <router-link to="/history">
            <el-button type="info" plain>历史记录</el-button>
          </router-link>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="text-center py-20">
        <el-icon class="is-loading" :size="48"><Loading /></el-icon>
        <p class="mt-4 text-gray-500 text-lg">加载中...</p>
      </div>

      <!-- 未找到数据 -->
      <div v-else-if="!resumeStore.currentResume" class="text-center py-20">
        <el-icon :size="64" class="text-gray-300"><WarningFilled /></el-icon>
        <p class="mt-4 text-gray-500 text-lg">未找到简历数据</p>
        <router-link to="/dashboard">
          <el-button type="primary" class="mt-4">返回首页</el-button>
        </router-link>
      </div>

      <!-- 主要内容 -->
      <div v-else>
        <!-- 岗位匹配度 -->
        <el-card shadow="hover" class="mb-6">
          <div class="flex flex-col md:flex-row items-center gap-8 p-4">
            <!-- 环形图 -->
            <div class="flex flex-col items-center flex-shrink-0">
              <el-progress
                type="circle"
                :percentage="resumeStore.matchScore || 0"
                :width="150"
                :color="scoreColor"
                :stroke-width="12"
              >
                <template #default>
                  <div class="text-center">
                    <span class="text-3xl font-black" :style="{ color: scoreColor }">
                      {{ resumeStore.matchScore ?? '--' }}
                    </span>
                    <span class="text-sm text-gray-400 block mt-1">分</span>
                  </div>
                </template>
              </el-progress>
              <p class="mt-3 text-gray-700 font-semibold">岗位匹配度</p>
            </div>

            <!-- 匹配度详情 -->
            <div class="flex-1 w-full">
              <div class="flex items-center gap-3 mb-4">
                <el-tag :type="scoreTagType" size="large" effect="dark" round>
                  {{ scoreLabel }}
                </el-tag>
                <span class="text-sm text-gray-400">基于 AI 对简历与岗位 JD 的深度分析</span>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">综合匹配度</span>
                  <span class="font-medium" :style="{ color: scoreColor }">{{ resumeStore.matchScore || 0 }}%</span>
                </div>
                <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700" :style="{ width: (resumeStore.matchScore || 0) + '%', background: scoreGradient }"></div>
                </div>
              </div>
            </div>

            <!-- 缺失关键词 -->
            <div class="flex-shrink-0 w-full md:w-64">
              <div class="flex items-center gap-2 mb-3">
                <el-icon color="#f56c6c"><WarningFilled /></el-icon>
                <span class="font-semibold text-gray-700">缺失关键词</span>
                <el-tag v-if="resumeStore.missingKeywords.length > 0" size="small" type="danger" round class="ml-auto">{{ resumeStore.missingKeywords.length }}</el-tag>
              </div>
              <div v-if="resumeStore.missingKeywords.length > 0" class="flex flex-wrap gap-2">
                <el-tag v-for="keyword in resumeStore.missingKeywords" :key="keyword" type="danger" effect="light" round>{{ keyword }}</el-tag>
              </div>
              <p v-else-if="resumeStore.matchScore !== null" class="text-green-500 text-sm flex items-center gap-1">
                <el-icon><CircleCheckFilled /></el-icon>全部匹配
              </p>
              <p v-else class="text-gray-400 text-sm">点击下方按钮开始分析</p>
            </div>
          </div>
        </el-card>

        <!-- 优化建议 -->
        <el-card shadow="hover" class="mb-6">
          <template #header>
            <div class="flex items-center gap-2">
              <el-icon color="#667eea"><InfoFilled /></el-icon>
              <span class="font-bold text-gray-700">优化建议</span>
              <el-tag v-if="resumeStore.suggestions.length > 0" size="small" type="primary" round class="ml-2">{{ resumeStore.suggestions.length }} 条</el-tag>
            </div>
          </template>
          <div v-if="resumeStore.suggestions.length > 0" class="space-y-3">
            <div
              v-for="(suggestion, index) in resumeStore.suggestions"
              :key="index"
              class="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
            >
              <div class="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{{ index + 1 }}</div>
              <span class="text-sm flex-1 leading-relaxed text-gray-700">{{ suggestion }}</span>
            </div>
          </div>
          <p v-else class="text-gray-400 text-center py-4">暂无优化建议，请先进行 AI 分析</p>
        </el-card>

        <!-- AI 思考过程（流式分析时显示） -->
        <div v-if="thinkingText" class="mb-6">
          <el-card shadow="hover">
            <template #header>
              <div class="flex items-center gap-2">
                <el-icon v-if="analyzing" class="is-loading"><Loading /></el-icon>
                <el-icon v-else color="#67c23a"><CircleCheckFilled /></el-icon>
                <span class="font-bold">{{ analyzing ? 'AI 实时生成中...' : 'AI 分析思考过程' }}</span>
              </div>
            </template>
            <div class="whitespace-pre-wrap text-sm leading-relaxed max-h-64 overflow-y-auto p-4 bg-gray-50 rounded">
              {{ thinkingText }}
            </div>
          </el-card>
        </div>

        <!-- 原始简历 vs 优化后简历 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <el-card shadow="hover">
            <template #header>
              <div class="flex items-center gap-2">
                <el-icon><Document /></el-icon>
                <span class="font-bold">原始简历</span>
                <el-tag size="small" type="info" class="ml-auto">只读</el-tag>
              </div>
            </template>
            <div class="whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto p-4 bg-gray-50 rounded">
              {{ resumeStore.originalText }}
            </div>
          </el-card>

          <el-card shadow="hover">
            <template #header>
              <div class="flex items-center gap-2">
                <el-icon><Edit /></el-icon>
                <span class="font-bold">优化后简历</span>
                <el-tag size="small" type="success" class="ml-auto">可编辑</el-tag>
              </div>
            </template>
            <el-input
              v-model="editResume"
              type="textarea"
              :rows="16"
              placeholder="AI 优化后的简历内容将显示在这里，支持手动编辑..."
            />
          </el-card>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-center gap-4 pb-8">
          <el-button type="primary" @click="startAnalyze" :loading="analyzing">
            <el-icon class="mr-1"><Refresh /></el-icon>
            {{ resumeStore.matchScore !== null ? '重新分析' : 'AI 智能分析' }}
          </el-button>
          <el-button type="warning" @click="saveResult" :disabled="!editResume">
            <el-icon class="mr-1"><FolderChecked /></el-icon>
            保存记录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useResumeStore } from '@/stores/resume'
import { analyzeResumeStream } from '@/api/resume'
import { parseAIResponse } from '@/utils/aiParser'
import request from '@/utils/request'

const route = useRoute()
const resumeStore = useResumeStore()

// 页面状态
const loading = ref(true)           // 是否加载中
const analyzing = ref(false)        // 是否正在分析
const editResume = ref('')          // 可编辑的优化后简历
const thinkingText = ref('')        // AI 思考过程（给用户看的）

// 匹配度颜色
const scoreColor = computed(() => {
  const s = resumeStore.matchScore
  if (s === null) return '#909399'
  if (s >= 70) return '#67c23a'
  if (s >= 40) return '#e6a23c'
  return '#f56c6c'
})

const scoreGradient = computed(() => {
  const s = resumeStore.matchScore
  if (s === null) return 'linear-gradient(90deg, #909399, #b1b3b8)'
  if (s >= 70) return 'linear-gradient(90deg, #67c23a, #43e97b)'
  if (s >= 40) return 'linear-gradient(90deg, #e6a23c, #f56c6c)'
  return 'linear-gradient(90deg, #f56c6c, #fab6b6)'
})

const scoreLabel = computed(() => {
  const s = resumeStore.matchScore
  if (s === null) return '未分析'
  if (s >= 85) return '高度匹配'
  if (s >= 70) return '良好匹配'
  if (s >= 50) return '一般匹配'
  if (s >= 30) return '匹配较低'
  return '匹配度低'
})

const scoreTagType = computed(() => {
  const s = resumeStore.matchScore
  if (s === null) return 'info'
  if (s >= 70) return 'success'
  if (s >= 40) return 'warning'
  return 'danger'
})

// 加载简历数据
const loadResume = async () => {
  loading.value = true
  await resumeStore.fetchResumeById(route.params.id as string)
  editResume.value = resumeStore.optimizedResume
  loading.value = false
}

/**
 * 开始流式分析
 * 用 SSE 实时接收 AI 的思考过程和最终结果
 */
const startAnalyze = async () => {
  analyzing.value = true
  thinkingText.value = ''

  try {
    const token = localStorage.getItem('token')
    if (!token) { ElMessage.error('请先登录'); analyzing.value = false; return }

    // 用原生 fetch 调 SSE 接口（axios 不支持读流）
    const res = await fetch(analyzeResumeStream(route.params.id as string), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`请求失败 (${res.status})`)

    const reader = res.body?.getReader()
    if (!reader) throw new Error('无法读取流')

    const decoder = new TextDecoder()
    let allText = ''          // 累积全部文字（思考过程 + JSON）
    let buf = ''              // SSE 行缓冲
    let jsonFound = false     // 是否已检测到 JSON 开始标记

    // 逐块读取 SSE 数据
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') continue

        try {
          const { content, error } = JSON.parse(data)
          if (error) { ElMessage.error(error); break }
          if (!content) continue

          allText += content

          // 检测到 JSON 开始标记，停止更新思考过程显示
          if (!jsonFound && allText.includes('===JSON_START===')) {
            jsonFound = true
            thinkingText.value = allText.split('===JSON_START===')[0].trim()
          } else if (!jsonFound) {
            thinkingText.value = allText
          }
        } catch {}
      }
    }

    // 提取 JSON 部分（在 ===JSON_START=== 和 ===JSON_END=== 之间）
    let jsonText = allText
    if (allText.includes('===JSON_START===')) {
      jsonText = allText.split('===JSON_START===')[1] || ''
      if (jsonText.includes('===JSON_END===')) {
        jsonText = jsonText.split('===JSON_END===')[0]
      }
    }
    // 兜底：如果 AI 没输出标记，尝试从 {"matchScore" 开始提取
    else if (allText.includes('{"matchScore"')) {
      jsonText = allText.substring(allText.indexOf('{"matchScore"'))
    }

    // 解析 JSON，更新页面
    const result = parseAIResponse(jsonText.trim())
    await saveToStore(result)

    ElMessage.success('分析完成')
  } catch (e: any) {
    ElMessage.error(!e.response ? '无法连接服务器，请确认后端服务已启动' : (e.response?.data?.message || '分析失败，请重试'))
  } finally {
    analyzing.value = false
    // 延迟清空思考过程，让用户看完
    setTimeout(() => { thinkingText.value = '' }, 3000)
  }
}

// 把分析结果更新到 store 和数据库
const saveToStore = async (result: any) => {
  const newResume = result.optimizedResume || ''
  resumeStore.matchScore = result.matchScore
  resumeStore.missingKeywords = result.missingKeywords
  resumeStore.suggestions = result.suggestions
  resumeStore.optimizedResume = newResume
  editResume.value = newResume

  if (resumeStore.currentResume) {
    resumeStore.currentResume.matchScore = result.matchScore
    resumeStore.currentResume.missingKeywords = result.missingKeywords
    resumeStore.currentResume.suggestions = result.suggestions
    resumeStore.currentResume.optimizedResume = newResume
  }

  // 保存到数据库
  await request.put(`/resume/${route.params.id}`, {
    matchScore: result.matchScore,
    missingKeywords: result.missingKeywords,
    suggestions: result.suggestions,
    optimizedResume: newResume
  })
}

// 保存编辑后的简历
const saveResult = async () => {
  try {
    await request.put(`/resume/${route.params.id}`, { optimizedResume: editResume.value })
    resumeStore.optimizedResume = editResume.value
    ElMessage.success('保存成功')
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '保存失败')
  }
}

onMounted(loadResume)
</script>
