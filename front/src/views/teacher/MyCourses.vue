<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <span>我的授课列表</span>
      </template>
      <el-table :data="courseList" stripe v-loading="loading">
        <el-table-column prop="code" label="课程编码" width="120" />
        <el-table-column prop="name" label="课程名称" min-width="160" />
        <el-table-column prop="credit" label="学分" width="70" />
        <el-table-column prop="hours" label="学时" width="70" />
        <el-table-column prop="course_type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.course_type as CourseType]" size="small">{{ typeLabelMap[row.course_type as CourseType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column prop="student_count" label="选课人数" width="90" />
        <el-table-column prop="max_students" label="最大人数" width="90" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="$router.push(`/teacher/roster/${row.id}`)">学生名册</el-button>
            <el-button type="success" link size="small" @click="goScoreInput(row)">成绩录入</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { CourseType } from '@/types'

const typeTagMap: Record<CourseType, '' | 'success' | 'warning'> = { 1: '', 2: 'success', 3: 'warning' }
const typeLabelMap: Record<CourseType, string> = { 1: '必修', 2: '选修', 3: '公选' }

interface CourseRow {
  id: number
  code: string
  name: string
  credit: number
  hours: number
  course_type: CourseType
  semester: string
  student_count: number
  max_students: number
}

const router = useRouter()
const loading = ref(false)
const courseList = ref<CourseRow[]>([])

function fetchData() {
  loading.value = true
  setTimeout(() => {
    courseList.value = [
      { id: 1, code: 'CS101', name: '高等数学', credit: 4, hours: 64, course_type: 1, semester: '2024-2025-1', student_count: 42, max_students: 120 },
      { id: 2, code: 'CS102', name: '线性代数', credit: 3, hours: 48, course_type: 1, semester: '2024-2025-1', student_count: 55, max_students: 100 },
      { id: 3, code: 'CS201', name: '概率统计', credit: 3, hours: 48, course_type: 1, semester: '2024-2025-2', student_count: 48, max_students: 80 }
    ]
    loading.value = false
  }, 300)
}

function goScoreInput(row: CourseRow) {
  router.push({ name: 'ScoreInput', query: { courseId: String(row.id) } })
}

onMounted(fetchData)
</script>
