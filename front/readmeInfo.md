# 前端项目架构详情（SEMS 学生教育管理系统）

---

## 一、项目从哪个文件开始启动

### 启动命令

```bash
cd front
npm run dev      # 启动开发服务器，端口 5173
```

### 启动链路

```
终端执行 npm run dev
  → package.json: scripts.dev = "vite"
  → Vite 读取项目根目录 vite.config.ts（构建配置）
  → Vite 读取 index.html 作为入口 HTML
  → <script type="module" src="/src/main.ts"> 加载应用主入口
  → src/main.ts 创建 Vue 应用并挂载
```

### 逐文件详解

#### 1. `package.json` — 启动脚本定义

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  }
}
```

`npm run dev` 直接执行 `vite`，Vite 自动查找当前目录的 `vite.config.ts` 和 `index.html`。

#### 2. `vite.config.ts` — Vite 构建配置

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { viteMockServe } from 'vite-plugin-mock'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),                                    // 编译 .vue 单文件组件
    AutoImport({
      resolvers: [ElementPlusResolver()],      // 自动按需导入 Element Plus
      imports: ['vue', 'vue-router', 'pinia']  // 全局自动导入 ref/reactive/watch/useRouter 等
    }),
    Components({
      resolvers: [ElementPlusResolver()]       // 自动按需注册 Element Plus 组件
    }),
    viteMockServe({
      mockPath: 'mock',                        // mock 文件目录为项目根目录下的 mock/
      enable: command === 'serve',             // 仅在 npm run dev 时启用
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))  // @ → src/ 目录
    }
  },
  server: {
    port: 5173,                                // 开发服务器端口
    proxy: {
      '/api': {
        target: 'http://localhost:8094',       // 未命中 mock 的 API 请求代理到后端
        changeOrigin: true
      }
    }
  }
}))
```

**关键点：**
- `vite-plugin-mock` 在 `command === 'serve'` 时启用，拦截所有 `/api/v1/*` 请求并返回 mock 数据
- mock 请求先于 Vite 代理，若 mock 未匹配才会透传到后端 `localhost:8094`
- `@` 路径别名 → `src/`，组件中可直接 `import xxx from '@/api/auth'`
- `unplugin-auto-import` 使 `.vue` 文件中无需手动 `import { ref, computed } from 'vue'`

#### 3. `index.html` — HTML 入口

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>学生教育管理系统</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

Vite 以 `<script type="module" src="/src/main.ts">` 识别入口 TS 文件，进行 ESM 原生模块加载。

#### 4. `src/main.ts` — 应用创建与启动

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// 全局注册所有 Element Plus 图标（可直接在 template 中使用 <el-icon><School /></el-icon>）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)                            // 步骤1：Pinia 状态管理
app.use(router)                           // 步骤2：Vue Router 路由
app.use(ElementPlus, { locale: zhCn })    // 步骤3：Element Plus UI 库（中文）
app.mount('#app')                         // 步骤4：挂载到 #app DOM 节点
```

**插件注册顺序：** Pinia → Router → Element Plus

#### 5. `src/App.vue` — 根组件

```vue
<template>
  <router-view />
</template>

<script setup lang="ts">
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; font-family: 'Microsoft YaHei', sans-serif; }
</style>
```

极简根组件：全局 CSS Reset + 纯路由出口 `<router-view />`。

#### 6. 首次访问的路由流转

```
浏览器访问 http://localhost:5173/
  → 路由 / 配置了 redirect: '/dashboard'
  → 路由守卫 beforeEach 触发
    → to.meta.requiresAuth 为 true（默认值），userStore.token 为空（localStorage 无数据）
    → 执行 next('/login')
  → 路由到 /login
    → to.meta.requiresAuth 为 false，放行
    → 渲染 LoginView.vue（登录页面）
```

**路由守卫完整逻辑（`src/router/index.ts`）：**

```typescript
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  document.title = to.meta.title
    ? `${to.meta.title} - 学生教育管理系统`
    : '学生教育管理系统'

  // 条件1：需要认证且无 token → 跳登录页
  if (to.meta.requiresAuth !== false && !userStore.token) {
    next('/login')
  }
  // 条件2：有角色限制但角色不匹配 → 跳首页
  else if (to.meta.roles && !to.meta.roles.includes(userStore.role as UserRole)) {
    next('/dashboard')
  }
  // 条件3：通过
  else {
    next()
  }
})
```

#### 7. `src/stores/user.ts` — 状态管理初始化

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 从 localStorage 恢复上次登录状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const username = ref<string>(localStorage.getItem('username') || '')
  const role = ref<string>(localStorage.getItem('role') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'admin')
  const isTeacher = computed(() => role.value === 'teacher')
  const isStudent = computed(() => role.value === 'student')

  async function login(loginForm: LoginRequest): Promise<void> {
    const data: LoginResult = await loginApi(loginForm)
    token.value = data.token
    username.value = data.username
    role.value = data.role
    localStorage.setItem('token', data.token)        // 持久化 token
    localStorage.setItem('username', data.username)   // 持久化用户名
    localStorage.setItem('role', data.role)           // 持久化角色
  }

  function logout(): void {
    token.value = ''
    username.value = ''
    role.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
  }

  return { token, username, role, isLoggedIn, isAdmin, isTeacher, isStudent, login, logout }
})
```

**首次访问时** `token` / `username` / `role` 从 `localStorage` 读取，未登录则为空字符串。

---

## 二、项目架构总结

### 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 运行时环境 | Node.js | — |
| 前端框架 | Vue 3（Composition API + `<script setup>`） | ^3.4.0 |
| 类型系统 | TypeScript | ^5.4.0 |
| 构建工具 | Vite | ^5.4.0 |
| 路由 | Vue Router（History 模式） | ^4.3.0 |
| 状态管理 | Pinia（Setup Store 风格） | ^2.1.0 |
| UI 组件库 | Element Plus + 中文 locale | ^2.7.0 |
| HTTP 客户端 | Axios | ^1.7.0 |
| 图表 | ECharts + vue-echarts | ^5.5.0 / ^6.6.0 |
| Mock 服务 | vite-plugin-mock + mockjs | ^3.0.2 / ^1.1.0 |
| 自动导入 | unplugin-auto-import + unplugin-vue-components | ^0.17.0 / ^0.27.0 |

### 项目目录结构

```
front/
├── index.html                    # HTML 入口
├── vite.config.ts                # Vite 构建配置（插件/代理/别名/mock）
├── package.json                  # 依赖与脚本
├── tsconfig.json                 # TypeScript 配置
├── tsconfig.node.json            # Vite 配置文件的 TS 配置
├── env.d.ts                      # 环境类型声明（.vue 文件类型支持）
├── auto-imports.d.ts             # unplugin 自动生成（自动导入的类型提示）
├── components.d.ts               # unplugin 自动生成（组件自动注册的类型提示）
├── mock/                         # ★ Mock 数据模块（10 个文件，覆盖全部 API）
│   ├── data.ts                   #    共享内存数据源 + 工具函数
│   ├── auth.ts                   #    登录/登出/修改密码
│   ├── user.ts                   #    用户 CRUD
│   ├── department.ts             #    院系树形 CRUD
│   ├── class.ts                  #    班级 CRUD
│   ├── teacher.ts                #    教师 CRUD
│   ├── student.ts                #    学生 CRUD + 批量导入
│   ├── course.ts                 #    课程 CRUD
│   ├── score.ts                  #    成绩 CRUD + 批量 + 审核 + 统计
│   └── enrollment.ts             #    选课/退课/学生列表
└── src/
    ├── main.ts                   # ★ 应用入口（创建 Vue 实例 + 插件注册）
    ├── App.vue                   # ★ 根组件（全局样式 + router-view）
    ├── api/                      # API 接口层（9 个模块，共 50+ 个函数）
    │   ├── auth.ts               #    认证：login / logout / changePassword
    │   ├── user.ts               #    用户管理：CRUD / resetPassword / toggleStatus
    │   ├── department.ts         #    院系管理：CRUD + 树形查询 + 下拉选项
    │   ├── class.ts              #    班级管理：CRUD + 下拉选项
    │   ├── teacher.ts            #    教师管理：CRUD + 下拉选项
    │   ├── student.ts            #    学生管理：CRUD + 批量导入 + 下拉选项
    │   ├── course.ts             #    课程管理：CRUD + 下拉选项
    │   ├── score.ts              #    成绩管理：CRUD / batch / audit / statistics / export
    │   └── enrollment.ts         #    选课管理：CRUD / courseStudents / drop
    ├── types/                    # TypeScript 类型定义
    │   ├── index.ts              #    统一导出
    │   ├── common.ts             #    通用类型：ApiResult / PageResult / PageQuery / LoginRequest
    │   ├── enums.ts              #    枚举类型：UserRole / Gender / CourseType / ScoreType 等
    │   └── models.ts             #    数据模型：30+ 个 interface（实体、DTO、前端展示模型）
    ├── utils/
    │   └── request.ts            # ★ Axios 封装（拦截器/错误处理/类型安全方法）
    ├── router/
    │   └── index.ts              # ★ 路由配置（20 个路由 + 守卫 + 角色权限）
    ├── stores/
    │   └── user.ts               # ★ 用户状态 Store（token/role 持久化）
    ├── layouts/
    │   └── MainLayout.vue        # 主布局（侧边栏/顶栏/面包屑/密码修改弹窗）
    └── views/                    # 页面组件（19 个）
        ├── login/
        │   └── LoginView.vue     #    登录页
        ├── dashboard/
        │   └── DashboardView.vue #    仪表盘（统计卡片 + ECharts 图表）
        ├── admin/                #    管理员页面（9 个）
        │   ├── UserManage.vue    #      用户管理（使用内联 mock，不经过 api/ 层）
        │   ├── DepartmentManage.vue   #  院系管理（树形表格）
        │   ├── ClassManage.vue   #      班级管理
        │   ├── CourseManage.vue  #      课程管理
        │   ├── TeacherManage.vue #      教师管理
        │   ├── StudentManage.vue #      学生管理
        │   ├── ScoreAudit.vue    #      成绩审核
        │   ├── ScoreStatistics.vue #    成绩统计（ECharts 图表）
        │   └── GraduationAudit.vue #    毕业审核（使用内联 mock，不经过 api/ 层）
        ├── teacher/              #    教师页面（4 个）
        │   ├── MyCourses.vue     #      我的课程
        │   ├── StudentRoster.vue #      学生名册
        │   ├── ScoreInput.vue    #      成绩录入（三列成绩 + 自动计算总评）
        │   └── ScheduleView.vue  #      教学课表（占位页面，无 API 调用）
        └── student/              #    学生页面（4 个）
            ├── CourseSelection.vue #    选课中心
            ├── MyScores.vue      #      成绩查询 + 导出
            ├── MySchedule.vue    #      我的课表（占位页面，无 API 调用）
            └── TrainingPlan.vue  #      培养方案（占位页面，无 API 调用）
```

### 应用启动全链路流程图

```
npm run dev
  │
  ▼
vite（读取 vite.config.ts）  ──── viteMockServe({ enable: command === 'serve' })
  │                               → 注册 mock 中间件，拦截 /api/v1/* 请求
  ▼
index.html  ─── <script type="module" src="/src/main.ts">
  │
  ▼
src/main.ts
  │
  ├─ createApp(App)
  ├─ app.use(pinia)              → 注册 Pinia
  ├─ app.use(router)             → 注册 Vue Router
  ├─ app.use(ElementPlus)        → 注册 Element Plus（中文）
  └─ app.mount('#app')           → 挂载到 DOM
       │
       ▼
  App.vue  ─── <router-view />
       │
       ▼
  Router 解析 URL /
       │
       ▼
  beforeEach 守卫
       │
       ├─ 无 token → /login  →  LoginView.vue  →  用户输入账号密码
       │                                               │
       │                                     userStore.login() → loginApi()
       │                                               │
       │                                     POST /api/v1/auth/login
       │                                               │
       │                                    【被 mock 拦截，返回 mock token】
       │                                               │
       │                                     localStorage 持久化 → router.push('/dashboard')
       │
       └─ 有 token → 检查角色权限 → 渲染目标页面
                       │
                       ▼
              MainLayout.vue（侧边栏 + 顶栏）
                       │
                       ▼
              <router-view /> → 子页面组件
```

### 数据流转架构

```
┌─────────────────────────────────────────────────────────────┐
│                       Vue 页面组件                           │
│  DashboardView / CourseManage / ScoreInput / ...            │
│  - 调用 API 函数获取数据                                      │
│  - 使用 useUserStore 获取用户状态                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ import { getCourses } from '@/api/course'
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   src/api/ 接口层                            │
│  getCourses(params) → get<PageResult<Course>>('/courses', …) │
│  所有请求 baseURL 统一为 /api/v1                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ get/post/put/del()
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               src/utils/request.ts（Axios 封装）              │
│                                                             │
│  请求拦截器：                                                 │
│    config.headers.Authorization = `Bearer ${token}`         │
│                                                             │
│  响应拦截器：                                                 │
│    code === 200  →  return res.data（剥离外壳）               │
│    code !== 200  →  ElMessage.error + reject                 │
│    401 / 403     →  logout + router.push('/login')           │
│    responseType='blob' → 直接返回原始数据（文件下载）          │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP 请求
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Vite Dev Server                                │
│                                                             │
│  viteMockServe 中间件（优先级最高）                            │
│    ├─ 匹配到 mock 路由 → 返回 mock 数据（{ code, message, data }）│
│    └─ 未匹配 → 透传到下一层                                   │
│                                                             │
│  Vite Proxy 代理（次优先级）                                   │
│    /api → http://localhost:8094（后端服务）                    │
└─────────────────────────────────────────────────────────────┘
```

### 响应拦截器核心逻辑

后端返回格式（`Result<T>`）：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { "list": [...], "total": 15 }
}
```

拦截器处理：
```typescript
const res = response.data as { code: number; message: string; data: any }
if (res.code === 200) {
  return res.data   // ← 剥离外壳，API 函数直接拿到 data 内容
}
// code !== 200 时弹出错误提示并 reject
```

**关键结论：** API 函数返回的就是 `data` 本身，页面调用时**不应再访问 `.data`**。
例如 `const res = await getCourses(...)` → `res.list` 直接可用，不应该写 `res.data.list`。

---

## 三、路由与权限架构

### 路由表

| 路径 | 组件 | 角色权限 | requiresAuth |
|------|------|----------|:---:|
| `/login` | LoginView | — | false |
| `/` | MainLayout → redirect `/dashboard` | 全部 | true |
| `/dashboard` | DashboardView | 全部 | true |
| `/admin/users` | UserManage | admin | true |
| `/admin/departments` | DepartmentManage | admin | true |
| `/admin/classes` | ClassManage | admin | true |
| `/course-admin/courses` | CourseManage | admin | true |
| `/course-admin/teachers` | TeacherManage | admin | true |
| `/course-admin/students` | StudentManage | admin | true |
| `/score-admin/audit` | ScoreAudit | admin | true |
| `/score-admin/statistics` | ScoreStatistics | admin | true |
| `/score-admin/graduation` | GraduationAudit | admin | true |
| `/teacher/my-courses` | MyCourses | teacher, admin | true |
| `/teacher/roster/:courseId` | StudentRoster | teacher, admin | true |
| `/teacher/score-input` | ScoreInput | teacher, admin | true |
| `/teacher/schedule` | ScheduleView | teacher, admin | true |
| `/student/course-selection` | CourseSelection | student, admin | true |
| `/student/my-scores` | MyScores | student, admin | true |
| `/student/my-schedule` | MySchedule | student, admin | true |
| `/student/training-plan` | TrainingPlan | student, admin | true |
| `/:pathMatch(.*)*` | → `/dashboard` | — | — |

### 权限判断流程

```
router.beforeEach
  │
  ├─ requiresAuth !== false 且 无 token？
  │    └─ 是 → next('/login')
  │
  ├─ to.meta.roles 存在 且 role 不在列表中？
  │    └─ 是 → next('/dashboard')
  │
  └─ 否 → next() 放行
```

---

## 四、Mock 机制详解

### Mock 启用条件

`vite-plugin-mock` 仅在 `command === 'serve'`（即 `npm run dev`）时启用。`npm run build` 时不包含 mock 代码。

### Mock 数据源

`mock/data.ts` 提供所有 mock 数据（内存数据，不持久化）：

| 数据集 | 条数 | 说明 |
|--------|:---:|------|
| `departments` | 10 | 3 个学院 + 7 个系（树形结构） |
| `teachers` | 12 | 含工号、职称、所属院系 |
| `classes` | 10 | 含专业、年级、班主任 |
| `students` | 25 | 含学号、性别、班级 |
| `courses` | 15 | 含课程编码、学分、课程类型、学期 |
| `scores` | 13 | 成绩记录（含等级、是否及格） |
| `courseSelections` | 14 | 选课记录（含选课/退选状态） |
| `users` | 7 | 含 admin + 3 位教师 + 3 名学生账号 |

### Mock 请求处理流程

```
浏览器发送 GET /api/v1/courses?pageNum=1&pageSize=10
  │
  ▼
viteMockServe 中间件
  │
  ├─ 遍历 mock 模块数组（Array.find 匹配第一个）
  │
  ├─ 匹配规则：
  │    1. method 匹配（大小写不敏感）
  │    2. url 匹配（path-to-regexp 正则匹配）
  │
  ├─ 匹配成功：
  │    ├─ 解析 query（GET 有查询参数时仅含 URL 查询参数，路径参数丢失）
  │    ├─ 解析 body（非 GET 请求时解析请求体）
  │    ├─ 执行 response 函数
  │    ├─ Mock.mock() 处理返回数据（Date 模板等，普通对象原样返回）
  │    └─ res.end(JSON.stringify(response))
  │
  └─ 未匹配：
       └─ next() → Vite Proxy → localhost:8094（后端）
```

### Mock 路由顺序规则（重要）

**精确路径必须放在 `/:id` 之前。**

`path-to-regexp` 将 `:id` 解析为 `([^/]+)`，会匹配任意非斜杠字符串。若不遵守顺序，固定路径（如 `statistics`）会被 `/:id` 路由错误拦截。

示例（`score.ts`）：
```typescript
export default [
  { url: '/api/v1/scores/statistics', method: 'get' },   // ★ 必须在前面
  { url: '/api/v1/scores/:id',         method: 'get' },   // 否则会误匹配
  // ...
]
```

### Mock 查询参数与路径参数合并规则

| 请求类型 | `query` 对象内容 |
|----------|----------------|
| GET 无查询参数 | 路径参数（如 `{ id: '1' }`） |
| GET 有查询参数 | **仅** URL 查询参数，路径参数**丢失** |
| PUT / DELETE | **仅** 路径参数，URL 查询参数**丢失** |

对于 GET + 路径参数 + 查询参数的场景（如 `/courses/:courseId/selections?pageSize=999`），需从 `url` 中用正则提取路径参数：

```typescript
response: ({ url, query }: any) => {
  const match = url.match(/\/courses\/(\d+)\/selections/)
  const courseId = Number(match ? match[1] : query.courseId)
  // ...
}
```

对于 PUT + 查询参数的场景（如 `/scores/:id/audit?approved=true`），用 `new URL()` 解析：

```typescript
response: ({ url, query }: any) => {
  const id = Number(query.id)                       // 路径参数
  const searchParams = new URL(url, 'http://localhost').searchParams
  const approved = searchParams.get('approved')     // 查询参数
  // ...
}
```

### 两个使用内联 Mock 的页面

| 页面 | 位置 | 说明 |
|------|------|------|
| `UserManage.vue` | `views/admin/` | 使用本地 `mockUsers` 数组 + `setTimeout` 模拟，不经过 `src/api/` 层 |
| `GraduationAudit.vue` | `views/admin/` | 同上，使用本地 `mockData` 数组 |

修改这两个页面的数据逻辑时，应直接在组件内修改，无需走 API 通道（后端对应 Controller 尚未提供）。

### 三个占位页面

| 页面 | 位置 | 状态 |
|------|------|------|
| `ScheduleView.vue` | `views/teacher/` | 仅 el-empty 占位，无 API 调用 |
| `MySchedule.vue` | `views/student/` | 同上 |
| `TrainingPlan.vue` | `views/student/` | 同上 |

---

## 五、认证与安全架构

### 认证流程

```
用户输入账号密码
  → LoginView.vue: userStore.login(loginForm)
    → src/stores/user.ts: login()
      → loginApi(loginForm)
        → src/api/auth.ts: post('/auth/login', data)
          → POST /api/v1/auth/login
            → mock 或后端验证 → 返回 { code, token, role, username }
      → localStorage 持久化 token/username/role
  → router.push('/dashboard')

后续所有请求：
  → axios 请求拦截器自动注入 Authorization: Bearer <token>
```

### Token 管理

- **存储位置：** `localStorage`（`token`、`username`、`role`）
- **有效期：** mock 返回固定的 7200 秒，真实后端由 JWT 控制
- **过期处理：** 后端返回 401/403 → 响应拦截器自动清除 token 并跳转登录页
- **手动登出：** `userStore.logout()` 清除 localStorage 数据，跳转 `/login`

### 角色权限

| 角色 | 可访问页面 |
|------|-----------|
| admin | 全部页面（含 admin + teacher + student 区域） |
| teacher | 首页 + 教师页面（我的课程、学生名册、成绩录入、教学课表） |
| student | 首页 + 学生页面（选课中心、成绩查询、课表、培养方案） |

---

## 六、Layout 布局架构

### MainLayout.vue 结构

```
┌──────────────────────────────────────────────┐
│  el-container（height: 100vh）                │
│  ┌─────────────┬────────────────────────────┐│
│  │  侧边栏      │  右侧容器                   ││
│  │  (64/220px) │  ┌────────────────────────┐││
│  │  #304156    │  │ 顶栏（60px）             │││
│  │             │  │ · 左侧：折叠按钮 + 面包屑  │││
│  │  LOGO 区域  │  │ · 右侧：角色标签 + 用户名  │││
│  │             │  │        + 下拉菜单         │││
│  │  el-menu    │  ├────────────────────────┤││
│  │  · 首页     │  │ 主内容区（#f0f2f5）       │││
│  │  · 管理员： │  │ <router-view />          │││
│  │    系统管理 │  │                          │││
│  │    教学管理 │  │                          │││
│  │    成绩管理 │  │                          │││
│  │  · 教师：   │  │                          │││
│  │    教学工作 │  │                          │││
│  │  · 学生：   │  │                          │││
│  │    我的学业 │  │                          │││
│  │             │  │                          │││
│  └─────────────┘  └────────────────────────┘││
│                                              ││
│  el-dialog（修改密码弹窗）                      ││
└──────────────────────────────────────────────┘
```

### 侧边栏菜单权限控制

```html
<el-menu>
  <el-menu-item index="/dashboard">首页</el-menu-item>

  <el-sub-menu index="admin" v-if="userStore.isAdmin">
    <el-menu-item index="/admin/users">用户管理</el-menu-item>
    <!-- ... -->
  </el-sub-menu>

  <el-sub-menu index="teacher" v-if="userStore.isTeacher || userStore.isAdmin">
    <el-menu-item index="/teacher/my-courses">我的课程</el-menu-item>
    <!-- ... -->
  </el-sub-menu>

  <el-sub-menu index="student" v-if="userStore.isStudent || userStore.isAdmin">
    <el-menu-item index="/student/course-selection">选课中心</el-menu-item>
    <!-- ... -->
  </el-sub-menu>
</el-menu>
```

### 顶栏功能

| 功能 | 实现 |
|------|------|
| 折叠按钮 | 切换 `isCollapse`，侧边栏 220px ↔ 64px |
| 面包屑 | "首页" + 当前页面 `route.meta.title` |
| 角色标签 | admin→红色 `el-tag`"管理员"，teacher→橙色"教师"，student→默认"学生" |
| 下拉菜单 | 修改密码（`el-dialog` 表单） + 退出登录（`ElMessageBox.confirm`） |

---

## 七、API 接口层架构

### 接口文件与覆盖度

| 文件 | 接口数 | 对应 Controller（后端） |
|------|:---:|------|
| `auth.ts` | 3 | AuthController |
| `user.ts` | 7 | —（后端暂无 UserController，mock 驱动） |
| `department.ts` | 6 | DepartmentController |
| `class.ts` | 6 | ClassController |
| `teacher.ts` | 6 | TeacherController |
| `student.ts` | 7 | StudentController |
| `course.ts` | 6 | CourseController |
| `score.ts` | 8 | ScoreController |
| `enrollment.ts` | 4 | CourseSelectionController |
| **合计** | **53** | |

### 类型化请求封装

```typescript
// src/utils/request.ts 导出的泛型方法
export function get<T>(url, config?): Promise<T>
export function post<T>(url, data?, config?): Promise<T>
export function put<T>(url, data?, config?): Promise<T>
export function del<T>(url, config?): Promise<T>
```

所有请求 `baseURL` 统一为 `/api/v1`，如 `get('/courses', { params })` 实际请求 `/api/v1/courses`。

---

## 八、关键类型定义

### 枚举/类型别名（`enums.ts`）

| 类型 | 值 | 说明 |
|------|-----|------|
| `UserRole` | `'admin' \| 'teacher' \| 'student'` | 用户角色 |
| `Gender` | `1 \| 2` | 1=男, 2=女 |
| `CommonStatus` | `0 \| 1 \| 2` | 0=禁用, 1=启用, 2=毕业 |
| `CourseType` | `1 \| 2 \| 3` | 1=必修, 2=选修, 3=公选 |
| `ScoreType` | `1 \| 2 \| 3` | 1=期末, 2=补考, 3=重修 |
| `GradeLevel` | `'A' \| 'B' \| 'C' \| 'D' \| 'F'` | 成绩等级 |
| `SelectionStatus` | `0 \| 1` | 0=退选, 1=已选 |
| `AuditStatus` | `'pending' \| 'approved' \| 'rejected'` | 审核状态 |

### 通用结构（`common.ts`）

| Interface | 字段 |
|-----------|------|
| `ApiResult<T>` | `code, message, data` |
| `PageResult<T>` | `list, total, pageNum, pageSize, totalPages` |
| `LoginResult` | `token, role, username, expiresIn` |

### 核心业务模型（`models.ts`）

| 模型 | 关联字段 |
|------|---------|
| `Department` | `parentId`（自关联树形） |
| `Teacher` | `employeeNo`, `departmentId`, `title` |
| `Clazz` | `departmentId`, `advisorId` |
| `Student` | `studentNo`, `classId`, `gender` |
| `Course` | `code`, `teacherId`, `departmentId`, `courseType` |
| `Score` | `studentId`, `courseId`, `scoreValue`, `gradeLevel` |
| `StudentScoreResponse` | 成绩展示 DTO（含 studentName, courseName 关联字段） |
| `ScoreStatistics` | `totalStudents, averageScore, maxScore, minScore, passRate, gradeDistribution` |
| `CourseSelection` | `studentId`, `courseId`, `semester`, `status` |
| `SysUser` | `username`, `role`, `refId` |

---

## 九、完整 API 接口一览

### 认证（auth.ts）

| 方法 | URL | 说明 |
|------|-----|------|
| POST | `/auth/login` | 登录 |
| POST | `/auth/logout` | 登出 |
| PUT | `/auth/password?oldPassword=&newPassword=` | 修改密码 |

### 用户管理（user.ts）

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/users` | 分页查询（可筛选 username/role/status） |
| GET | `/users/:id` | 单个查询 |
| POST | `/users` | 创建用户 |
| PUT | `/users/:id` | 更新用户 |
| DELETE | `/users/:id` | 删除用户 |
| PUT | `/users/:id/reset-password` | 重置密码 |
| PUT | `/users/:id/status` | 切换启用状态 |

### 院系管理（department.ts）

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/departments` | 获取树形列表 |
| GET | `/departments/:id` | 单个查询 |
| POST | `/departments` | 创建 |
| PUT | `/departments/:id` | 更新 |
| DELETE | `/departments/:id` | 删除 |

### 班级管理（class.ts）

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/classes` | 分页查询（可筛选 departmentId/grade） |
| GET | `/classes/:id` | 单个查询 |
| POST | `/classes` | 创建 |
| PUT | `/classes/:id` | 更新 |
| DELETE | `/classes/:id` | 删除 |

### 教师管理（teacher.ts）

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/teachers` | 分页查询（可筛选 name/employeeNo/departmentId） |
| GET | `/teachers/:id` | 单个查询 |
| POST | `/teachers` | 创建 |
| PUT | `/teachers/:id` | 更新 |
| DELETE | `/teachers/:id` | 删除 |

### 学生管理（student.ts）

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/students` | 分页查询（可筛选 name/studentNo/classId） |
| GET | `/students/:id` | 单个查询 |
| POST | `/students` | 创建 |
| PUT | `/students/:id` | 更新 |
| DELETE | `/students/:id` | 删除 |
| POST | `/students/import` | 批量导入 |

### 课程管理（course.ts）

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/courses` | 分页查询（可筛选 name/departmentId/courseType/semester） |
| GET | `/courses/:id` | 单个查询 |
| POST | `/courses` | 创建 |
| PUT | `/courses/:id` | 更新 |
| DELETE | `/courses/:id` | 删除 |

### 成绩管理（score.ts）

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/scores` | 分页查询（可筛选 studentId/courseId/classId/semester） |
| GET | `/scores/statistics` | 成绩统计（含 gradeDistribution 分布） |
| GET | `/scores/:id` | 单个查询 |
| POST | `/scores` | 创建 |
| POST | `/scores/batch` | 批量录入 |
| PUT | `/scores/:id` | 更新 |
| PUT | `/scores/:id/audit?approved=` | 审核（通过/驳回） |
| GET | `/scores/export` | 导出 Excel（Blob 响应） |

### 选课管理（enrollment.ts）

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/course-selections` | 分页查询 |
| GET | `/courses/:courseId/selections` | 获取课程的学生列表 |
| POST | `/course-selections` | 选课 |
| PUT | `/course-selections/:id/drop` | 退课 |

---

## 十、测试账号

| 角色 | 用户名 | mock 密码 | 数据库密码 |
|------|--------|-----------|-----------|
| 管理员 | `admin` | `admin123` | `123456` |
| 教师 | `T2024001` | `T2024001` | `123456` |
| 学生 | `S20240001` | `S20240001` | `123456` |