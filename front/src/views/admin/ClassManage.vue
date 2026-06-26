<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="所属院系">
            <el-select v-model="queryForm.departmentId" placeholder="全部" clearable>
              <el-option v-for="d in deptOptions" :key="d.id" :label="d.name" :value="d.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="年级">
            <el-input v-model="queryForm.grade" placeholder="如2024" clearable @keyup.enter="fetchData" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="openDialog()">新增班级</el-button>
      </div>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="name" label="班级名称" width="160" />
        <el-table-column label="所属院系" width="160">
          <template #default="{ row }">{{ deptMap.get(row.departmentId) || row.departmentId }}</template>
        </el-table-column>
        <el-table-column label="班主任" width="100">
          <template #default="{ row }">{{ teacherMap.get(row.advisorId) || row.advisorId || '-' }}</template>
        </el-table-column>
        <el-table-column prop="grade" label="年级" width="80" />
        <el-table-column prop="major" label="专业方向" width="140" />
        <el-table-column prop="studentCount" label="学生人数" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="info" link size="small" @click="viewStudents(row)">查看学生</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑班级' : '新增班级'" width="520px" @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="所属院系" prop="departmentId">
          <el-select v-model="form.departmentId" placeholder="请选择院系" filterable>
            <el-option v-for="d in deptOptions" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班主任" prop="advisorId">
          <el-select v-model="form.advisorId" placeholder="请选择班主任" clearable filterable>
            <el-option v-for="t in teacherOptions" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="form.grade" />
        </el-form-item>
        <el-form-item label="专业方向" prop="major">
          <el-input v-model="form.major" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="studentListVisible" :title="`班级学生 - ${currentClassName}`" width="700px">
      <el-table :data="classStudents" stripe v-loading="studentLoading">
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column label="性别" width="80">
          <template #default="{ row }">{{ row.gender === 1 ? '男' : '女' }}</template>
        </el-table-column>
        <el-table-column prop="enrollmentDate" label="入学日期" width="120" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '在读' : '休学' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getClasses, createClass, updateClass, deleteClass } from '@/api/class'
import { getStudents } from '@/api/student'
import { getDepartmentOptions } from '@/api/department'
import { getTeacherOptions } from '@/api/teacher'
import type { Clazz, DepartmentOption, Student, TeacherOption } from '@/types'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const studentListVisible = ref(false)
const studentLoading = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const total = ref(0)
const tableData = ref<Clazz[]>([])
const deptOptions = ref<DepartmentOption[]>([])
const teacherOptions = ref<TeacherOption[]>([])
const currentClassName = ref('')
const classStudents = ref<Student[]>([])

const deptMap = computed(() => {
  const map = new Map<number, string>()
  deptOptions.value.forEach(d => map.set(d.id, d.name))
  return map
})

const teacherMap = computed(() => {
  const map = new Map<number, string>()
  teacherOptions.value.forEach(t => map.set(t.id, t.name))
  return map
})

interface QueryForm {
  departmentId: number | undefined
  grade: string
  pageNum: number
  pageSize: number
}

interface ClassForm {
  name: string
  departmentId: number | undefined
  advisorId: number | undefined
  grade: string
  major: string
}

const queryForm = reactive<QueryForm>({ departmentId: undefined, grade: '', pageNum: 1, pageSize: 10 })
const form = reactive<ClassForm>({ name: '', departmentId: undefined, advisorId: undefined, grade: '', major: '' })
const formRules: FormRules<ClassForm> = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择院系', trigger: 'change' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }]
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getClasses(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  Object.assign(queryForm, { departmentId: undefined, grade: '', pageNum: 1 })
  fetchData()
}

function openDialog(row?: Clazz) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, { name: row.name, departmentId: row.departmentId, advisorId: row.advisorId || undefined, grade: row.grade, major: row.major })
  } else {
    editingId.value = null
    Object.assign(form, { name: '', departmentId: undefined, advisorId: undefined, grade: '', major: '' })
  }
  dialogVisible.value = true
}

function resetForm() { formRef.value?.resetFields() }

async function submitForm() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateClass(editingId.value, { ...form })
      ElMessage.success('修改成功')
    } else {
      await createClass({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    submitting.value = false
  }
}

async function viewStudents(row: Clazz) {
  currentClassName.value = row.name
  studentListVisible.value = true
  studentLoading.value = true
  try {
    const res = await getStudents({ classId: row.id, pageSize: 999 })
    classStudents.value = res.list
  } finally {
    studentLoading.value = false
  }
}

async function handleDelete(row: Clazz) {
  await ElMessageBox.confirm(`确定删除班级 "${row.name}"？`, '提示', { type: 'warning' })
  await deleteClass(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(async () => {
  const [depts, teachers] = await Promise.all([getDepartmentOptions(), getTeacherOptions()])
  deptOptions.value = depts
  teacherOptions.value = teachers
  fetchData()
})
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
