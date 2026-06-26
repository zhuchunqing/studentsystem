<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="课程">
            <el-select v-model="queryForm.courseId" placeholder="请选择课程" @change="fetchStudents">
              <el-option v-for="c in courseOptions" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="考试类型">
            <el-select v-model="queryForm.scoreType">
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

      <el-alert v-if="!queryForm.courseId" title="请先选择课程" type="info" :closable="false" show-icon style="margin-bottom: 16px" />

      <el-table v-else :data="scoreList" stripe v-loading="loading">
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column label="平时成绩" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.usualScore" :min="0" :max="100" :precision="1" :controls="false" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="期中成绩" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.midtermScore" :min="0" :max="100" :precision="1" :controls="false" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="期末成绩" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.finalScore" :min="0" :max="100" :precision="1" :controls="false" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="总评成绩" width="100">
          <template #default="{ row }">
            <span :class="{ 'fail-score': row.totalScore !== null && row.totalScore < 60 }">{{ row.totalScore?.toFixed(1) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="绩点" width="80">
          <template #default="{ row }">
            {{ row.gradePoint?.toFixed(1) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="及格" width="60">
          <template #default="{ row }">
            <el-tag v-if="row.totalScore !== null" :type="row.totalScore >= 60 ? 'success' : 'danger'" size="small">
              {{ row.totalScore >= 60 ? '是' : '否' }}
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
import { getCourseOptions } from '@/api/course'
import { getCourseStudents } from '@/api/enrollment'
import { getStudents } from '@/api/student'
import { batchCreateScores } from '@/api/score'
import type { CourseOption, ScoreInputRow, ScoreType, Student } from '@/types'

const loading = ref(false)
const submitting = ref(false)
const scoreList = ref<ScoreInputRow[]>([])

const courseOptions = ref<CourseOption[]>([])
const studentMap = ref(new Map<number, Student>())

interface QueryForm {
  courseId: number | undefined
  scoreType: ScoreType
}

const queryForm = reactive<QueryForm>({ courseId: undefined, scoreType: 1 })

async function fetchStudents() {
  if (!queryForm.courseId) return
  loading.value = true
  try {
    // 获取选课学生列表
    const selections = await getCourseStudents(queryForm.courseId, { pageSize: 999 })
    // 获取所有学生信息用于解析姓名
    if (studentMap.value.size === 0) {
      const studentsRes = await getStudents({ pageSize: 999 })
      studentsRes.list.forEach(s => studentMap.value.set(s.id, s))
    }
    // 组装成绩录入行
    scoreList.value = selections.list
      .filter(sel => sel.status === 1) // 只显示已选（未退选）的学生
      .map(sel => {
        const student = studentMap.value.get(sel.studentId)
        return {
          studentId: sel.studentId,
          studentNo: student?.studentNo || String(sel.studentId),
          studentName: student?.name || '未知',
          usualScore: null,
          midtermScore: null,
          finalScore: null,
          totalScore: null,
          gradePoint: null
        }
      })
  } finally {
    loading.value = false
  }
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
  try {
    // 构造批量录入请求：总评成绩作为 scoreValue
    await batchCreateScores({
      courseId: queryForm.courseId!,
      semester: '', // 由后端根据课程确定
      scoreType: queryForm.scoreType,
      records: scoreList.value.map(r => ({
        studentId: r.studentId,
        scoreValue: r.totalScore!
      }))
    })
    ElMessage.success('成绩提交成功，等待管理员审核')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  courseOptions.value = await getCourseOptions()
  // 从路由参数预选课程
  const params = new URLSearchParams(window.location.search)
  const courseId = params.get('courseId')
  if (courseId) {
    queryForm.courseId = Number(courseId)
    fetchStudents()
  }
})
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.fail-score { color: #F56C6C; font-weight: bold; }
</style>
