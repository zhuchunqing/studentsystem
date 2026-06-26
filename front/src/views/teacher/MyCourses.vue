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
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.courseType as CourseType]" size="small">{{ typeLabelMap[row.courseType as CourseType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="semester" label="学期" width="120" />
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
import { getCourses } from '@/api/course'
import type { Course, CourseType } from '@/types'

const typeTagMap: Record<CourseType, '' | 'success' | 'warning'> = { 1: '', 2: 'success', 3: 'warning' }
const typeLabelMap: Record<CourseType, string> = { 1: '必修', 2: '选修', 3: '公选' }

const router = useRouter()
const loading = ref(false)
const courseList = ref<Course[]>([])

async function fetchData() {
  loading.value = true
  try {
    const res = await getCourses({ pageSize: 999 })
    courseList.value = res.list
  } finally {
    loading.value = false
  }
}

function goScoreInput(row: Course) {
  router.push({ name: 'ScoreInput', query: { courseId: String(row.id) } })
}

onMounted(fetchData)
</script>
