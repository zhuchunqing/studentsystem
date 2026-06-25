<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="课程名称">
            <el-input v-model="queryForm.name" placeholder="搜索课程" clearable />
          </el-form-item>
          <el-form-item label="课程类型">
            <el-select v-model="queryForm.course_type" placeholder="全部" clearable>
              <el-option label="必修" :value="1" />
              <el-option label="选修" :value="2" />
              <el-option label="公选" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="学期">
            <el-input v-model="queryForm.semester" placeholder="如2024-2025-1" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="openDialog()">新增课程</el-button>
      </div>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="code" label="课程编码" width="120" />
        <el-table-column prop="name" label="课程名称" min-width="160" />
        <el-table-column prop="teacher_name" label="授课教师" width="100" />
        <el-table-column prop="credit" label="学分" width="70" />
        <el-table-column prop="hours" label="学时" width="70" />
        <el-table-column prop="course_type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.course_type as CourseType]" size="small">{{ typeLabelMap[row.course_type as CourseType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column prop="max_students" label="最大人数" width="90" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '开课' : '停课' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180">
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑课程' : '新增课程'" width="580px" @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="课程编码" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="授课教师" prop="teacher_id">
          <el-select v-model="form.teacher_id" placeholder="请选择教师" clearable filterable>
            <el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开课院系" prop="department_id">
          <el-select v-model="form.department_id" placeholder="请选择院系">
            <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="学分" prop="credit">
              <el-input-number v-model="form.credit" :min="1" :max="10" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="学时" prop="hours">
              <el-input-number v-model="form.hours" :min="8" :max="200" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类型" prop="course_type">
              <el-select v-model="form.course_type">
                <el-option label="必修" :value="1" />
                <el-option label="选修" :value="2" />
                <el-option label="公选" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="学期" prop="semester">
          <el-input v-model="form.semester" placeholder="如 2024-2025-1" />
        </el-form-item>
        <el-form-item label="最大人数" prop="max_students">
          <el-input-number v-model="form.max_students" :min="10" :max="500" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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
import type { CourseType } from '@/types'

const typeTagMap: Record<CourseType, '' | 'success' | 'warning'> = { 1: '', 2: 'success', 3: 'warning' }
const typeLabelMap: Record<CourseType, string> = { 1: '必修', 2: '选修', 3: '公选' }

interface Option {
  id: number
  name: string
}

interface CourseRow {
  id: number
  code: string
  name: string
  teacher_id?: number
  teacher_name: string
  credit: number
  hours: number
  course_type: CourseType
  semester: string
  max_students: number
  description?: string
  status: number
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const total = ref(0)
const tableData = ref<CourseRow[]>([])
const teachers = ref<Option[]>([{ id: 1, name: '李教授' }, { id: 2, name: '王教授' }])
const departments = ref<Option[]>([{ id: 1, name: '信息工程学院' }, { id: 2, name: '经济管理学院' }])

interface QueryForm {
  name: string
  course_type: CourseType | undefined
  semester: string
  page: number
  size: number
}

interface CourseForm {
  code: string
  name: string
  teacher_id: number | undefined
  department_id: number | undefined
  credit: number
  hours: number
  course_type: CourseType
  semester: string
  max_students: number
  description: string
}

const queryForm = reactive<QueryForm>({ name: '', course_type: undefined, semester: '', page: 1, size: 10 })
const form = reactive<CourseForm>({ code: '', name: '', teacher_id: undefined, department_id: undefined, credit: 3, hours: 48, course_type: 1, semester: '', max_students: 100, description: '' })
const formRules: FormRules<CourseForm> = {
  code: [{ required: true, message: '请输入课程编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  credit: [{ required: true, message: '请输入学分', trigger: 'blur' }],
  hours: [{ required: true, message: '请输入学时', trigger: 'blur' }],
  course_type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  semester: [{ required: true, message: '请输入学期', trigger: 'blur' }]
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, code: 'CS101', name: '高等数学', teacher_name: '李教授', credit: 4, hours: 64, course_type: 1, semester: '2024-2025-1', max_students: 120, status: 1 },
      { id: 2, code: 'CS102', name: '大学英语', teacher_name: '王教授', credit: 3, hours: 48, course_type: 1, semester: '2024-2025-1', max_students: 100, status: 1 },
      { id: 3, code: 'CS201', name: '数据结构', teacher_name: '赵教授', credit: 3, hours: 48, course_type: 1, semester: '2024-2025-2', max_students: 80, status: 1 },
      { id: 4, code: 'GE101', name: '心理健康', teacher_name: '孙教授', credit: 2, hours: 32, course_type: 3, semester: '2024-2025-1', max_students: 200, status: 1 }
    ]
    total.value = 4
    loading.value = false
  }, 300)
}

function resetQuery() {
  Object.assign(queryForm, { name: '', course_type: undefined, semester: '', page: 1 })
  fetchData()
}

function openDialog(row?: CourseRow) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, row)
  } else {
    editingId.value = null
    Object.assign(form, { code: '', name: '', teacher_id: undefined, department_id: undefined, credit: 3, hours: 48, course_type: 1, semester: '', max_students: 100, description: '' })
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

async function handleDelete(row: CourseRow) {
  await ElMessageBox.confirm(`确定删除课程 "${row.name}"？`, '提示', { type: 'warning' })
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
