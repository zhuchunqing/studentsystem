<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="课程类型">
            <el-select v-model="queryForm.courseType" placeholder="全部" clearable>
              <el-option label="必修" :value="1" />
              <el-option label="选修" :value="2" />
              <el-option label="公选" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="搜索">
            <el-input v-model="queryForm.keyword" placeholder="课程名称/编码" clearable @keyup.enter="fetchData" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="courseList" stripe v-loading="loading">
        <el-table-column prop="code" label="课程编码" width="120" />
        <el-table-column prop="name" label="课程名称" min-width="160" />
        <el-table-column label="授课教师" width="100">
          <template #default="{ row }">{{ teacherMap.get(row.teacherId) || '-' }}</template>
        </el-table-column>
        <el-table-column prop="credit" label="学分" width="70" />
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.courseType as CourseType]" size="small">{{ typeLabelMap[row.courseType as CourseType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column label="容量" width="100">
          <template #default="{ row }">{{ row.maxStudents }}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="140">
          <template #default="{ row }">
            <el-button
              v-if="row.courseType !== 1"
              type="primary" size="small" @click="handleSelect(row)"
            >选课</el-button>
            <span v-else class="text-muted">必修课</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCourses } from '@/api/course'
import { getTeacherOptions } from '@/api/teacher'
import { selectCourse, getCourseSelections } from '@/api/enrollment'
import { useUserStore } from '@/stores/user'
import type { Course, CourseType, TeacherOption } from '@/types'

const typeTagMap: Record<CourseType, '' | 'success' | 'warning'> = { 1: '', 2: 'success', 3: 'warning' }
const typeLabelMap: Record<CourseType, string> = { 1: '必修', 2: '选修', 3: '公选' }

const userStore = useUserStore()
const loading = ref(false)
const courseList = ref<Course[]>([])
const teacherOptions = ref<TeacherOption[]>([])

const teacherMap = computed(() => {
  const map = new Map<number, string>()
  teacherOptions.value.forEach(t => map.set(t.id, t.name))
  return map
})

const queryForm = reactive({ courseType: undefined as CourseType | undefined, keyword: '' })

async function fetchData() {
  loading.value = true
  try {
    const res = await getCourses({ pageSize: 999, courseType: queryForm.courseType })
    let list = res.list
    if (queryForm.keyword) {
      list = list.filter(c => c.name.includes(queryForm.keyword) || c.code.includes(queryForm.keyword))
    }
    courseList.value = list
  } finally {
    loading.value = false
  }
}

async function handleSelect(row: Course) {
  await ElMessageBox.confirm(`确定选择课程 "${row.name}"（${row.credit}学分）？`, '选课确认', { type: 'info' })
  // 注意：当前登录用户的 studentId 需从用户上下文获取。
  // 后端 LoginResponse 暂未返回 refId，此处使用 username 作为占位。
  // 后端补充后可直接使用 userStore 中的 refId。
  await selectCourse({
    studentId: 0, // TODO: 从用户上下文获取当前学生 ID
    courseId: row.id,
    semester: row.semester
  })
  ElMessage.success('选课成功')
  fetchData()
}

onMounted(async () => {
  teacherOptions.value = await getTeacherOptions()
  fetchData()
})
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
.text-muted { color: #909399; font-size: 13px; }
</style>
