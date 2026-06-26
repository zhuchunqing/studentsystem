<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="学期">
            <el-input v-model="queryForm.semester" placeholder="如2024-2025-1" clearable @keyup.enter="fetchData" />
          </el-form-item>
          <el-form-item label="课程">
            <el-input v-model="courseNameFilter" placeholder="搜索课程" clearable @keyup.enter="fetchData" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="courseName" label="课程名称" min-width="160" />
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column label="考试类型" width="90">
          <template #default="{ row }">{{ scoreTypeMap[row.scoreType] || row.scoreType }}</template>
        </el-table-column>
        <el-table-column prop="scoreValue" label="分数" width="80" />
        <el-table-column prop="gradeLevel" label="等级" width="80" />
        <el-table-column label="是否及格" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isPassed ? 'success' : 'danger'" size="small">{{ row.isPassed ? '及格' : '不及格' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="160">
          <template #default="{ row }">
            <el-button type="success" link size="small" @click="handleApprove(row)">通过</el-button>
            <el-button type="danger" link size="small" @click="handleReject(row)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无成绩数据" />

      <el-pagination
        class="pagination"
        v-if="total > 0"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getScores, auditScore } from '@/api/score'
import type { StudentScoreResponse } from '@/types'

const scoreTypeMap: Record<number, string> = { 1: '期末', 2: '补考', 3: '重修' }

const loading = ref(false)
const total = ref(0)
const tableData = ref<StudentScoreResponse[]>([])
const courseNameFilter = ref('')

const queryForm = reactive({
  semester: '',
  pageNum: 1,
  pageSize: 10
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getScores({
      semester: queryForm.semester || undefined,
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize
    })
    let list = res.list
    // 前端按课程名称过滤
    if (courseNameFilter.value) {
      list = list.filter(s => s.courseName?.includes(courseNameFilter.value))
    }
    tableData.value = list
    total.value = res.total
  } catch {
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function handleApprove(row: StudentScoreResponse) {
  await ElMessageBox.confirm('确定通过该成绩审核？', '提示', { type: 'success' })
  await auditScore(row.scoreId, true)
  ElMessage.success('审核通过')
  fetchData()
}

async function handleReject(row: StudentScoreResponse) {
  await ElMessageBox.confirm('确定驳回该成绩？', '提示', { type: 'warning' })
  await auditScore(row.scoreId, false)
  ElMessage.success('已驳回')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
