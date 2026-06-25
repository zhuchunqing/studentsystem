<template>
  <div>
    <el-card shadow="never">
      <div class="toolbar">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="学期">
            <el-input v-model="queryForm.semester" placeholder="如2024-2025-1" clearable />
          </el-form-item>
          <el-form-item label="课程">
            <el-select v-model="queryForm.course_id" placeholder="全部" clearable>
              <el-option v-for="c in courses" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="班级">
            <el-select v-model="queryForm.class_id" placeholder="全部" clearable>
              <el-option v-for="cl in classes" :key="cl.id" :label="cl.name" :value="cl.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchStatistics">查询</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" @click="handleExport">导出报表</el-button>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <p class="stat-label">平均分</p>
            <p class="stat-value">{{ stats.average_score }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <p class="stat-label">及格率</p>
            <p class="stat-value">{{ (stats.pass_rate * 100).toFixed(1) }}%</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <p class="stat-label">最高/最低分</p>
            <p class="stat-value">{{ stats.max_score }} / {{ stats.min_score }}</p>
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
          <template #header><span>分数段分布</span></template>
          <v-chart :option="scoreOption" style="height: 300px" autoresize />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'

use([BarChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

interface Option {
  id: number
  name: string
}

interface Statistics {
  total_students: number
  average_score: number
  max_score: number
  min_score: number
  pass_rate: number
  grade_distribution: Record<string, number>
}

const courses = ref<Option[]>([{ id: 1, name: '高等数学' }, { id: 2, name: '大学英语' }])
const classes = ref<Option[]>([{ id: 1, name: '2024级计算机1班' }])

const queryForm = reactive({ semester: '2024-2025-1', course_id: undefined as number | undefined, class_id: undefined as number | undefined })

const stats = ref<Statistics>({
  total_students: 45,
  average_score: 76.8,
  max_score: 98,
  min_score: 32,
  pass_rate: 0.844,
  grade_distribution: { A: 8, B: 15, C: 12, D: 7, F: 3 }
})

const gradeOption = ref<EChartsOption>({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: ['35%', '65%'],
    data: [
      { value: 8, name: 'A (90-100)', itemStyle: { color: '#67C23A' } },
      { value: 15, name: 'B (80-89)', itemStyle: { color: '#409EFF' } },
      { value: 12, name: 'C (70-79)', itemStyle: { color: '#E6A23C' } },
      { value: 7, name: 'D (60-69)', itemStyle: { color: '#909399' } },
      { value: 3, name: 'F (0-59)', itemStyle: { color: '#F56C6C' } }
    ],
    label: { formatter: '{b}: {c}人 ({d}%)' }
  }]
})

const scoreOption = ref<EChartsOption>({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-100']
  },
  yAxis: { type: 'value' },
  series: [{
    type: 'bar',
    data: [0, 1, 2, 1, 3, 4, 7, 12, 15, 8],
    itemStyle: {
      color: (params: { dataIndex: number }) => params.dataIndex < 5 ? '#F56C6C' : '#409EFF'
    }
  }]
})

function fetchStatistics() {
  ElMessage.success('已刷新统计数据')
}

function handleExport() {
  ElMessage.success('报表导出成功')
}

onMounted(fetchStatistics)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.stat-item { text-align: center; padding: 16px 0; }
.stat-label { font-size: 14px; color: #909399; margin-bottom: 8px; }
.stat-value { font-size: 32px; font-weight: bold; color: #303133; }
</style>
