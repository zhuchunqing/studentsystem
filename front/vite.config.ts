// 引入 Vite 的 defineConfig 工具函数，用于定义配置（提供类型提示）
import { defineConfig } from 'vite'
// 引入 Vue 3 的 Vite 插件，支持 .vue 单文件组件
import vue from '@vitejs/plugin-vue'
// 引入自动导入 API 的 Vite 插件（如 ref、computed 等无需手动 import）
import AutoImport from 'unplugin-auto-import/vite'
// 引入自动注册组件的 Vite 插件（按需加载 .vue 组件）
import Components from 'unplugin-vue-components/vite'
// 引入 Element Plus 组件解析器，配合上面两个插件实现按需导入
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// 引入 Node.js 的 fileURLToPath 和 URL，用于处理文件路径
import { fileURLToPath, URL } from 'node:url'

// 导出 Vite 配置
export default defineConfig({
  // 插件配置
  plugins: [
    // 启用 Vue 3 支持
    vue(),
    // 自动导入 Vue/Vue Router/Pinia API，无需手动 import
    AutoImport({
      resolvers: [ElementPlusResolver()], // 自动按需导入 Element Plus 组件和样式
      imports: ['vue', 'vue-router', 'pinia'] // 指定要自动导入的库
    }),
    // 自动注册 src/components 下的组件
    Components({
      resolvers: [ElementPlusResolver()] // 同样支持 Element Plus 组件自动注册
    })
  ],
  // 路径解析配置
  resolve: {
    // 路径别名
    alias: {
      // 将 @ 指向 src 目录
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 开发服务器配置
  server: {
    port: 5173, // 开发服务器端口号
    proxy: {
      // 代理 /api 开头的请求到后端
      '/api': {
        target: 'http://localhost:8094', // 后端服务地址
        changeOrigin: true // 修改请求源头为目标地址
      }
    }
  }
})
