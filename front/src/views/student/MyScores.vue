<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="学期">
            <el-select v-model="queryForm.semester" placeholder="全部" clearable>
              <el-option label="2024-2025-1" value="2024-2025-1" />
              <el-option label="2024-2025-2" value="2024-2025-2" />
              <el-option label="2023-2024-2" value="2023-2024-2" />
            </el-select>
          </el-form-item>
          <el-form-item label="课程类型">
            <el-select v-model="queryForm.course_type" placeholder="全部" clearable>
              <el-option label="必修" value="必修" />
              <el-option label="选修" value="选修" />
              <el-option label="公选" value="公选" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" @click="handleExport">导出成绩单</el-button>
      </div>

      <el-descriptions :column="4" border style="margin-bottom: 20px">
        <el-descriptions-item label="当前GPA">{{ gpaInfo.gpa }}</el-descriptions-item>
        <el-descriptions-item label="已修学分">{{ gpaInfo.total_credit }}</el-descriptions-item>
        <el-descriptions-item label="及格率">{{ gpaInfo.pass_rate }}%</el-descriptions-item>
        <el-descriptions-item label="不及格课程">{{ gpaInfo.fail_count }}</el-descriptions-item>
      </el-descriptions>

      <el-table :data="scoreList" stripe v-loading="loading">
        <el-table-column prop="course_code" label="课程编码" width="100" />
        <el-table-column prop="course_name" label="课程名称" min-width="160" />
        <el-table-column prop="course_type" label="类型" width="70" />
        <el-table-column prop="credit" label="学分" width="60" />
        <el-table-column prop="usual_score" label="平时成绩" width="90" />
        <el-table-column prop="midterm_score" label="期中成绩" width="90" />
        <el-table-column prop="final_score" label="期末成绩" width="90" />
        <el-table-column prop="total_score" label="总评成绩" width="90">
          <template #default="{ row }">
            <span :class="{ 'fail-score': row.total_score < 60 }">{{ row.total_score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="grade_point" label="绩点" width="70" />
        <el-table-column prop="score_level" label="等级" width="70" />
        <el-table-column prop="is_passed" label="及格" width="60">
          <template #default="{ row }">
            <el-tag :type="row.is_passed ? 'success' : 'danger'" size="small">{{ row.is_passed ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" width="80" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface GpaInfo {
  gpa: number
  total_credit: number
  pass_rate: number
  fail_count: number
}

interface ScoreRow {
  course_code: string
  course_name: string
  course_type: string
  credit: number
  usual_score: number | null
  midterm_score: number | null
  final_score: number | null
  total_score: number
  grade_point: number
  score_level: string
  is_passed: boolean
  remark: string
}

const loading = ref(false)
const scoreList = ref<ScoreRow[]>([])
const gpaInfo = ref<GpaInfo>({ gpa: 3.52, total_credit: 68, pass_rate: 94.3, fail_count: 2 })

const queryForm = reactive({ semester: '', course_type: undefined as string | undefined })

function fetchData() {
  loading.value = true
  setTimeout(() => {
    scoreList.value = [
      { course_code: 'CS101', course_name: '高等数学', course_type: '必修', credit: 4, usual_score: 85, midterm_score: 78, final_score: 82, total_score: 82.1, grade_point: 3.0, score_level: '良好', is_passed: true, remark: '' },
      { course_code: 'CS102', course_name: '大学英语', course_type: '必修', credit: 3, usual_score: 90, midterm_score: 88, final_score: 92, total_score: 90.6, grade_point: 4.0, score_level: '优秀', is_passed: true, remark: '' },
      { course_code: 'CS201', course_name: '数据结构', course_type: '必修', credit: 3, usual_score: 40, midterm_score: 35, final_score: 30, total_score: 33.0, grade_point: 0, score_level: '不及格', is_passed: false, remark: '重修' },
      { course_code: 'GE101', course_name: '心理健康', course_type: '公选', credit: 2, usual_score: 75, midterm_score: null, final_score: 80, total_score: 78.5, grade_point: 2.0, score_level: '中等', is_passed: true, remark: '' },
      { course_code: 'CS202', course_name: '线性代数', course_type: '必修', credit: 3, usual_score: 70, midterm_score: 68, final_score: 72, total_score: 70.6, grade_point: 2.0, score_level: '中等', is_passed: true, remark: '' }
    ]
    loading.value = false
  }, 300)
}

function handleExport() {
  ElMessage.success('成绩单导出成功')
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.fail-score { color: #F56C6C; font-weight: bold; }
</style>
