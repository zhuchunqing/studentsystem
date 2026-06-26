<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="课程名称">
            <el-input v-model="queryForm.name" placeholder="搜索课程" clearable @keyup.enter="fetchData" />
          </el-form-item>
          <el-form-item label="课程类型">
            <el-select v-model="queryForm.courseType" placeholder="全部" clearable>
              <el-option label="必修" :value="1" />
              <el-option label="选修" :value="2" />
              <el-option label="公选" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="学期">
            <el-input v-model="queryForm.semester" placeholder="如2024-2025-1" clearable @keyup.enter="fetchData" />
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
        <el-table-column label="授课教师" width="100">
          <template #default="{ row }">{{ teacherMap.get(row.teacherId) || row.teacherId || '-' }}</template>
        </el-table-column>
        <el-table-column prop="credit" label="学分" width="70" />
        <el-table-column prop="hours" label="学时" width="70" />
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.courseType as CourseType]" size="small">{{ typeLabelMap[row.courseType as CourseType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column prop="maxStudents" label="最大人数" width="90" />
        <el-table-column label="状态" width="80">
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

      <el-empty v-if="!loading && tableData.length === 0" description="暂无课程数据，请先新增课程" />

      <el-pagination
        class="pagination"
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
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
        <el-form-item label="授课教师" prop="teacherId">
          <el-select v-model="form.teacherId" placeholder="请选择教师" clearable filterable>
            <el-option v-for="t in teacherOptions" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开课院系" prop="departmentId">
          <el-select v-model="form.departmentId" placeholder="请选择院系" filterable>
            <el-option v-for="d in deptOptions" :key="d.id" :label="d.name" :value="d.id" />
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
            <el-form-item label="类型" prop="courseType">
              <el-select v-model="form.courseType">
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
        <el-form-item label="最大人数" prop="maxStudents">
          <el-input-number v-model="form.maxStudents" :min="10" :max="500" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getCourses, createCourse, updateCourse, deleteCourse } from '@/api/course'
import { getTeacherOptions } from '@/api/teacher'
import { getDepartmentOptions } from '@/api/department'
import type { Course, CourseType, DepartmentOption, TeacherOption } from '@/types'

const typeTagMap: Record<CourseType, '' | 'success' | 'warning'> = { 1: '', 2: 'success', 3: 'warning' }
const typeLabelMap: Record<CourseType, string> = { 1: '必修', 2: '选修', 3: '公选' }

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const total = ref(0)
const tableData = ref<Course[]>([])
const teacherOptions = ref<TeacherOption[]>([])
const deptOptions = ref<DepartmentOption[]>([])

const teacherMap = computed(() => {
  const map = new Map<number, string>()
  teacherOptions.value.forEach(t => map.set(t.id, t.name))
  return map
})

interface QueryForm {
  name: string
  courseType: CourseType | undefined
  semester: string
  pageNum: number
  pageSize: number
}

interface CourseForm {
  code: string
  name: string
  teacherId: number | undefined
  departmentId: number | undefined
  credit: number
  hours: number
  courseType: CourseType
  semester: string
  maxStudents: number
  description: string
}

const queryForm = reactive<QueryForm>({ name: '', courseType: undefined, semester: '', pageNum: 1, pageSize: 10 })
const form = reactive<CourseForm>({ code: '', name: '', teacherId: undefined, departmentId: undefined, credit: 3, hours: 48, courseType: 1, semester: '', maxStudents: 100, description: '' })
const formRules: FormRules<CourseForm> = {
  code: [{ required: true, message: '请输入课程编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  credit: [{ required: true, message: '请输入学分', trigger: 'blur' }],
  hours: [{ required: true, message: '请输入学时', trigger: 'blur' }],
  courseType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  semester: [{ required: true, message: '请输入学期', trigger: 'blur' }]
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getCourses(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  Object.assign(queryForm, { name: '', courseType: undefined, semester: '', pageNum: 1 })
  fetchData()
}

function openDialog(row?: Course) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, { code: row.code, name: row.name, teacherId: row.teacherId || undefined, departmentId: row.departmentId, credit: row.credit, hours: row.hours, courseType: row.courseType, semester: row.semester, maxStudents: row.maxStudents, description: row.description || '' })
  } else {
    editingId.value = null
    Object.assign(form, { code: '', name: '', teacherId: undefined, departmentId: undefined, credit: 3, hours: 48, courseType: 1, semester: '', maxStudents: 100, description: '' })
  }
  dialogVisible.value = true
}

function resetForm() { formRef.value?.resetFields() }

async function submitForm() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateCourse(editingId.value, { ...form })
      ElMessage.success('修改成功')
    } else {
      await createCourse({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: Course) {
  await ElMessageBox.confirm(`确定删除课程 "${row.name}"？`, '提示', { type: 'warning' })
  await deleteCourse(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(async () => {
  try {
    const [depts, teachers] = await Promise.all([getDepartmentOptions(), getTeacherOptions()])
    deptOptions.value = depts
    teacherOptions.value = teachers
  } catch {
    // 下拉选项加载失败不影响课程列表加载
  }
  fetchData()
})
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
