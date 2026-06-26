<template>
  <div>
    <el-alert
      title="毕业审核接口尚未提供"
      description="后端暂无毕业审核接口，以下数据为模拟演示数据。接口补充后即可对接。"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 16px"
    />

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
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="major" label="专业" width="160" />
        <el-table-column prop="totalCredit" label="已修学分" width="90" />
        <el-table-column prop="requiredCredit" label="要求学分" width="90" />
        <el-table-column label="必修通过" width="100">
          <template #default="{ row }">
            <el-tag :type="row.requiredPassed ? 'success' : 'danger'" size="small">{{ row.requiredPassed ? '全部通过' : '未通过' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="electiveCredit" label="公选学分" width="90" />
        <el-table-column prop="practiceCredit" label="实践学分" width="90" />
        <el-table-column label="审核结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.auditResult === '通过' ? 'success' : 'danger'">{{ row.auditResult }}</el-tag>
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

interface GraduationRow {
  studentNo: string
  name: string
  major: string
  totalCredit: number
  requiredCredit: number
  requiredPassed: boolean
  electiveCredit: number
  practiceCredit: number
  auditResult: '通过' | '未通过'
}

interface MissingCourse {
  code: string
  name: string
  credit: number
  type: string
}

const loading = ref(false)
const tableData = ref<GraduationRow[]>([])
const detailVisible = ref(false)
const missingCourses = ref<MissingCourse[]>([])

const queryForm = reactive({ grade: '2024', major: undefined as string | undefined })

// ===== 模拟数据（后端暂未提供毕业审核接口）=====
const mockData: GraduationRow[] = [
  { studentNo: '20240001', name: '张三', major: '计算机科学与技术', totalCredit: 68, requiredCredit: 160, requiredPassed: true, electiveCredit: 8, practiceCredit: 6, auditResult: '未通过' },
  { studentNo: '20240002', name: '李四', major: '软件工程', totalCredit: 160, requiredCredit: 160, requiredPassed: true, electiveCredit: 12, practiceCredit: 8, auditResult: '通过' },
  { studentNo: '20240003', name: '王五', major: '计算机科学与技术', totalCredit: 82, requiredCredit: 160, requiredPassed: false, electiveCredit: 6, practiceCredit: 4, auditResult: '未通过' },
  { studentNo: '20240004', name: '赵六', major: '经济学', totalCredit: 158, requiredCredit: 160, requiredPassed: true, electiveCredit: 14, practiceCredit: 6, auditResult: '未通过' }
]

function fetchData() {
  loading.value = true
  setTimeout(() => {
    let list = [...mockData]
    if (queryForm.grade) {
      list = list.filter(s => s.studentNo.startsWith(queryForm.grade))
    }
    if (queryForm.major) {
      list = list.filter(s => s.major === queryForm.major)
    }
    tableData.value = list
    loading.value = false
  }, 300)
}

const mockMissing: MissingCourse[] = [
  { code: 'CS301', name: '操作系统', credit: 3, type: '必修' },
  { code: 'CS302', name: '计算机网络', credit: 3, type: '必修' },
  { code: 'GE202', name: '创新创业基础', credit: 2, type: '公选' }
]

function viewDetail(_row: GraduationRow) {
  missingCourses.value = mockMissing
  detailVisible.value = true
}

async function runAudit() {
  await ElMessageBox.confirm('确定对当前查询范围内的学生执行毕业审核？', '提示', { type: 'info' })
  ElMessage.success('毕业审核完成（模拟）')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
</style>
