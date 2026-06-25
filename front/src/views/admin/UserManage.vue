<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="用户名">
            <el-input v-model="queryForm.username" placeholder="搜索用户名" clearable />
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
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="roleTagMap[row.role as UserRole]">{{ roleLabelMap[row.role as UserRole] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ref_id" label="关联ID" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_login_at" label="最后登录" width="180" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'danger' : 'success'" link size="small" @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="warning" link size="small" @click="resetPassword(row)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.size"
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
import type { SysUserRow, UserRole } from '@/types'

const roleTagMap: Record<UserRole, '' | 'danger' | 'warning'> = { admin: 'danger', teacher: 'warning', student: '' }
const roleLabelMap: Record<UserRole, string> = { admin: '管理员', teacher: '教师', student: '学生' }

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
  page: number
  size: number
}

interface UserForm {
  username: string
  password: string
  role: string
  status: number
}

const queryForm = reactive<QueryForm>({ username: '', role: '', status: undefined, page: 1, size: 10 })
const form = reactive<UserForm>({ username: '', password: '', role: 'student', status: 1 })
const formRules: FormRules<UserForm> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// Mock data for demo
function fetchData() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, username: 'admin', role: 'admin', ref_id: null, status: 1, last_login_at: '2025-01-15 09:00', created_at: '2024-01-01' },
      { id: 2, username: 'zhangsan', role: 'teacher', ref_id: 1001, status: 1, last_login_at: '2025-01-14 16:30', created_at: '2024-02-15' },
      { id: 3, username: 'lisi', role: 'student', ref_id: 2001, status: 1, last_login_at: '2025-01-15 08:45', created_at: '2024-09-01' }
    ]
    total.value = 3
    loading.value = false
  }, 300)
}

function resetQuery() {
  Object.assign(queryForm, { username: '', role: '', status: undefined, page: 1 })
  fetchData()
}

function openDialog(row?: SysUserRow) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, { username: row.username, role: row.role, status: row.status })
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
  setTimeout(() => {
    ElMessage.success(editingId.value ? '修改成功' : '新增成功')
    dialogVisible.value = false
    submitting.value = false
    fetchData()
  }, 300)
}

async function toggleStatus(row: SysUserRow) {
  const action = row.status === 1 ? '禁用' : '启用'
  await ElMessageBox.confirm(`确定${action}用户 "${row.username}"？`, '提示', { type: 'warning' })
  ElMessage.success(`${action}成功`)
  fetchData()
}

async function resetPassword(row: SysUserRow) {
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
