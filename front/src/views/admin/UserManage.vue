<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="用户名">
            <el-input v-model="queryForm.username" placeholder="搜索用户名" clearable @keyup.enter="fetchData" />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="queryForm.role" placeholder="全部" clearable>
              <el-option label="管理员" value="admin" />
              <el-option label="教师" value="teacher" />
              <el-option label="学生" value="student" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryForm.status" placeholder="全部" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="openDialog()">新增用户</el-button>
      </div>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="roleTagMap[row.role as UserRole]">{{ roleLabelMap[row.role as UserRole] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="refId" label="关联ID" width="100" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'danger' : 'success'" link size="small" @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="warning" link size="small" @click="handleResetPassword(row)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无用户数据" />

      <el-pagination
        v-if="total > 0"
        class="pagination"
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @change="fetchData"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑用户' : '新增用户'" width="500px" @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!editingId" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!editingId">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// ===== 类型定义 =====
interface SysUserRow {
  id: number
  username: string
  role: 'admin' | 'teacher' | 'student'
  refId: number | null
  status: number
  lastLoginAt: string
  createdAt: string
}

type UserRole = 'admin' | 'teacher' | 'student'

const roleTagMap: Record<UserRole, '' | 'danger' | 'warning'> = { admin: 'danger', teacher: 'warning', student: '' }
const roleLabelMap: Record<UserRole, string> = { admin: '管理员', teacher: '教师', student: '学生' }

// ===== 状态变量 =====
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const total = ref(0)
const tableData = ref<SysUserRow[]>([])

interface QueryForm {
  username: string
  role: string
  status: number | undefined
  pageNum: number
  pageSize: number
}

interface UserForm {
  username: string
  password: string
  role: string
  status: number
}

const queryForm = reactive<QueryForm>({ username: '', role: '', status: undefined, pageNum: 1, pageSize: 10 })
const form = reactive<UserForm>({ username: '', password: '', role: 'student', status: 1 })
const formRules: FormRules<UserForm> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// ===== 模拟数据（后端暂无 UserController，使用本地模拟数据）=====
const mockUsers: SysUserRow[] = [
  { id: 1, username: 'admin',           role: 'admin',   refId: null,  status: 1, lastLoginAt: '2026-06-25 09:00', createdAt: '2024-01-01' },
  { id: 2, username: 'zhangsan',        role: 'teacher', refId: 1001,  status: 1, lastLoginAt: '2026-06-24 16:30', createdAt: '2024-02-15' },
  { id: 3, username: 'lisi',            role: 'student', refId: 2001,  status: 1, lastLoginAt: '2026-06-25 08:45', createdAt: '2024-09-01' },
  { id: 4, username: 'wangwu',          role: 'student', refId: 2002,  status: 1, lastLoginAt: '2026-06-20 10:20', createdAt: '2024-09-01' },
  { id: 5, username: 'zhaoliu',         role: 'student', refId: 2003,  status: 1, lastLoginAt: '2026-06-19 14:35', createdAt: '2024-09-01' },
  { id: 6, username: 'wanglaoshi',      role: 'teacher', refId: 1002,  status: 0, lastLoginAt: '2026-05-01 11:00', createdAt: '2024-03-10' },
  { id: 7, username: 'test_student',    role: 'student', refId: 2004,  status: 0, lastLoginAt: '2026-04-15 09:00', createdAt: '2025-09-01' }
]

async function fetchData() {
  loading.value = true
  // 模拟网络延迟
  await new Promise(r => setTimeout(r, 300))
  try {
    let list = [...mockUsers]
    // 前端过滤
    if (queryForm.status !== undefined) {
      list = list.filter(u => u.status === queryForm.status)
    }
    if (queryForm.username) {
      list = list.filter(u => u.username.includes(queryForm.username))
    }
    if (queryForm.role) {
      list = list.filter(u => u.role === queryForm.role)
    }
    total.value = list.length
    // 分页截取
    const start = (queryForm.pageNum - 1) * queryForm.pageSize
    const end = start + queryForm.pageSize
    tableData.value = list.slice(start, end)
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  Object.assign(queryForm, { username: '', role: '', status: undefined, pageNum: 1 })
  fetchData()
}

function openDialog(row?: SysUserRow) {
  if (row) {
    editingId.value = row.id
    form.username = row.username
    form.role = row.role
    form.status = row.status
    form.password = ''
  } else {
    editingId.value = null
    Object.assign(form, { username: '', password: '', role: 'student', status: 1 })
  }
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
}

async function submitForm() {
  await formRef.value?.validate()
  submitting.value = true
  await new Promise(r => setTimeout(r, 300))
  if (editingId.value) {
    ElMessage.success('修改成功')
  } else {
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  submitting.value = false
  fetchData()
}

async function toggleStatus(row: SysUserRow) {
  const action = row.status === 1 ? '禁用' : '启用'
  await ElMessageBox.confirm(`确定${action}用户 "${row.username}"？`, '提示', { type: 'warning' })
  row.status = row.status === 1 ? 0 : 1
  ElMessage.success(`${action}成功`)
  fetchData()
}

async function handleResetPassword(row: SysUserRow) {
  await ElMessageBox.confirm(`确定重置用户 "${row.username}" 的密码？`, '提示', { type: 'warning' })
  ElMessage.success('密码已重置为默认密码')
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
