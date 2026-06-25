<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="姓名">
            <el-input v-model="queryForm.name" placeholder="搜索学生" clearable />
          </el-form-item>
          <el-form-item label="学号">
            <el-input v-model="queryForm.student_no" placeholder="搜索学号" clearable />
          </el-form-item>
          <el-form-item label="班级">
            <el-select v-model="queryForm.class_id" placeholder="全部" clearable>
              <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
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
        <el-table-column prop="student_no" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="class_name" label="班级" width="160" />
        <el-table-column prop="gender" label="性别" width="60" />
        <el-table-column prop="enrollment_date" label="入学日期" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="status" label="状态" width="80">
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
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.size"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @change="fetchData"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑学生' : '新增学生'" width="560px" @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="学号" prop="student_no">
          <el-input v-model="form.student_no" :disabled="!!editingId" />
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
        <el-form-item label="班级" prop="class_id">
          <el-select v-model="form.class_id" placeholder="请选择班级">
            <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="入学日期" prop="enrollment_date">
          <el-date-picker v-model="form.enrollment_date" type="date" value-format="YYYY-MM-DD" />
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
        <el-button type="primary" @click="handleImport">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { CommonStatus, Gender } from '@/types'

const statusTagMap: Record<CommonStatus, 'success' | 'warning' | 'info'> = { 1: 'success', 0: 'warning', 2: 'info' }
const statusLabelMap: Record<CommonStatus, string> = { 1: '在读', 0: '休学', 2: '毕业' }

interface Option {
  id: number
  name: string
}

interface StudentRow {
  id: number
  student_no: string
  name: string
  class_name: string
  gender: string
  enrollment_date: string
  phone: string
  email?: string
  status: CommonStatus
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const importVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const total = ref(0)
const tableData = ref<StudentRow[]>([])
const classes = ref<Option[]>([{ id: 1, name: '2024级计算机1班' }, { id: 2, name: '2024级软件1班' }])

interface QueryForm {
  name: string
  student_no: string
  class_id: number | undefined
  page: number
  size: number
}

interface StudentForm {
  student_no: string
  name: string
  gender: Gender
  class_id: number | undefined
  enrollment_date: string
  phone: string
  email: string
  status: CommonStatus
}

const queryForm = reactive<QueryForm>({ name: '', student_no: '', class_id: undefined, page: 1, size: 10 })
const form = reactive<StudentForm>({ student_no: '', name: '', gender: 1, class_id: undefined, enrollment_date: '', phone: '', email: '', status: 1 })
const formRules: FormRules<StudentForm> = {
  student_no: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  class_id: [{ required: true, message: '请选择班级', trigger: 'change' }],
  enrollment_date: [{ required: true, message: '请选择入学日期', trigger: 'change' }]
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, student_no: '20240001', name: '张三', class_name: '2024级计算机1班', gender: '男', enrollment_date: '2024-09-01', phone: '13900001111', status: 1 },
      { id: 2, student_no: '20240002', name: '李四', class_name: '2024级计算机1班', gender: '女', enrollment_date: '2024-09-01', phone: '13900002222', status: 1 },
      { id: 3, student_no: '20240003', name: '王五', class_name: '2024级软件1班', gender: '男', enrollment_date: '2024-09-01', phone: '13900003333', status: 1 }
    ]
    total.value = 3
    loading.value = false
  }, 300)
}

function resetQuery() {
  Object.assign(queryForm, { name: '', student_no: '', class_id: undefined, page: 1 })
  fetchData()
}

function openDialog(row?: StudentRow) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, { student_no: row.student_no, name: row.name, gender: (row.gender === '男' ? 1 : 2) as Gender, class_id: undefined, enrollment_date: row.enrollment_date, phone: row.phone, email: row.email || '', status: row.status })
  } else {
    editingId.value = null
    Object.assign(form, { student_no: '', name: '', gender: 1, class_id: undefined, enrollment_date: '', phone: '', email: '', status: 1 })
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

async function handleDelete(row: StudentRow) {
  await ElMessageBox.confirm(`确定删除学生 "${row.name}"？`, '提示', { type: 'warning' })
  ElMessage.success('删除成功')
  fetchData()
}

function handleFileChange() {}
function handleImport() {
  ElMessage.success('导入成功')
  importVisible.value = false
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
