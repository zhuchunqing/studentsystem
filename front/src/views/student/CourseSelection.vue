<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="课程类型">
            <el-select v-model="queryForm.course_type" placeholder="全部" clearable>
              <el-option label="必修" :value="1" />
              <el-option label="选修" :value="2" />
              <el-option label="公选" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="搜索">
            <el-input v-model="queryForm.keyword" placeholder="课程名称/编码" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-alert v-if="creditInfo" :title="`本学期已选 ${creditInfo.selected} 学分（上限 ${creditInfo.max} / 下限 ${creditInfo.min}）`" type="info" :closable="false" show-icon style="margin-bottom: 16px" />

      <el-table :data="courseList" stripe v-loading="loading">
        <el-table-column prop="code" label="课程编码" width="120" />
        <el-table-column prop="name" label="课程名称" min-width="160" />
        <el-table-column prop="teacher_name" label="授课教师" width="100" />
        <el-table-column prop="credit" label="学分" width="70" />
        <el-table-column prop="course_type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.course_type as CourseType]" size="small">{{ typeLabelMap[row.course_type as CourseType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column label="选课人数" width="100">
          <template #default="{ row }">
            {{ row.selected_count }} / {{ row.max_students }}
          </template>
        </el-table-column>
        <el-table-column label="选课状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.my_status === 'selected'" type="success" size="small">已选</el-tag>
            <el-tag v-else-if="row.my_status === 'required'" type="" size="small">必修</el-tag>
            <el-tag v-else-if="row.selected_count >= row.max_students" type="danger" size="small">已满</el-tag>
            <el-tag v-else type="info" size="small">未选</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="140">
          <template #default="{ row }">
            <el-button
              v-if="row.my_status === 'none' && row.selected_count < row.max_students && row.course_type !== 1"
              type="primary" size="small" @click="handleSelect(row)"
            >选课</el-button>
            <el-button
              v-if="row.my_status === 'selected' && row.course_type !== 1"
              type="danger" size="small" @click="handleDrop(row)"
            >退选</el-button>
            <span v-if="row.course_type === 1" class="text-muted">必修课</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CourseType } from '@/types'

const typeTagMap: Record<CourseType, '' | 'success' | 'warning'> = { 1: '', 2: 'success', 3: 'warning' }
const typeLabelMap: Record<CourseType, string> = { 1: '必修', 2: '选修', 3: '公选' }

interface CreditInfo {
  selected: number
  max: number
  min: number
}

interface SelectionRow {
  id: number
  code: string
  name: string
  teacher_name: string
  credit: number
  course_type: CourseType
  semester: string
  selected_count: number
  max_students: number
  my_status: 'none' | 'selected' | 'required'
}

const loading = ref(false)
const courseList = ref<SelectionRow[]>([])
const creditInfo = ref<CreditInfo>({ selected: 16, max: 25, min: 12 })

const queryForm = reactive({ course_type: undefined as CourseType | undefined, keyword: '' })

function fetchData() {
  loading.value = true
  setTimeout(() => {
    courseList.value = [
      { id: 1, code: 'CS101', name: '高等数学', teacher_name: '李教授', credit: 4, course_type: 1, semester: '2024-2025-1', selected_count: 42, max_students: 120, my_status: 'required' },
      { id: 2, code: 'CS201', name: '数据结构', teacher_name: '赵教授', credit: 3, course_type: 1, semester: '2024-2025-1', selected_count: 55, max_students: 80, my_status: 'selected' },
      { id: 3, code: 'GE101', name: '心理健康', teacher_name: '孙教授', credit: 2, course_type: 3, semester: '2024-2025-1', selected_count: 180, max_students: 200, my_status: 'none' },
      { id: 4, code: 'GE102', name: '创新创业', teacher_name: '周教授', credit: 2, course_type: 3, semester: '2024-2025-1', selected_count: 200, max_students: 200, my_status: 'none' },
      { id: 5, code: 'CS202', name: '计算机网络', teacher_name: '钱教授', credit: 3, course_type: 2, semester: '2024-2025-1', selected_count: 30, max_students: 60, my_status: 'none' }
    ]
    loading.value = false
  }, 300)
}

async function handleSelect(row: SelectionRow) {
  const total = creditInfo.value.selected + row.credit
  if (total > creditInfo.value.max) {
    ElMessage.warning(`选课后将超过学分上限（${creditInfo.value.max}），无法选课`)
    return
  }
  await ElMessageBox.confirm(`确定选择课程 "${row.name}"（${row.credit}学分）？`, '选课确认', { type: 'info' })
  ElMessage.success('选课成功')
  fetchData()
}

async function handleDrop(row: SelectionRow) {
  await ElMessageBox.confirm(`确定退选课程 "${row.name}"？退选窗口期截止后不可退选。`, '退选确认', { type: 'warning' })
  ElMessage.success('退选成功')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
.text-muted { color: #909399; font-size: 13px; }
</style>
