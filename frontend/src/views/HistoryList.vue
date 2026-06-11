<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto p-6">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">历史记录</h1>
        <router-link to="/dashboard">
          <el-button type="primary" plain>返回首页</el-button>
        </router-link>
      </div>

      <el-card shadow="hover">
        <el-table
          :data="historyList"
          stripe
          highlight-current-row
          @row-click="handleRowClick"
          style="width: 100%"
          empty-text="暂无简历分析记录"
          class="cursor-pointer"
        >
          <el-table-column label="岗位描述" min-width="250">
            <template #default="{ row }">
              <span class="text-gray-700">{{ truncate(row.jobDescription, 30) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="匹配分数" width="140" align="center">
            <template #default="{ row }">
              <el-tag
                v-if="row.matchScore !== null"
                :type="row.matchScore >= 70 ? 'success' : row.matchScore >= 40 ? 'warning' : 'danger'"
                effect="dark"
                round
              >
                {{ row.matchScore }}%
              </el-tag>
              <el-tag v-else type="info" round>未分析</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="200" align="center">
            <template #default="{ row }">
              <span class="text-gray-500 text-sm">{{ new Date(row.createdAt).toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click.stop="viewDetail(row._id)">查看详情</el-button>
              <el-button type="danger" link @click.stop="handleDelete(row._id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getHistory, deleteResume } from '@/api/resume'

interface HistoryRecord {
  _id: string
  matchScore: number | null
  jobDescription: string
  createdAt: string
}

const router = useRouter()
const historyList = ref<HistoryRecord[]>([])

const fetchHistory = async () => {
  try {
    const res: any = await getHistory()
    historyList.value = res
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '获取历史记录失败')
  }
}

const truncate = (text: string, len: number) => {
  if (!text) return ''
  return text.length > len ? text.substring(0, len) + '...' : text
}

const handleRowClick = (row: HistoryRecord) => {
  router.push(`/result/${row._id}`)
}

const viewDetail = (id: string) => {
  router.push(`/result/${id}`)
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？删除后不可恢复。', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteResume(id)
    historyList.value = historyList.value.filter(item => item._id !== id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消或请求失败
  }
}

onMounted(fetchHistory)
</script>
