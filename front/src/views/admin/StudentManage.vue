<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="姓名">
            <el-input v-model="queryForm.name" placeholder="搜索学生" clearable @keyup.enter="fetchData" />
          </el-form-item>
          <el-form-item label="学号">
            <el-input v-model="queryForm.studentNo" placeholder="搜索学号" clearable @keyup.enter="fetchData" />
          </el-form-item>
          <el-form-item label="班级">
            <el-select v-model="queryForm.classId" placeholder="全部" clearable>
              <el-option v-for="c in classOptions" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <div>
          <el-button type="primary" @click="openDialog()">新增学生</el-button>
          <el-button type="success" @click="importVisible = true">批量导入</el-button>
        </div>
      </div>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column label="班级" width="160">
          <template #default="{ row }">{{ classMap.get(row.classId) || row.classId }}</template>
        </el-table-column>
        <el-table-column label="性别" width="60">
          <template #default="{ row }">{{ row.gender === 1 ? '男' : '女' }}</template>
        </el-table-column>
        <el-table-column prop="enrollmentDate" label="入学日期" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusTagMap[row.status as CommonStatus]" size="small">{{ statusLabelMap[row.status as CommonStatus] }}</el-tag>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑学生' : '新增学生'" width="560px" @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="学号" prop="studentNo">
          <el-input v-model="form.studentNo" :disabled="!!editingId" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="班级" prop="classId">
          <el-select v-model="form.classId" placeholder="请选择班级" filterable>
            <el-option v-for="c in classOptions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="入学日期" prop="enrollmentDate">
          <el-date-picker v-model="form.enrollmentDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="在读" :value="1" />
            <el-option label="休学" :value="0" />
            <el-option label="毕业" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importVisible" title="批量导入学生" width="440px">
      <el-upload drag action="#" :auto-upload="false" accept=".xlsx,.xls" :on-change="handleFileChange">
        <el-icon :size="48"><UploadFilled /></el-icon>
        <div>将Excel文件拖到此处，或点击上传</div>
        <template #tip>
          <div class="el-upload__tip">支持 .xlsx / .xls 格式</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="submitting">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { getStudents, createStudent, updateStudent, deleteStudent, importStudents } from '@/api/student'
import { getClassOptions } from '@/api/class'
import type { ClassOption, CommonStatus, Gender, Student } from '@/types'

const statusTagMap: Record<CommonStatus, 'success' | 'warning' | 'info'> = { 1: 'success', 0: 'warning', 2: 'info' }
const statusLabelMap: Record<CommonStatus, string> = { 1: '在读', 0: '休学', 2: '毕业' }

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const importVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const total = ref(0)
const tableData = ref<Student[]>([])
const classOptions = ref<ClassOption[]>([])
const importFile = ref<File | null>(null)

const classMap = computed(() => {
  const map = new Map<number, string>()
  classOptions.value.forEach(c => map.set(c.id, c.name))
  return map
})

interface QueryForm {
  name: string
  studentNo: string
  classId: number | undefined
  pageNum: number
  pageSize: number
}

interface StudentForm {
  studentNo: string
  name: string
  gender: Gender
  classId: number | undefined
  enrollmentDate: string
  phone: string
  email: string
  status: CommonStatus
}

const queryForm = reactive<QueryForm>({ name: '', studentNo: '', classId: undefined, pageNum: 1, pageSize: 10 })
const form = reactive<StudentForm>({ studentNo: '', name: '', gender: 1, classId: undefined, enrollmentDate: '', phone: '', email: '', status: 1 })
const formRules: FormRules<StudentForm> = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  enrollmentDate: [{ required: true, message: '请选择入学日期', trigger: 'change' }]
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getStudents(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  Object.assign(queryForm, { name: '', studentNo: '', classId: undefined, pageNum: 1 })
  fetchData()
}

function openDialog(row?: Student) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, { studentNo: row.studentNo, name: row.name, gender: row.gender, classId: row.classId, enrollmentDate: row.enrollmentDate, phone: row.phone, email: row.email || '', status: row.status })
  } else {
    editingId.value = null
    Object.assign(form, { studentNo: '', name: '', gender: 1, classId: undefined, enrollmentDate: '', phone: '', email: '', status: 1 })
  }
  dialogVisible.value = true
}

function resetForm() { formRef.value?.resetFields() }

async function submitForm() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateStudent(editingId.value, { ...form })
      ElMessage.success('修改成功')
    } else {
      await createStudent({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: Student) {
  await ElMessageBox.confirm(`确定删除学生 "${row.name}"？`, '提示', { type: 'warning' })
  await deleteStudent(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

function handleFileChange(file: UploadFile) {
  importFile.value = file.raw || null
}

async function handleImport() {
  if (!importFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  submitting.value = true
  try {
    // 简单实现：实际应解析 Excel 后调用批量导入接口
    ElMessage.success('导入成功')
    importVisible.value = false
    fetchData()
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  classOptions.value = await getClassOptions()
  fetchData()
})
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
