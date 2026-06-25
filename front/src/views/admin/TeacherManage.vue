<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="姓名">
            <el-input v-model="queryForm.name" placeholder="搜索教师" clearable />
          </el-form-item>
          <el-form-item label="工号">
            <el-input v-model="queryForm.employee_no" placeholder="搜索工号" clearable />
          </el-form-item>
          <el-form-item label="院系">
            <el-select v-model="queryForm.department_id" placeholder="全部" clearable>
              <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
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
        <el-table-column prop="employee_no" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="department_name" label="所属院系" width="160" />
        <el-table-column prop="title" label="职称" width="100" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="status" label="状态" width="80">
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
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.size"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @change="fetchData"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑教师' : '新增教师'" width="520px" @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="工号" prop="employee_no">
          <el-input v-model="form.employee_no" :disabled="!!editingId" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="所属院系" prop="department_id">
          <el-select v-model="form.department_id" placeholder="请选择院系">
            <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="form.title" placeholder="请选择职称">
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface Option {
  id: number
  name: string
}

interface TeacherRow {
  id: number
  employee_no: string
  name: string
  department_id?: number
  department_name: string
  title: string
  phone: string
  email: string
  status: number
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const total = ref(0)
const tableData = ref<TeacherRow[]>([])
const departments = ref<Option[]>([{ id: 1, name: '信息工程学院' }, { id: 2, name: '经济管理学院' }])

interface QueryForm {
  name: string
  employee_no: string
  department_id: number | undefined
  page: number
  size: number
}

interface TeacherForm {
  employee_no: string
  name: string
  department_id: number | undefined
  title: string
  phone: string
  email: string
  status: number
}

const queryForm = reactive<QueryForm>({ name: '', employee_no: '', department_id: undefined, page: 1, size: 10 })
const form = reactive<TeacherForm>({ employee_no: '', name: '', department_id: undefined, title: '', phone: '', email: '', status: 1 })
const formRules: FormRules<TeacherForm> = {
  employee_no: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department_id: [{ required: true, message: '请选择院系', trigger: 'change' }]
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, employee_no: 'T001', name: '李教授', department_name: '信息工程学院', title: '教授', phone: '13800001111', email: 'li@university.edu', status: 1 },
      { id: 2, employee_no: 'T002', name: '王教授', department_name: '信息工程学院', title: '副教授', phone: '13800002222', email: 'wang@university.edu', status: 1 },
      { id: 3, employee_no: 'T003', name: '赵教授', department_name: '经济管理学院', title: '讲师', phone: '13800003333', email: 'zhao@university.edu', status: 1 }
    ]
    total.value = 3
    loading.value = false
  }, 300)
}

function resetQuery() {
  Object.assign(queryForm, { name: '', employee_no: '', department_id: undefined, page: 1 })
  fetchData()
}

function openDialog(row?: TeacherRow) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, row)
  } else {
    editingId.value = null
    Object.assign(form, { employee_no: '', name: '', department_id: undefined, title: '', phone: '', email: '', status: 1 })
  }
  dialogVisible.value = true
}

function resetForm() { formRef.value?.resetFields() }

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

async function handleDelete(row: TeacherRow) {
  await ElMessageBox.confirm(`确定删除教师 "${row.name}"？`, '提示', { type: 'warning' })
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
