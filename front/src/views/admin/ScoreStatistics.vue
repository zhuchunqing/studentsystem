<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="课程">
            <el-select v-model="queryForm.courseId" placeholder="请选择课程" clearable filterable style="width:220px" @change="onCourseChange">
              <el-option v-for="c in courseOptions" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="学期">
            <el-input v-model="queryForm.semester" placeholder="如2024-2025-1" clearable style="width:160px" @keyup.enter="fetchStatistics" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchStatistics">查询</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" @click="handleExport" :disabled="!stats">导出报表</el-button>
      </div>
    </el-card>

    <el-empty v-if="!stats && !loading" description="请先选择课程查看统计数据" />

    <template v-if="stats">
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <p class="stat-label">平均分</p>
              <p class="stat-value">{{ stats.averageScore.toFixed(1) }}</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <p class="stat-label">及格率</p>
              <p class="stat-value">{{ (stats.passRate * 100).toFixed(1) }}%</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <p class="stat-label">最高分</p>
              <p class="stat-value">{{ stats.maxScore }}</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <p class="stat-label">最低分</p>
              <p class="stat-value">{{ stats.minScore }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header><span>成绩等级分布</span></template>
            <v-chart :option="gradeOption" style="height: 300px" autoresize />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header><span>基本信息</span></template>
            <div class="stat-item">
              <p class="stat-label">统计学生数</p>
              <p class="stat-value">{{ stats.totalStudents }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'
import { getScoreStatistics, exportScores } from '@/api/score'
import { getCourses } from '@/api/course'
import type { CourseOption, ScoreStatistics } from '@/types'

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const loading = ref(false)
const courseOptions = ref<CourseOption[]>([])

const queryForm = reactive({
  semester: '',
  courseId: undefined as number | undefined
})

const stats = ref<ScoreStatistics | null>(null)

const gradeColors: Record<string, string> = {
  A: '#67C23A', 'A-': '#67C23A',
  'B+': '#409EFF', B: '#409EFF', 'B-': '#409EFF',
  'C+': '#E6A23C', C: '#E6A23C', 'C-': '#E6A23C',
  'D+': '#909399', D: '#909399',
  F: '#F56C6C'
}

const gradeOption = computed<EChartsOption>(() => {
  const dist = stats.value?.gradeDistribution || {}
  const entries = Object.entries(dist).filter(([, v]) => v > 0)
  if (entries.length === 0) {
    return {
      title: { text: '暂无等级分布数据', left: 'center', top: 'center', textStyle: { fontSize: 14, color: '#909399' } },
      series: []
    }
  }
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0' },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      data: entries.map(([key, value]) => ({
        value,
        name: `${key}`,
        itemStyle: { color: gradeColors[key] || '#999' }
      })),
      label: { formatter: '{b}: {c}人 ({d}%)' }
    }]
  }
})

function onCourseChange() {
  if (queryForm.courseId) {
    fetchStatistics()
  }
}

async function fetchStatistics() {
  if (!queryForm.courseId) {
    ElMessage.warning('请先选择课程')
    return
  }
  loading.value = true
  try {
    stats.value = await getScoreStatistics({
      courseId: queryForm.courseId,
      semester: queryForm.semester || undefined
    })
  } catch {
    stats.value = null
  } finally {
    loading.value = false
  }
}

async function handleExport() {
  if (!queryForm.courseId || !stats.value) {
    ElMessage.warning('请先查询统计数据')
    return
  }
  try {
    const blob = await exportScores({
      courseId: queryForm.courseId,
      semester: queryForm.semester || undefined
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '成绩统计报表.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('报表导出成功')
  } catch {
    // error handled in interceptor
  }
}

onMounted(async () => {
  // 加载课程下拉列表
  const res = await getCourses({ pageSize: 999 })
  courseOptions.value = res.list.map(c => ({ id: c.id, name: c.name }))
  // 默认选中第一门课程并加载统计
  if (courseOptions.value.length > 0) {
    queryForm.courseId = courseOptions.value[0].id
    fetchStatistics()
  }
})
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.stat-item { text-align: center; padding: 16px 0; }
.stat-label { font-size: 14px; color: #909399; margin-bottom: 8px; }
.stat-value { font-size: 32px; font-weight: bold; color: #303133; }
</style>
