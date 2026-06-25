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
          <el-input v-model="queryForm.name" placeholder="搜索学生" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="studentList" stripe v-loading="loading">
        <el-table-column prop="student_no" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="60" />
        <el-table-column prop="class_name" label="班级" width="160" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="selected_at" label="选课时间" width="180" />
        <el-table-column prop="status" label="选课状态" width="90">
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
import { ElMessage } from 'element-plus'

interface RosterRow {
  student_no: string
  name: string
  gender: string
  class_name: string
  phone: string
  email: string
  selected_at: string
  status: number
}

const loading = ref(false)
const studentList = ref<RosterRow[]>([])
const queryForm = reactive({ name: '' })

function fetchData() {
  loading.value = true
  setTimeout(() => {
    studentList.value = [
      { student_no: '20240001', name: '张三', gender: '男', class_name: '2024级计算机1班', phone: '13900001111', email: 'zhangsan@stu.edu', selected_at: '2024-12-01 09:30', status: 1 },
      { student_no: '20240002', name: '李四', gender: '女', class_name: '2024级计算机1班', phone: '13900002222', email: 'lisi@stu.edu', selected_at: '2024-12-01 09:32', status: 1 },
      { student_no: '20240003', name: '王五', gender: '男', class_name: '2024级软件1班', phone: '13900003333', email: 'wangwu@stu.edu', selected_at: '2024-12-02 14:15', status: 1 }
    ]
    loading.value = false
  }, 300)
}

function handleExport() {
  ElMessage.success('名册导出成功')
}

onMounted(fetchData)
</script>
