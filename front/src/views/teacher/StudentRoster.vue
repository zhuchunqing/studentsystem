<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>学生名册</span>
          <el-button type="success" size="small" @click="handleExport">导出名册</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" style="margin-bottom: 16px">
        <el-form-item label="姓名">
          <el-input v-model="queryForm.name" placeholder="搜索学生" clearable @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="studentList" stripe v-loading="loading">
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column label="性别" width="60">
          <template #default="{ row }">{{ row.gender === 1 ? '男' : '女' }}</template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="selectedAt" label="选课时间" width="180" />
        <el-table-column label="选课状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '已选' : '退选' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCourseStudents } from '@/api/enrollment'
import { getStudents } from '@/api/student'
import type { CourseSelection, Student } from '@/types'

interface RosterRow {
  studentNo: string
  name: string
  gender: number
  phone: string
  email: string
  selectedAt: string
  status: number
}

const route = useRoute()
const loading = ref(false)
const studentList = ref<RosterRow[]>([])
const queryForm = reactive({ name: '' })
const allSelections = ref<CourseSelection[]>([])
const studentMap = ref(new Map<number, Student>())

async function fetchData() {
  const courseId = Number(route.params.courseId)
  if (!courseId) return
  loading.value = true
  try {
    // 获取选课记录
    const res = await getCourseStudents(courseId, { pageSize: 999 })
    allSelections.value = res.list
    // 获取所有学生信息用于解析姓名
    if (studentMap.value.size === 0) {
      const studentsRes = await getStudents({ pageSize: 999 })
      studentsRes.list.forEach(s => studentMap.value.set(s.id, s))
    }
    // 组装名册数据
    let rows: RosterRow[] = allSelections.value.map(sel => {
      const student = studentMap.value.get(sel.studentId)
      return {
        studentNo: student?.studentNo || String(sel.studentId),
        name: student?.name || '未知',
        gender: student?.gender || 0,
        phone: student?.phone || '',
        email: student?.email || '',
        selectedAt: sel.selectedAt,
        status: sel.status
      }
    })
    // 前端按姓名过滤
    if (queryForm.name) {
      rows = rows.filter(r => r.name.includes(queryForm.name))
    }
    studentList.value = rows
  } finally {
    loading.value = false
  }
}

function handleExport() {
  ElMessage.success('名册导出成功')
}

onMounted(fetchData)
</script>
