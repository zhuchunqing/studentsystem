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

      <!-- 注意：后端暂无课表接口，数据为空。后端补充后替换为真实 API 调用。 -->
      <el-empty description="暂无课表数据" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const semester = ref('2024-2025-1')
</script>
