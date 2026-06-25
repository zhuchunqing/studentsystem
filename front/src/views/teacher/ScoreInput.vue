<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="课程">
            <el-select v-model="queryForm.course_id" placeholder="请选择课程" @change="fetchStudents">
              <el-option v-for="c in courses" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="考试类型">
            <el-select v-model="queryForm.score_type">
              <el-option label="期末" :value="1" />
              <el-option label="补考" :value="2" />
              <el-option label="重修" :value="3" />
            </el-select>
          </el-form-item>
        </el-form>
        <div>
          <el-button type="primary" @click="handleSubmit" :loading="submitting" :disabled="!scoreList.length">提交成绩</el-button>
          <el-button type="success" @click="handleAutoCalc">自动计算总评</el-button>
        </div>
      </div>

      <el-alert v-if="!queryForm.course_id" title="请先选择课程" type="info" :closable="false" show-icon style="margin-bottom: 16px" />

      <el-table v-else :data="scoreList" stripe v-loading="loading">
        <el-table-column prop="student_no" label="学号" width="120" />
        <el-table-column prop="student_name" label="姓名" width="100" />
        <el-table-column label="平时成绩" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.usual_score" :min="0" :max="100" :precision="1" :controls="false" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="期中成绩" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.midterm_score" :min="0" :max="100" :precision="1" :controls="false" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="期末成绩" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.final_score" :min="0" :max="100" :precision="1" :controls="false" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="总评成绩" width="100">
          <template #default="{ row }">
            <span :class="{ 'fail-score': row.total_score !== null && row.total_score < 60 }">{{ row.total_score?.toFixed(1) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="绩点" width="80">
          <template #default="{ row }">
            {{ row.grade_point?.toFixed(1) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="及格" width="60">
          <template #default="{ row }">
            <el-tag v-if="row.total_score !== null" :type="row.total_score >= 60 ? 'success' : 'danger'" size="small">
              {{ row.total_score >= 60 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ScoreInputRow, ScoreType } from '@/types'

interface CourseOption {
  id: number
  name: string
}

interface QueryForm {
  course_id: number | undefined
  score_type: ScoreType
}

const loading = ref(false)
const submitting = ref(false)
const scoreList = ref<ScoreInputRow[]>([])

const courses = ref<CourseOption[]>([
  { id: 1, name: '高等数学 (CS101)' },
  { id: 2, name: '线性代数 (CS102)' }
])

const queryForm = reactive<QueryForm>({ course_id: undefined, score_type: 1 })

function fetchStudents() {
  if (!queryForm.course_id) return
  loading.value = true
  setTimeout(() => {
    scoreList.value = [
      { studentNo: '20240001', studentName: '张三', usualScore: null, midtermScore: null, finalScore: null, totalScore: null, gradePoint: null },
      { studentNo: '20240002', studentName: '李四', usualScore: null, midtermScore: null, finalScore: null, totalScore: null, gradePoint: null },
      { studentNo: '20240003', studentName: '王五', usualScore: null, midtermScore: null, finalScore: null, totalScore: null, gradePoint: null }
    ]
    loading.value = false
  }, 300)
}

function handleAutoCalc() {
  scoreList.value.forEach(row => {
    if (row.usualScore !== null && row.midtermScore !== null && row.finalScore !== null) {
      row.totalScore = row.usualScore * 0.3 + row.midtermScore * 0.2 + row.finalScore * 0.5
      if (row.totalScore >= 90) row.gradePoint = 4.0
      else if (row.totalScore >= 80) row.gradePoint = 3.0
      else if (row.totalScore >= 70) row.gradePoint = 2.0
      else if (row.totalScore >= 60) row.gradePoint = 1.0
      else row.gradePoint = 0
    }
  })
  ElMessage.success('总评成绩已自动计算')
}

async function handleSubmit() {
  const incomplete = scoreList.value.filter(r => r.usualScore === null || r.midtermScore === null || r.finalScore === null)
  if (incomplete.length) {
    ElMessage.warning(`还有 ${incomplete.length} 名学生成绩未录入完整`)
    return
  }
  await ElMessageBox.confirm('确定提交成绩？提交后将无法自行修改。', '提示', { type: 'warning' })
  submitting.value = true
  setTimeout(() => {
    ElMessage.success('成绩提交成功，等待管理员审核')
    submitting.value = false
  }, 500)
}

onMounted(() => {
  // Pre-select course from query params if available
  const courseId = new URLSearchParams(window.location.search).get('courseId')
  if (courseId) {
    queryForm.course_id = Number(courseId)
    fetchStudents()
  }
})
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.fail-score { color: #F56C6C; font-weight: bold; }
</style>
