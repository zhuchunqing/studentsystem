<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>教学课表</span>
          <el-select v-model="semester" placeholder="选择学期" size="small" style="width:160px">
            <el-option label="2024-2025-1" value="2024-2025-1" />
            <el-option label="2024-2025-2" value="2024-2025-2" />
          </el-select>
        </div>
      </template>

      <el-table :data="scheduleData" stripe border>
        <el-table-column prop="time" label="时间" width="100" fixed />
        <el-table-column label="周一" min-width="140">
          <template #default="{ row }">
            <div v-if="row.monday" class="schedule-cell has-class">
              <p class="course-name">{{ row.monday.name }}</p>
              <p class="course-info">{{ row.monday.room }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="周二" min-width="140">
          <template #default="{ row }">
            <div v-if="row.tuesday" class="schedule-cell has-class">
              <p class="course-name">{{ row.tuesday.name }}</p>
              <p class="course-info">{{ row.tuesday.room }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="周三" min-width="140">
          <template #default="{ row }">
            <div v-if="row.wednesday" class="schedule-cell has-class">
              <p class="course-name">{{ row.wednesday.name }}</p>
              <p class="course-info">{{ row.wednesday.room }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="周四" min-width="140">
          <template #default="{ row }">
            <div v-if="row.thursday" class="schedule-cell has-class">
              <p class="course-name">{{ row.thursday.name }}</p>
              <p class="course-info">{{ row.thursday.room }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="周五" min-width="140">
          <template #default="{ row }">
            <div v-if="row.friday" class="schedule-cell has-class">
              <p class="course-name">{{ row.friday.name }}</p>
              <p class="course-info">{{ row.friday.room }}</p>
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
  room: string
}

interface ScheduleRow {
  time: string
  monday: ScheduleSlot | null
  tuesday: ScheduleSlot | null
  wednesday: ScheduleSlot | null
  thursday: ScheduleSlot | null
  friday: ScheduleSlot | null
}

const semester = ref('2024-2025-1')

const scheduleData = ref<ScheduleRow[]>([
  { time: '第1-2节\n8:00-9:40', monday: { name: '高等数学', room: 'A301' }, tuesday: null, wednesday: { name: '高等数学', room: 'A301' }, thursday: null, friday: null },
  { time: '第3-4节\n10:00-11:40', monday: null, tuesday: { name: '线性代数', room: 'B205' }, wednesday: null, thursday: { name: '线性代数', room: 'B205' }, friday: null },
  { time: '第5-6节\n14:00-15:40', monday: null, tuesday: null, wednesday: null, thursday: null, friday: { name: '概率统计', room: 'C102' } },
  { time: '第7-8节\n16:00-17:40', monday: null, tuesday: null, wednesday: null, thursday: null, friday: null }
])
</script>

<style scoped>
.schedule-cell {
  padding: 8px;
  border-radius: 4px;
}
.has-class {
  background: #ecf5ff;
}
.course-name {
  font-weight: 500;
  margin-bottom: 2px;
}
.course-info {
  font-size: 12px;
  color: #909399;
}
</style>
