<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>我的课表</span>
          <el-select v-model="semester" placeholder="选择学期" size="small" style="width:160px">
            <el-option label="2024-2025-1" value="2024-2025-1" />
            <el-option label="2024-2025-2" value="2024-2025-2" />
          </el-select>
        </div>
      </template>

      <el-table :data="scheduleData" stripe border>
        <el-table-column prop="time" label="时间" width="100" fixed />
        <el-table-column v-for="day in weekdays" :key="day.key" :label="day.label" min-width="140">
          <template #default="{ row }">
            <div v-if="row[day.key]" class="schedule-cell has-class">
              <p class="course-name">{{ row[day.key].name }}</p>
              <p class="course-info">{{ row[day.key].teacher }} / {{ row[day.key].room }}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ScheduleSlot {
  name: string
  teacher: string
  room: string
}

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

interface ScheduleRow {
  time: string
  [key: string]: string | ScheduleSlot | null
}

interface Weekday {
  key: DayKey
  label: string
}

const semester = ref('2024-2025-1')
const weekdays: Weekday[] = [
  { key: 'monday', label: '周一' },
  { key: 'tuesday', label: '周二' },
  { key: 'wednesday', label: '周三' },
  { key: 'thursday', label: '周四' },
  { key: 'friday', label: '周五' }
]

const scheduleData = ref<ScheduleRow[]>([
  { time: '第1-2节\n8:00-9:40', monday: { name: '高等数学', teacher: '李教授', room: 'A301' }, tuesday: null, wednesday: { name: '高等数学', teacher: '李教授', room: 'A301' }, thursday: null, friday: null },
  { time: '第3-4节\n10:00-11:40', monday: null, tuesday: { name: '大学英语', teacher: '王教授', room: 'B205' }, wednesday: null, thursday: { name: '大学英语', teacher: '王教授', room: 'B205' }, friday: null },
  { time: '第5-6节\n14:00-15:40', monday: { name: '数据结构', teacher: '赵教授', room: 'C102' }, tuesday: null, wednesday: null, thursday: null, friday: { name: '心理健康', teacher: '孙教授', room: 'D401' } },
  { time: '第7-8节\n16:00-17:40', monday: null, tuesday: { name: '线性代数', teacher: '钱教授', room: 'A203' }, wednesday: null, thursday: null, friday: null }
])
</script>

<style scoped>
.schedule-cell { padding: 8px; border-radius: 4px; }
.has-class { background: #f0f9eb; }
.course-name { font-weight: 500; margin-bottom: 2px; }
.course-info { font-size: 12px; color: #909399; }
</style>
