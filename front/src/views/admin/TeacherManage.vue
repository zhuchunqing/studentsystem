<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="姓名">
            <el-input v-model="queryForm.name" placeholder="搜索教师" clearable @keyup.enter="fetchData" />
          </el-form-item>
          <el-form-item label="工号">
            <el-input v-model="queryForm.employeeNo" placeholder="搜索工号" clearable @keyup.enter="fetchData" />
          </el-form-item>
          <el-form-item label="院系">
            <el-select v-model="queryForm.departmentId" placeholder="全部" clearable>
              <el-option v-for="d in deptOptions" :key="d.id" :label="d.name" :value="d.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="openDialog()">新增教师</el-button>
      </div>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="employeeNo" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column label="所属院系" width="160">
          <template #default="{ row }">{{ deptMap.get(row.departmentId) || row.departmentId }}</template>
        </el-table-column>
        <el-table-column prop="title" label="职称" width="100" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @change="fetchData"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑教师' : '新增教师'" width="520px" @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="工号" prop="employeeNo">
          <el-input v-model="form.employeeNo" :disabled="!!editingId" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="所属院系" prop="departmentId">
          <el-select v-model="form.departmentId" placeholder="请选择院系" filterable>
            <el-option v-for="d in deptOptions" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="form.title" placeholder="请选择职称" clearable>
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="讲师" value="讲师" />
            <el-option label="助教" value="助教" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="在职" inactive-text="离职" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '@/api/teacher'
import { getDepartmentOptions } from '@/api/department'
import type { CommonStatus, DepartmentOption, Teacher } from '@/types'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const total = ref(0)
const tableData = ref<Teacher[]>([])
const deptOptions = ref<DepartmentOption[]>([])

const deptMap = computed(() => {
  const map = new Map<number, string>()
  deptOptions.value.forEach(d => map.set(d.id, d.name))
  return map
})

interface QueryForm {
  name: string
  employeeNo: string
  departmentId: number | undefined
  pageNum: number
  pageSize: number
}

interface TeacherForm {
  employeeNo: string
  name: string
  departmentId: number | undefined
  title: string
  phone: string
  email: string
  status: CommonStatus
}

const queryForm = reactive<QueryForm>({ name: '', employeeNo: '', departmentId: undefined, pageNum: 1, pageSize: 10 })
const form = reactive<TeacherForm>({ employeeNo: '', name: '', departmentId: undefined, title: '', phone: '', email: '', status: 1 })
const formRules: FormRules<TeacherForm> = {
  employeeNo: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择院系', trigger: 'change' }]
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getTeachers(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  Object.assign(queryForm, { name: '', employeeNo: '', departmentId: undefined, pageNum: 1 })
  fetchData()
}

function openDialog(row?: Teacher) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, { employeeNo: row.employeeNo, name: row.name, departmentId: row.departmentId, title: row.title, phone: row.phone, email: row.email, status: row.status })
  } else {
    editingId.value = null
    Object.assign(form, { employeeNo: '', name: '', departmentId: undefined, title: '', phone: '', email: '', status: 1 })
  }
  dialogVisible.value = true
}

function resetForm() { formRef.value?.resetFields() }

async function submitForm() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateTeacher(editingId.value, { ...form })
      ElMessage.success('修改成功')
    } else {
      await createTeacher({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: Teacher) {
  await ElMessageBox.confirm(`确定删除教师 "${row.name}"？`, '提示', { type: 'warning' })
  await deleteTeacher(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(async () => {
  deptOptions.value = await getDepartmentOptions()
  fetchData()
})
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
