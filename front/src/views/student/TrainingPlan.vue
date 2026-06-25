<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <span>培养方案 - {{ majorInfo.name }}</span>
      </template>

      <el-descriptions :column="3" border style="margin-bottom: 20px">
        <el-descriptions-item label="专业">{{ majorInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="学制">{{ majorInfo.duration }}年</el-descriptions-item>
        <el-descriptions-item label="总学分要求">{{ majorInfo.total_credit }}</el-descriptions-item>
      </el-descriptions>

      <el-progress :percentage="progressPercent" :stroke-width="20" :text-inside="true" style="margin-bottom: 20px">
        <template #default>
          <span>已修 {{ completedCredit }} / {{ majorInfo.total_credit }} 学分</span>
        </template>
      </el-progress>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="必修课" name="required">
          <el-table :data="requiredCourses" stripe>
            <el-table-column prop="code" label="课程编码" width="100" />
            <el-table-column prop="name" label="课程名称" min-width="160" />
            <el-table-column prop="credit" label="学分" width="70" />
            <el-table-column prop="semester" label="建议学期" width="120" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="选修课" name="elective">
          <el-table :data="electiveCourses" stripe>
            <el-table-column prop="code" label="课程编码" width="100" />
            <el-table-column prop="name" label="课程名称" min-width="160" />
            <el-table-column prop="credit" label="学分" width="70" />
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="实践环节" name="practice">
          <el-table :data="practiceCourses" stripe>
            <el-table-column prop="code" label="编码" width="100" />
            <el-table-column prop="name" label="名称" min-width="160" />
            <el-table-column prop="credit" label="学分" width="70" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'passed' ? 'success' : 'info'" size="small">{{ statusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-card shadow="never" style="margin-top: 20px">
      <template #header><span>学业预警</span></template>
      <el-alert v-for="warning in warnings" :key="warning.id" :title="warning.title" :description="warning.description" :type="warning.type" show-icon :closable="false" style="margin-bottom: 10px" />
      <el-empty v-if="!warnings.length" description="暂无学业预警" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PlanCourseRow, PlanCourseStatus } from '@/types'

const statusLabelMap: Record<PlanCourseStatus, string> = { passed: '已通过', failed: '未通过', pending: '未修' }

function statusLabel(status: PlanCourseStatus): string {
  return statusLabelMap[status]
}

function statusTagType(status: PlanCourseStatus): 'success' | 'danger' | 'info' {
  if (status === 'passed') return 'success'
  if (status === 'failed') return 'danger'
  return 'info'
}

interface MajorInfo {
  name: string
  duration: number
  total_credit: number
}

interface Warning {
  id: number
  title: string
  description: string
  type: 'error' | 'warning'
}

const activeTab = ref('required')

const majorInfo = ref<MajorInfo>({
  name: '计算机科学与技术',
  duration: 4,
  total_credit: 160
})

const completedCredit = ref(68)
const progressPercent = computed(() => Math.round((completedCredit.value / majorInfo.value.total_credit) * 100))

const requiredCourses = ref<PlanCourseRow[]>([
  { code: 'CS101', name: '高等数学', credit: 4, semester: '第1学期', status: 'passed' },
  { code: 'CS102', name: '大学英语', credit: 3, semester: '第1-2学期', status: 'passed' },
  { code: 'CS201', name: '数据结构', credit: 3, semester: '第3学期', status: 'failed' },
  { code: 'CS202', name: '线性代数', credit: 3, semester: '第2学期', status: 'passed' },
  { code: 'CS301', name: '操作系统', credit: 3, semester: '第5学期', status: 'pending' },
  { code: 'CS302', name: '计算机网络', credit: 3, semester: '第5学期', status: 'pending' }
])

const electiveCourses = ref<PlanCourseRow[]>([
  { code: 'GE101', name: '心理健康', credit: 2, category: '通识', status: 'passed' },
  { code: 'GE102', name: '创新创业基础', credit: 2, category: '通识', status: 'pending' },
  { code: 'GE201', name: '人工智能导论', credit: 2, category: '专业拓展', status: 'pending' }
])

const practiceCourses = ref<PlanCourseRow[]>([
  { code: 'P001', name: '程序设计实践', credit: 2, status: 'passed' },
  { code: 'P002', name: '数据库课程设计', credit: 2, status: 'pending' },
  { code: 'P003', name: '毕业设计', credit: 8, status: 'pending' }
])

const warnings = ref<Warning[]>([
  { id: 1, title: '必修课未通过：数据结构', description: '该课程为必修课，需通过（含重修）方可毕业。请尽快安排重修。', type: 'error' },
  { id: 2, title: '学分进度偏慢', description: '当前已修68学分，建议本学期修满25学分以跟上培养方案进度。', type: 'warning' }
])
</script>
