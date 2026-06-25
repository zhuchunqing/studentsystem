<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="item in statCards" :key="item.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-title">{{ item.title }}</p>
              <p class="stat-value">{{ item.value }}</p>
            </div>
            <el-icon :size="48" :color="item.color" class="stat-icon">
              <component :is="item.icon" />
            </el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span>成绩分布概览</span>
          </template>
          <v-chart :option="scoreChartOption" style="height: 320px" autoresize />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>选课人数TOP5</span>
          </template>
          <v-chart :option="courseChartOption" style="height: 320px" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>待办事项</span>
          </template>
          <el-table :data="todoItems" stripe>
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="content" label="内容" />
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleTodo(row)">处理</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>通知公告</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="notice in notices"
              :key="notice.id"
              :timestamp="notice.time"
              placement="top"
            >
              <p class="notice-title">{{ notice.title }}</p>
              <p class="notice-content">{{ notice.content }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'

use([BarChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const userStore = useUserStore()

interface StatCard {
  title: string
  value: number | string
  icon: string
  color: string
}

const statCards = computed<StatCard[]>(() => {
  if (userStore.isAdmin) {
    return [
      { title: '教师总数', value: 126, icon: 'UserFilled', color: '#409EFF' },
      { title: '学生总数', value: 3842, icon: 'Avatar', color: '#67C23A' },
      { title: '开设课程', value: 98, icon: 'Notebook', color: '#E6A23C' },
      { title: '待审成绩', value: 15, icon: 'CircleCheck', color: '#F56C6C' }
    ]
  } else if (userStore.isTeacher) {
    return [
      { title: '授课数量', value: 4, icon: 'Notebook', color: '#409EFF' },
      { title: '学生人数', value: 186, icon: 'Avatar', color: '#67C23A' },
      { title: '待录成绩', value: 3, icon: 'Edit', color: '#E6A23C' },
      { title: '本周课时', value: 12, icon: 'Calendar', color: '#F56C6C' }
    ]
  } else {
    return [
      { title: '已修学分', value: 68, icon: 'Medal', color: '#409EFF' },
      { title: '本学期课程', value: 6, icon: 'Notebook', color: '#67C23A' },
      { title: '当前GPA', value: '3.52', icon: 'TrendCharts', color: '#E6A23C' },
      { title: '待选课程', value: 2, icon: 'Pointer', color: '#F56C6C' }
    ]
  }
})

const scoreChartOption = ref<EChartsOption>({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['优秀', '良好', '中等', '及格', '不及格']
  },
  yAxis: { type: 'value' },
  series: [{
    type: 'bar',
    data: [42, 88, 65, 35, 12],
    itemStyle: {
      color: (params: { dataIndex: number }) => {
        const colors = ['#67C23A', '#409EFF', '#E6A23C', '#909399', '#F56C6C']
        return colors[params.dataIndex]
      }
    }
  }]
})

const courseChartOption = ref<EChartsOption>({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    data: [
      { value: 124, name: '高等数学' },
      { value: 98, name: '大学英语' },
      { value: 87, name: '计算机基础' },
      { value: 76, name: '线性代数' },
      { value: 65, name: '数据结构' }
    ]
  }]
})

interface TodoItem {
  type: string
  content: string
  time: string
}

interface Notice {
  id: number
  title: string
  content: string
  time: string
}

const todoItems = ref<TodoItem[]>([
  { type: '成绩审核', content: '2024级计算机1班《高等数学》成绩待审核', time: '2025-01-15 09:30' },
  { type: '选课审批', content: '3名学生退选申请待处理', time: '2025-01-14 16:20' },
  { type: '成绩修改', content: '张同学《数据结构》成绩修改申请', time: '2025-01-14 10:15' }
])

const notices = ref<Notice[]>([
  { id: 1, title: '2025年春季学期选课通知', content: '选课时间为1月20日-2月5日，请同学们按时完成选课。', time: '2025-01-10' },
  { id: 2, title: '期末成绩录入截止提醒', content: '本学期成绩录入截止日期为1月25日，请各位老师及时完成。', time: '2025-01-08' },
  { id: 3, title: '系统维护通知', content: '1月18日22:00-次日6:00进行系统维护，届时暂停服务。', time: '2025-01-05' }
])

function handleTodo(_row: TodoItem) {
  // Navigate based on type
}
</script>

<style scoped>
.stat-card {
  height: 120px;
}
.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
.stat-icon {
  opacity: 0.8;
}
.notice-title {
  font-weight: 500;
  margin-bottom: 4px;
}
.notice-content {
  font-size: 13px;
  color: #909399;
}
</style>
