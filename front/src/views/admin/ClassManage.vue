<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="所属院系">
            <el-select v-model="queryForm.department_id" placeholder="全部" clearable>
              <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="年级">
            <el-input v-model="queryForm.grade" placeholder="如2024" clearable />
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
        <el-table-column prop="department_name" label="所属院系" width="160" />
        <el-table-column prop="advisor_name" label="班主任" width="100" />
        <el-table-column prop="grade" label="年级" width="80" />
        <el-table-column prop="major" label="专业方向" width="140" />
        <el-table-column prop="student_count" label="学生人数" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
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
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.size"
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
        <el-form-item label="所属院系" prop="department_id">
          <el-select v-model="form.department_id" placeholder="请选择院系">
            <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班主任" prop="advisor_id">
          <el-select v-model="form.advisor_id" placeholder="请选择班主任" clearable filterable>
            <el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.id" />
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

    <el-dialog v-model="studentListVisible" :title="`班级学生 - ${currentClass.name}`" width="700px">
      <el-table :data="classStudents" stripe>
        <el-table-column prop="student_no" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="enrollment_date" label="入学日期" width="120" />
        <el-table-column prop="status" label="状态" width="80">
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface Option {
  id: number
  name: string
}

interface ClassRow {
  id: number
  name: string
  department_id?: number
  department_name: string
  advisor_id?: number
  advisor_name: string
  grade: string
  major: string
  student_count: number
  created_at: string
}

interface ClassStudent {
  student_no: string
  name: string
  gender: string
  enrollment_date: string
  status: number
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const studentListVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const total = ref(0)
const tableData = ref<ClassRow[]>([])
const departments = ref<Option[]>([{ id: 1, name: '信息工程学院' }, { id: 2, name: '经济管理学院' }])
const teachers = ref<Option[]>([{ id: 1, name: '李教授' }, { id: 2, name: '王教授' }])
const currentClass = ref<ClassRow>({} as ClassRow)
const classStudents = ref<ClassStudent[]>([])

interface QueryForm {
  department_id: number | undefined
  grade: string
  page: number
  size: number
}

interface ClassForm {
  name: string
  department_id: number | undefined
  advisor_id: number | undefined
  grade: string
  major: string
}

const queryForm = reactive<QueryForm>({ department_id: undefined, grade: '', page: 1, size: 10 })
const form = reactive<ClassForm>({ name: '', department_id: undefined, advisor_id: undefined, grade: '', major: '' })
const formRules: FormRules<ClassForm> = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  department_id: [{ required: true, message: '请选择院系', trigger: 'change' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }]
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, name: '2024级计算机1班', department_name: '信息工程学院', advisor_name: '李教授', grade: '2024', major: '计算机科学与技术', student_count: 42, created_at: '2024-09-01' },
      { id: 2, name: '2024级软件1班', department_name: '信息工程学院', advisor_name: '王教授', grade: '2024', major: '软件工程', student_count: 38, created_at: '2024-09-01' },
      { id: 3, name: '2024级经济1班', department_name: '经济管理学院', advisor_name: '赵教授', grade: '2024', major: '经济学', student_count: 45, created_at: '2024-09-01' }
    ]
    total.value = 3
    loading.value = false
  }, 300)
}

function resetQuery() {
  Object.assign(queryForm, { department_id: undefined, grade: '', page: 1 })
  fetchData()
}

function openDialog(row?: ClassRow) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, { name: row.name, department_id: row.department_id, advisor_id: row.advisor_id, grade: row.grade, major: row.major })
  } else {
    editingId.value = null
    Object.assign(form, { name: '', department_id: undefined, advisor_id: undefined, grade: '', major: '' })
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

function viewStudents(row: ClassRow) {
  currentClass.value = row
  classStudents.value = [
    { student_no: '20240001', name: '张三', gender: '男', enrollment_date: '2024-09-01', status: 1 },
    { student_no: '20240002', name: '李四', gender: '女', enrollment_date: '2024-09-01', status: 1 }
  ]
  studentListVisible.value = true
}

async function handleDelete(row: ClassRow) {
  await ElMessageBox.confirm(`确定删除班级 "${row.name}"？`, '提示', { type: 'warning' })
  ElMessage.success('删除成功')
  fetchData()
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
