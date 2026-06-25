<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="年级">
            <el-input v-model="queryForm.grade" placeholder="如2024" clearable />
          </el-form-item>
          <el-form-item label="专业">
            <el-select v-model="queryForm.major" placeholder="全部" clearable>
              <el-option label="计算机科学与技术" value="计算机科学与技术" />
              <el-option label="软件工程" value="软件工程" />
              <el-option label="经济学" value="经济学" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchData">查询</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="runAudit">执行审核</el-button>
      </div>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="student_no" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="major" label="专业" width="160" />
        <el-table-column prop="total_credit" label="已修学分" width="90" />
        <el-table-column prop="required_credit" label="要求学分" width="90" />
        <el-table-column prop="required_passed" label="必修通过" width="100">
          <template #default="{ row }">
            <el-tag :type="row.required_passed ? 'success' : 'danger'" size="small">{{ row.required_passed ? '全部通过' : '未通过' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="elective_credit" label="公选学分" width="90" />
        <el-table-column prop="practice_credit" label="实践学分" width="90" />
        <el-table-column prop="audit_result" label="审核结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.audit_result === '通过' ? 'success' : 'danger'">{{ row.audit_result }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">缺修清单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="缺修课程清单" width="600px">
      <el-table :data="missingCourses" stripe>
        <el-table-column prop="code" label="课程编码" width="120" />
        <el-table-column prop="name" label="课程名称" min-width="200" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="type" label="类型" width="80" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { GraduationAuditRow, MissingCourse } from '@/types'

const loading = ref(false)
const tableData = ref<GraduationAuditRow[]>([])
const detailVisible = ref(false)
const missingCourses = ref<MissingCourse[]>([])

const queryForm = reactive({ grade: '2024', major: undefined as string | undefined })

function fetchData() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, student_no: '20240001', name: '张三', major: '计算机科学与技术', total_credit: 68, required_credit: 160, required_passed: true, elective_credit: 8, practice_credit: 6, audit_result: '未通过' },
      { id: 2, student_no: '20240002', name: '李四', major: '软件工程', total_credit: 160, required_credit: 160, required_passed: true, elective_credit: 12, practice_credit: 8, audit_result: '通过' }
    ]
    loading.value = false
  }, 300)
}

function viewDetail(_row: GraduationAuditRow) {
  missingCourses.value = [
    { code: 'CS301', name: '操作系统', credit: 3, type: '必修' },
    { code: 'CS302', name: '计算机网络', credit: 3, type: '必修' },
    { code: 'GE202', name: '创新创业基础', credit: 2, type: '公选' }
  ]
  detailVisible.value = true
}

async function runAudit() {
  await ElMessageBox.confirm('确定对当前查询范围内的学生执行毕业审核？', '提示', { type: 'info' })
  ElMessage.success('毕业审核完成')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
</style>
