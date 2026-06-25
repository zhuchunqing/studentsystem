/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module 'element-plus/dist/locale/zh-cn.js' {
  const locale: Record<string, unknown>
  export default locale
}
