// 引入 Vite 的 defineConfig 方法，用于定义 Vite 配置
import { defineConfig } from 'vite'
// Vue 3 单文件组件支持插件
import vue from '@vitejs/plugin-vue'
// 自动导入 API（如 ref、computed 等），无需手动 import
import AutoImport from 'unplugin-auto-import/vite'
// 自动注册组件（如 Element Plus 组件），无需手动 import
import Components from 'unplugin-vue-components/vite'
// Element Plus 组件解析器，配合自动导入插件使用
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// Mock 数据插件，开发环境下拦截 API 请求
import { viteMockServe } from 'vite-plugin-mock'
// Node.js URL 工具，用于解析文件路径
import { fileURLToPath, URL } from 'node:url'

// 导出 Vite 配置（command 参数区分 serve / build）
export default defineConfig(({ command }) => ({
  plugins: [
    // Vue 3 插件
    vue(),
    // 自动导入 Vue / Vue Router / Pinia 的 API
    AutoImport({
      resolvers: [ElementPlusResolver()], // 同时自动导入 Element Plus 的 API
      imports: ['vue', 'vue-router', 'pinia']
    }),
    // 自动注册项目中使用的组件
    Components({
      resolvers: [ElementPlusResolver()] // 自动注册 Element Plus 组件
    }),
    // Mock 服务插件
    viteMockServe({
      mockPath: 'mock',          // Mock 文件所在目录
      enable: command === 'serve', // 仅开发模式下启用
    }),
  ],
  resolve: {
    alias: {
      // 设置 @ 别名指向 src 目录
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173, // 开发服务器端口号
    proxy: {
      // API 请求代理
      '/api': {
        target: 'http://localhost:8094', // 后端服务地址
        changeOrigin: true                // 允许跨域
      }
    }
  }
}))
