<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="primary" @click="openDialog()">新增院系</el-button>
      </div>

      <el-table :data="treeData" row-key="id" default-expand-all v-loading="loading" stripe>
        <el-table-column prop="name" label="院系名称" min-width="200" />
        <el-table-column prop="dean" label="负责人" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="180" />
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
        <el-form-item label="上级院系" prop="parent_id">
          <el-tree-select
            v-model="form.parent_id"
            :data="treeOptions"
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

interface DeptNode {
  id: number
  name: string
  parent_id: number | null
  dean: string
  description: string
  created_at: string
  children?: DeptNode[]
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const treeData = ref<DeptNode[]>([])
const treeOptions = ref<DeptNode[]>([])

interface DeptForm {
  parent_id: number | null
  name: string
  dean: string
  description: string
}

const form = reactive<DeptForm>({ parent_id: null, name: '', dean: '', description: '' })
const formRules: FormRules<DeptForm> = {
  name: [{ required: true, message: '请输入院系名称', trigger: 'blur' }]
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    treeData.value = [
      { id: 1, name: '信息工程学院', parent_id: null, dean: '王教授', description: '计算机、软件等学科', created_at: '2024-01-01', children: [
        { id: 2, name: '计算机科学系', parent_id: 1, dean: '李教授', description: '计算机科学与技术', created_at: '2024-01-01' },
        { id: 3, name: '软件工程系', parent_id: 1, dean: '赵教授', description: '软件工程', created_at: '2024-01-01' }
      ]},
      { id: 4, name: '经济管理学院', parent_id: null, dean: '钱教授', description: '经济学、管理学', created_at: '2024-01-01', children: [
        { id: 5, name: '经济学系', parent_id: 4, dean: '孙教授', description: '经济学', created_at: '2024-01-01' }
      ]}
    ]
    treeOptions.value = treeData.value
    loading.value = false
  }, 300)
}

function openDialog(row?: DeptNode, parentId?: number) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, { parent_id: row.parent_id, name: row.name, dean: row.dean, description: row.description })
  } else {
    editingId.value = null
    Object.assign(form, { parent_id: parentId || null, name: '', dean: '', description: '' })
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

async function handleDelete(row: DeptNode) {
  await ElMessageBox.confirm(`确定删除院系 "${row.name}"？`, '提示', { type: 'warning' })
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
