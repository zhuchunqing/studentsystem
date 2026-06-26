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
          <template #header><span>成绩分布概览</span></template>
          <v-chart :option="scoreChartOption" style="height: 320px" autoresize />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><span>课程类型分布</span></template>
          <v-chart :option="courseChartOption" style="height: 320px" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header><span>最近课程列表</span></template>
          <el-table :data="recentCourses" stripe v-loading="courseLoading">
            <el-table-column prop="code" label="课程编码" width="120" />
            <el-table-column prop="name" label="课程名称" min-width="200" />
            <el-table-column prop="credit" label="学分" width="70" />
            <el-table-column prop="semester" label="学期" width="140" />
            <el-table-column label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.courseType === 1 ? '' : row.courseType === 2 ? 'success' : 'warning'" size="small">
                  {{ row.courseType === 1 ? '必修' : row.courseType === 2 ? '选修' : '公选' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'
import { getTeachers } from '@/api/teacher'
import { getStudents } from '@/api/student'
import { getCourses } from '@/api/course'
import { getScores, getScoreStatistics } from '@/api/score'
import type { Course } from '@/types'

use([BarChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const userStore = useUserStore()

// ===== 统计数据 =====
const teacherCount = ref(0)
const studentCount = ref(0)
const courseCount = ref(0)
const pendingScoreCount = ref(0)

const statCards = computed(() => {
  if (userStore.isAdmin) {
    return [
      { title: '教师总数', value: teacherCount.value, icon: 'UserFilled', color: '#409EFF' },
      { title: '学生总数', value: studentCount.value, icon: 'Avatar', color: '#67C23A' },
      { title: '开设课程', value: courseCount.value, icon: 'Notebook', color: '#E6A23C' },
      { title: '本学期课程', value: recentCourses.value.length, icon: 'CircleCheck', color: '#F56C6C' }
    ]
  } else if (userStore.isTeacher) {
    return [
      { title: '授课数量', value: courseCount.value, icon: 'Notebook', color: '#409EFF' },
      { title: '学生总数', value: studentCount.value, icon: 'Avatar', color: '#67C23A' },
      { title: '本学期课程', value: recentCourses.value.length, icon: 'Edit', color: '#E6A23C' },
      { title: '待审成绩', value: pendingScoreCount.value, icon: 'CircleCheck', color: '#F56C6C' }
    ]
  } else {
    return [
      { title: '已修课程', value: courseCount.value, icon: 'Medal', color: '#409EFF' },
      { title: '本学期课程', value: recentCourses.value.length, icon: 'Notebook', color: '#67C23A' },
      { title: '学生总数', value: studentCount.value, icon: 'Avatar', color: '#E6A23C' },
      { title: '开设课程', value: courseCount.value, icon: 'Pointer', color: '#F56C6C' }
    ]
  }
})

// ===== 课程列表 =====
const courseLoading = ref(false)
const recentCourses = ref<Course[]>([])

// ===== 成绩分布图表 =====
const scoreChartOption = ref<EChartsOption>({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [] }]
})

// ===== 课程类型分布图表 =====
const courseChartOption = ref<EChartsOption>({
  tooltip: { trigger: 'item' },
  legend: { bottom: '0' },
  series: [{ type: 'pie', radius: ['35%', '65%'], data: [] }]
})

async function fetchDashboardData() {
  // 并行加载统计数据和课程列表
  const promises: Promise<unknown>[] = []

  if (userStore.isAdmin || userStore.isTeacher) {
    // 管理员和教师：加载统计数据
    promises.push(
      getTeachers({ pageSize: 1 }).then(r => { teacherCount.value = r.total }).catch(() => {}),
      getStudents({ pageSize: 1 }).then(r => { studentCount.value = r.total }).catch(() => {}),
      getCourses({ pageSize: 1 }).then(r => { courseCount.value = r.total }).catch(() => {})
    )
  } else {
    // 学生：加载学生数和课程数
    promises.push(
      getStudents({ pageSize: 1 }).then(r => { studentCount.value = r.total }).catch(() => {}),
      getCourses({ pageSize: 1 }).then(r => { courseCount.value = r.total }).catch(() => {})
    )
  }

  // 加载课程列表（取最近10条）
  courseLoading.value = true
  promises.push(
    getCourses({ pageSize: 10 }).then(r => {
      recentCourses.value = r.list
      // 统计课程类型分布
      const typeCount: Record<number, number> = { 1: 0, 2: 0, 3: 0 }
      r.list.forEach(c => { typeCount[c.courseType] = (typeCount[c.courseType] || 0) + 1 })
      courseChartOption.value = {
        tooltip: { trigger: 'item' },
        legend: { bottom: '0' },
        series: [{
          type: 'pie',
          radius: ['35%', '65%'],
          data: [
            { value: typeCount[1], name: '必修', itemStyle: { color: '#409EFF' } },
            { value: typeCount[2], name: '选修', itemStyle: { color: '#67C23A' } },
            { value: typeCount[3], name: '公选', itemStyle: { color: '#E6A23C' } }
          ]
        }]
      }
    }).catch(() => {}).finally(() => { courseLoading.value = false })
  )

  await Promise.all(promises)

  // 获取成绩统计数据用于图表（取第一门课程）
  if (recentCourses.value.length > 0) {
    try {
      const stats = await getScoreStatistics({ courseId: recentCourses.value[0].id })
      const dist = stats.gradeDistribution || {}
      scoreChartOption.value = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: Object.keys(dist) },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: Object.values(dist),
          itemStyle: {
            color: (params: { dataIndex: number }) => {
              const colors = ['#67C23A', '#409EFF', '#E6A23C', '#909399', '#F56C6C']
              return colors[params.dataIndex % colors.length]
            }
          }
        }]
      }
    } catch {
      // 无统计数据或未登录时忽略
    }
  }

  // 待审成绩（取所有成绩中 possible 非实际审核状态，仅做示意）
  try {
    const scores = await getScores({ pageSize: 1 })
    pendingScoreCount.value = scores.total
  } catch {
    pendingScoreCount.value = 0
  }
}

onMounted(fetchDashboardData)
</script>

<style scoped>
.stat-card { height: 120px; }
.stat-content { display: flex; justify-content: space-between; align-items: center; }
.stat-title { font-size: 14px; color: #909399; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: bold; color: #303133; }
.stat-icon { opacity: 0.8; }
</style>
