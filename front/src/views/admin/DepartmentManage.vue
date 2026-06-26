<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="primary" @click="openDialog()">新增院系</el-button>
      </div>

      <el-table :data="treeData" row-key="id" default-expand-all v-loading="loading" stripe>
        <el-table-column prop="name" label="院系名称" min-width="200" />
        <el-table-column prop="dean" label="负责人" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="openDialog(undefined, row.id)">新增子级</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑院系' : '新增院系'" width="500px" @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="上级院系" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="treeData"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="顶级院系"
            clearable
            check-strictly
          />
        </el-form-item>
        <el-form-item label="院系名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="负责人" prop="dean">
          <el-input v-model="form.dean" />
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
import { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment } from '@/api/department'
import type { DepartmentTreeResponse } from '@/types'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const treeData = ref<DepartmentTreeResponse[]>([])

interface DeptForm {
  parentId: number | null
  name: string
  dean: string
  description: string
}

const form = reactive<DeptForm>({ parentId: null, name: '', dean: '', description: '' })
const formRules: FormRules<DeptForm> = {
  name: [{ required: true, message: '请输入院系名称', trigger: 'blur' }]
}

async function fetchData() {
  loading.value = true
  try {
    treeData.value = await getDepartments()
  } finally {
    loading.value = false
  }
}

async function openDialog(row?: DepartmentTreeResponse, parentId?: number) {
  if (row) {
    editingId.value = row.id
    // 编辑时需获取完整实体（含 parentId、description）
    const dept = await getDepartment(row.id)
    Object.assign(form, { parentId: dept.parentId, name: dept.name, dean: dept.dean, description: dept.description || '' })
  } else {
    editingId.value = null
    Object.assign(form, { parentId: parentId || null, name: '', dean: '', description: '' })
  }
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
}

async function submitForm() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateDepartment(editingId.value, { ...form })
      ElMessage.success('修改成功')
    } else {
      await createDepartment({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: DepartmentTreeResponse) {
  await ElMessageBox.confirm(`确定删除院系 "${row.name}"？`, '提示', { type: 'warning' })
  await deleteDepartment(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar {
  margin-bottom: 16px;
}
</style>
