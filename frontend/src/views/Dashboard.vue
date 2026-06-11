<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto p-6">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">AI简历助手</h1>
        <div class="flex gap-3">
          <router-link to="/history">
            <el-button type="info" plain>历史记录</el-button>
          </router-link>
          <el-button @click="handleLogout" type="danger" plain>退出登录</el-button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 左侧：粘贴简历 -->
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center gap-2">
              <el-icon :size="20"><Document /></el-icon>
              <span class="font-bold text-lg">简历内容</span>
            </div>
          </template>
          <el-input
            v-model="resumeText"
            type="textarea"
            :rows="12"
            placeholder="请粘贴你的简历内容..."
            resize="vertical"
          />
        </el-card>

        <!-- 右侧：岗位描述 -->
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center gap-2">
              <el-icon :size="20"><Promotion /></el-icon>
              <span class="font-bold text-lg">岗位描述</span>
            </div>
          </template>
          <el-input
            v-model="jobDescription"
            type="textarea"
            :rows="12"
            placeholder="请粘贴目标岗位的 JD 描述内容..."
            resize="vertical"
          />
        </el-card>
      </div>

      <div class="text-center mt-8">
        <el-button
          type="primary"
          size="large"
          @click="handleSubmit"
          :loading="submitting"
          :disabled="!resumeText.trim() || !jobDescription.trim()"
          class="px-12"
        >
          <el-icon class="mr-1"><Promotion /></el-icon>
          开始分析
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createResume } from '@/api/resume'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const resumeText = ref('')
const jobDescription = ref('')
const submitting = ref(false)

const handleSubmit = async () => {
  if (!resumeText.value.trim() || !jobDescription.value.trim()) {
    ElMessage.warning('请填写简历内容和岗位描述')
    return
  }

  submitting.value = true
  try {
    const res: any = await createResume({
      originalText: resumeText.value,
      jobDescription: jobDescription.value
    })
    ElMessage.success('简历创建成功，正在跳转分析页面...')
    router.push(`/result/${res.resume.id}`)
  } catch (e: any) {
    if (!e.response) {
      ElMessage.error('无法连接服务器，请确认后端服务已启动（端口 3000）')
    } else {
      ElMessage.error(e.response?.data?.message || '创建失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>
