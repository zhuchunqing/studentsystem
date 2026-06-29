# AGENTS.md — SEMS 学生教育管理系统

## 项目结构

```
demo3/
├── front/                 # Vue 3 + Vite + Element Plus（前端）
├── student-edu-system/    # Spring Boot 3.2 + JPA + JWT（后端）
├── Design.md              # 完整设计文档
└── readme.md              # 系统概述
```

两个子项目**独立开发**，前端 `npm run dev` 可脱离后端运行（使用 mock）。

## 常用命令

```bash
# 前端（在 front/ 下）
npm run dev          # 开发服务器 :5173，自动启用 mock
npm run build        # 构建（含 vue-tsc 类型检查）
npm run type-check   # 仅类型检查

# 后端（在 student-edu-system/ 下）
mvn spring-boot:run                # 启动后端 :8094
mvn clean package -DskipTests      # 打包
```

## 前端 Mock 关键规则

前端通过 `vite-plugin-mock` + `mock/` 目录拦截所有 `/api/v1/*` 请求。mock 仅在 `npm run dev` 时生效，构建时不包含。

### 路由顺序：精确路由必须放在 `/:id` 之前

`vite-plugin-mock` 用 `Array.find()` 匹配第一个命中的路由。`path-to-regexp` 将 `:id` 解析为 `([^/]+)`，会匹配任意非斜杠字符串（包括 `statistics`、`export` 等固定路径名）。

**因此 mock 数组中有 `/:id` 的模块，必须把精确路径（如 `/scores/statistics`）放在 `/:id` 之前。**

### 查询参数与路径参数的合并规则

`vite-plugin-mock` 的 `response` 函数接收的 `query` 对象，根据请求方法和参数处理逻辑不同：

| 场景 | `query` 内容 |
|------|-------------|
| GET 无查询参数 | 路径参数（如 `{ id: '1' }`） |
| GET 有查询参数 | **仅** URL 查询参数，路径参数**丢失** |
| PUT / DELETE | **仅** 路径参数，URL 查询参数**丢失** |

对于 GET + 路径参数 + 查询参数（如 `/courses/:courseId/selections?pageSize=999`），需要从 `url` 中用正则提取路径参数：

```typescript
response: ({ url, query }: any) => {
  const match = url.match(/\/courses\/(\d+)\/selections/)
  const courseId = Number(match ? match[1] : query.courseId)
  // ...
}
```

对于 PUT 请求需要 URL 查询参数（如 `/scores/:id/audit?approved=true`），用 `new URL()` 解析：

```typescript
response: ({ url, query }: any) => {
  const id = Number(query.id)                        // 路径参数
  const searchParams = new URL(url, 'http://localhost').searchParams
  const approved = searchParams.get('approved')      // 查询参数
  // ...
}
```

## 前端架构要点

- **响应拦截器**（`src/utils/request.ts`）：后端返回 `{ code, message, data }`，拦截器在 `code === 200` 时自动剥离外层，API 函数返回的就是 `data` 本身。页面**不应再访问 `.data`**。
- **认证**：JWT token 存 localStorage，axios 请求拦截器自动注入 `Authorization: Bearer <token>`。401/403 自动跳登录页。
- **baseURL**：`/api/v1`，开发时 Vite proxy 到 `http://localhost:8094`。
- **两个页面使用内联 mock**：`UserManage.vue` 和 `GraduationAudit.vue` 直接在组件内 `setTimeout` 模拟数据，**不经过 `src/api/` 层**。修改这些页面的数据逻辑时勿走 API 通道。
- **占位页面**：`teacher/ScheduleView.vue`、`student/MySchedule.vue`、`student/TrainingPlan.vue` 仅有 el-empty 占位，无 API 调用。

## 后端架构要点

- **端口**：8094，context-path `/`
- **API 前缀**：`/api/v1`
- **数据库**：MySQL `testinfozcqdb`，地址 `192.168.52.66:3306`，JPA `ddl-auto: update` 自动建表
- **安全**：Spring Security + JWT（jjwt），密钥在 `jwt.secret`，有效期 2 小时
- **API 文档**：`/swagger-ui.html`（Knife4j / OpenAPI 3）
- **响应格式**：`Result<T> { code: number, message: string, data: T }`，成功时 `code === 200`

## 测试账号（mock / 数据库）

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123（mock）/ 123456（数据库） |
| 教师 | T2024001 | T2024001（mock）/ teacher1 / 123456（数据库） |
| 学生 | S20240001 | S20240001（mock）/ student1 / 123456（数据库） |
