<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="学期">
            <el-input v-model="queryForm.semester" placeholder="如2024-2025-1" clearable @keyup.enter="fetchData" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" @click="handleExport">导出成绩单</el-button>
      </div>

      <el-table :data="scoreList" stripe v-loading="loading">
        <el-table-column prop="courseCode" label="课程编码" width="100" />
        <el-table-column prop="courseName" label="课程名称" min-width="160" />
        <el-table-column label="考试类型" width="90">
          <template #default="{ row }">{{ scoreTypeMap[row.scoreType as ScoreType] }}</template>
        </el-table-column>
        <el-table-column prop="scoreValue" label="分数" width="80">
          <template #default="{ row }">
            <span :class="{ 'fail-score': row.scoreValue !== null && row.scoreValue < 60 }">{{ row.scoreValue ?? '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gradeLevel" label="等级" width="70" />
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column label="是否及格" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isPassed ? 'success' : 'danger'" size="small">{{ row.isPassed ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getScores, exportScores } from '@/api/score'
import type { ScoreType, StudentScoreResponse } from '@/types'

const scoreTypeMap: Record<ScoreType, string> = { 1: '期末', 2: '补考', 3: '重修' }

const loading = ref(false)
const total = ref(0)
const scoreList = ref<StudentScoreResponse[]>([])

const queryForm = reactive({
  semester: '',
  pageNum: 1,
  pageSize: 10
})

async function fetchData() {
  loading.value = true
  try {
    // 注意：当前登录学生的 studentId 需从用户上下文获取。
    // 后端 LoginResponse 暂未返回 refId，此处暂不传 studentId 过滤。
    // 后端补充后添加 studentId 参数即可只返回当前学生成绩。
    const res = await getScores({
      semester: queryForm.semester || undefined,
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize
    })
    scoreList.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function handleExport() {
  try {
    const blob = await exportScores({
      semester: queryForm.semester || undefined
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '成绩单.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('成绩单导出成功')
  } catch {
    // error handled in interceptor
  }
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.fail-score { color: #F56C6C; font-weight: bold; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
