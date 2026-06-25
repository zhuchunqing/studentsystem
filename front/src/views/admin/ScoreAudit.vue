<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="学期">
            <el-input v-model="queryForm.semester" placeholder="如2024-2025-1" clearable />
          </el-form-item>
          <el-form-item label="课程">
            <el-input v-model="queryForm.course_name" placeholder="搜索课程" clearable />
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select v-model="queryForm.audit_status" placeholder="全部" clearable>
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已驳回" value="rejected" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" @click="handleBatchApprove">批量通过</el-button>
      </div>

      <el-table :data="tableData" stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="teacher_name" label="授课教师" width="100" />
        <el-table-column prop="course_name" label="课程名称" width="160" />
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column prop="score_type" label="考试类型" width="100">
          <template #default="{ row }">
            {{ scoreTypeMap[row.score_type as ScoreType] }}
          </template>
        </el-table-column>
        <el-table-column prop="student_count" label="录入人数" width="90" />
        <el-table-column prop="submit_time" label="提交时间" width="180" />
        <el-table-column prop="audit_status" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="auditTagMap[row.audit_status as AuditStatus]" size="small">{{ auditLabelMap[row.audit_status as AuditStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">查看</el-button>
            <el-button type="success" link size="small" @click="handleApprove(row)" :disabled="row.audit_status !== 'pending'">通过</el-button>
            <el-button type="danger" link size="small" @click="handleReject(row)" :disabled="row.audit_status !== 'pending'">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="成绩详情" width="800px">
      <el-table :data="scoreDetails" stripe>
        <el-table-column prop="student_no" label="学号" width="120" />
        <el-table-column prop="student_name" label="姓名" width="100" />
        <el-table-column prop="usual_score" label="平时成绩" width="90" />
        <el-table-column prop="midterm_score" label="期中成绩" width="90" />
        <el-table-column prop="final_score" label="期末成绩" width="90" />
        <el-table-column prop="total_score" label="总评成绩" width="90" />
        <el-table-column prop="grade_point" label="绩点" width="80" />
        <el-table-column prop="is_passed" label="是否及格" width="90">
          <template #default="{ row }">
            <el-tag :type="row.is_passed ? 'success' : 'danger'" size="small">{{ row.is_passed ? '及格' : '不及格' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AuditStatus, ScoreType, ScoreAuditRow } from '@/types'

const scoreTypeMap: Record<ScoreType, string> = { 1: '期末', 2: '补考', 3: '重修' }
const auditTagMap: Record<AuditStatus, 'warning' | 'success' | 'danger'> = { pending: 'warning', approved: 'success', rejected: 'danger' }
const auditLabelMap: Record<AuditStatus, string> = { pending: '待审核', approved: '已通过', rejected: '已驳回' }

interface ScoreDetail {
  student_no: string
  student_name: string
  usual_score: number
  midterm_score: number
  final_score: number
  total_score: number
  grade_point: number
  is_passed: boolean
}

const loading = ref(false)
const tableData = ref<ScoreAuditRow[]>([])
const selectedRows = ref<ScoreAuditRow[]>([])
const detailVisible = ref(false)
const scoreDetails = ref<ScoreDetail[]>([])

const queryForm = reactive({ semester: '', course_name: '', audit_status: undefined as AuditStatus | undefined })

function fetchData() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, teacher_name: '李教授', course_name: '高等数学', semester: '2024-2025-1', score_type: 1, student_count: 42, submit_time: '2025-01-14 10:30', audit_status: 'pending' },
      { id: 2, teacher_name: '王教授', course_name: '大学英语', semester: '2024-2025-1', score_type: 1, student_count: 98, submit_time: '2025-01-13 16:20', audit_status: 'approved' },
      { id: 3, teacher_name: '赵教授', course_name: '数据结构', semester: '2024-2025-1', score_type: 2, student_count: 5, submit_time: '2025-01-15 09:00', audit_status: 'pending' }
    ]
    loading.value = false
  }, 300)
}

function handleSelectionChange(rows: ScoreAuditRow[]) {
  selectedRows.value = rows
}

function viewDetail(_row: ScoreAuditRow) {
  scoreDetails.value = [
    { student_no: '20240001', student_name: '张三', usual_score: 85, midterm_score: 78, final_score: 82, total_score: 82.1, grade_point: 3.0, is_passed: true },
    { student_no: '20240002', student_name: '李四', usual_score: 70, midterm_score: 65, final_score: 58, total_score: 62.0, grade_point: 1.0, is_passed: true },
    { student_no: '20240003', student_name: '王五', usual_score: 40, midterm_score: 35, final_score: 30, total_score: 33.0, grade_point: 0, is_passed: false }
  ]
  detailVisible.value = true
}

async function handleApprove(_row: ScoreAuditRow) {
  await ElMessageBox.confirm('确定通过该成绩审核？', '提示', { type: 'success' })
  ElMessage.success('审核通过')
  fetchData()
}

async function handleReject(_row: ScoreAuditRow) {
  await ElMessageBox.prompt('请输入驳回原因', '驳回成绩', { inputPlaceholder: '驳回原因' })
  ElMessage.success('已驳回')
  fetchData()
}

async function handleBatchApprove() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要审核的记录')
    return
  }
  await ElMessageBox.confirm(`确定批量通过 ${selectedRows.value.length} 条记录？`, '提示', { type: 'success' })
  ElMessage.success('批量审核通过')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
</style>
