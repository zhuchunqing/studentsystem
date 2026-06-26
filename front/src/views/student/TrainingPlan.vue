<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <span>培养方案</span>
      </template>

      <!-- 注意：后端暂无培养方案接口，数据为空。后端补充后替换为真实 API 调用。 -->
      <el-empty description="暂无培养方案数据" />
    </el-card>

    <el-card shadow="never" style="margin-top: 20px">
      <template #header><span>学业预警</span></template>
      <el-empty description="暂无学业预警" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 后端补充培养方案接口后，在此处添加 API 调用
</script>
