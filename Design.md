# 学生教育管理系统 — 设计文档（Design.md）

> **版本**: 1.0.0  
> **日期**: 2026-06-25  
> **项目路径**: `d:\Workspace\Comate\demo3`

---

## 目录

1. [系统概述](#1-系统概述)
2. [业务文档](#2-业务文档)
3. [后端架构文档](#3-后端架构文档)
4. [后端数据模型](#4-后端数据模型)
5. [后端 API 接口文档](#5-后端-api-接口文档)
6. [前端架构文档](#6-前端架构文档)
7. [前端页面设计](#7-前端页面设计)
8. [前后端交互设计](#8-前后端交互设计)
9. [数据库设计](#9-数据库设计)
10. [部署与运维](#10-部署与运维)

---

## 1. 系统概述

### 1.1 系统名称

学生教育管理系统（Student Education Management System，简称 SEMS）

### 1.2 系统定位

面向高校教务管理场景的综合管理平台，涵盖教师管理、学生管理、课程管理、选课管理、成绩管理等核心业务，实现教务流程数字化、信息管理规范化、数据分析可视化。

### 1.3 目标用户

| 角色 | 说明 |
|------|------|
| 系统管理员（admin） | 负责系统配置、用户权限分配、数据维护、成绩审核、毕业审核 |
| 教师（teacher） | 负责课程教学、成绩录入、查看学生信息、教学课表 |
| 学生（student） | 选课、查看成绩、查看课表、培养方案进度跟踪 |

### 1.4 技术栈总览

| 层次 | 技术选型 | 版本 |
|------|----------|------|
| 前端框架 | Vue 3（Composition API） | ^3.4.0 |
| 前端 UI | Element Plus | ^2.7.0 |
| 前端构建 | Vite | ^5.4.0 |
| 前端状态管理 | Pinia | ^2.1.0 |
| 前端路由 | Vue Router | ^4.3.0 |
| 前端图表 | ECharts + vue-echarts | ^5.5.0 / ^6.6.0 |
| 后端框架 | Spring Boot | 3.2.5 |
| 后端语言 | Java | 17 |
| 后端安全 | Spring Security + JWT | — |
| 后端 ORM | Spring Data JPA + Hibernate | — |
| 数据库 | MySQL | 8.0+ |
| API 文档 | Knife4j (OpenAPI 3) | 4.4.0 |

### 1.5 系统架构图

```mermaid
flowchart TB
    subgraph client [客户端]
        Browser[Web 浏览器]
    end

    subgraph frontend [前端 - Vue 3 SPA]
        VueApp[Vue 应用]
        ViteProxy[Vite Dev Proxy :5173]
    end

    subgraph backend [后端 - Spring Boot]
        SpringApp[Spring Boot App :8094]
        SecurityFilter[Security Filter Chain]
        Controllers[REST Controllers]
        Services[Business Services]
        Repositories[JPA Repositories]
    end

    subgraph db [数据层]
        MySQL[(MySQL 数据库)]
    end

    Browser --> ViteProxy
    ViteProxy -->|"/api → http://localhost:8094"| SpringApp
    Browser -->|生产环境直连| SpringApp
    SpringApp --> SecurityFilter
    SecurityFilter --> Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> MySQL
```

---

## 2. 业务文档

### 2.1 角色职责矩阵

| 功能模块 | 管理员 | 教师 | 学生 |
|----------|--------|------|------|
| 用户管理 | 增删改查、启用/禁用、重置密码 | — | — |
| 院系管理 | 树形增删改查 | 查看 | — |
| 班级管理 | 增删改查、查看学生 | — | — |
| 教师管理 | 增删改查 | — | — |
| 学生管理 | 增删改查、批量导入 | — | — |
| 课程管理 | 增删改查、审核 | — | 查看 |
| 选课管理 | — | — | 选课/退选 |
| 成绩录入 | — | 录入/批量录入 | — |
| 成绩审核 | 审核/驳回 | — | — |
| 成绩查询 | 全部 | 所授课程 | 个人成绩 |
| 成绩统计 | 统计分析报表 | — | — |
| 毕业审核 | 发起审核、查看结果 | — | — |
| 教学课表 | — | 查看授课课表 | — |
| 培养方案 | — | — | 查看进度、学业预警 |

### 2.2 业务模块说明

#### 2.2.1 用户与权限管理

- 基于 RBAC 的角色权限控制，系统区分 admin / teacher / student 三种角色
- 用户表（sys_user）存储账号信息，通过 `ref_id` 关联到教师或学生业务表
- 密码使用 BCrypt 加密存储
- JWT Token 认证，有效期 2 小时
- 支持账号启用/禁用、密码重置

#### 2.2.2 院系与班级管理

- 院系支持多级树形结构（通过 `parent_id` 实现父子关系）
- 班级隶属于院系，可指定班主任（关联教师）
- 班级记录学生人数统计

#### 2.2.3 课程管理

- 课程按类型分为：必修（1）、选修（2）、公选（3）
- 课程关联授课教师和开课院系
- 设置学分、学时、最大选课人数
- 按学期开设，学期格式如 `2024-2025-1`

#### 2.2.4 选课管理

- 学生按学期选课，同一学期不可重复选同一课程（唯一约束）
- 选课校验：课程状态、人数上限、重复选课
- 支持退选操作，退选后状态置为 0，记录退选时间
- 必修课系统自动预选，不可退选

#### 2.2.5 成绩管理

- 成绩类型：期末（1）、补考（2）、重修（3）
- 成绩分数 0-100，系统自动计算等级（A/B/C/D/F）和是否及格
- 教师录入成绩后提交审核，管理员审核通过后成绩生效
- 支持批量录入成绩
- 成绩统计分析：平均分、最高分、最低分、及格率、等级分布

#### 2.2.6 毕业审核

- 审核条件：总学分达标、必修课全部通过、公选课学分达标、实践学分达标
- 管理员发起审核，系统自动检查每位学生
- 生成审核结果（通过/不通过）和缺修课程清单

### 2.3 核心业务流程

#### 2.3.1 选课流程

```mermaid
flowchart TD
    A[学生登录系统] --> B[进入选课中心]
    B --> C[浏览可选课程列表]
    C --> D[选择课程]
    D --> E{是否必修课?}
    E -->|是| F[系统自动预选]
    E -->|否| G{是否已选?}
    G -->|是| H[提示已选该课程]
    G -->|否| I{课程是否已满?}
    I -->|是| J[提示人数已满]
    I -->|否| K{学分是否超限?}
    K -->|是| L[提示超出学分上限]
    K -->|否| M[确认选课]
    M --> N[写入选课记录]
    N --> O[选课成功]
```

#### 2.3.2 成绩录入与审核流程

```mermaid
flowchart TD
    A[教师登录] --> B[选择课程和学期]
    B --> C[获取学生名单]
    C --> D[录入平时/期中/期末成绩]
    D --> E[系统自动计算总评和绩点]
    E --> F[提交成绩]
    F --> G{管理员审核}
    G -->|通过| H[成绩生效发布]
    G -->|驳回| I[退回教师修改]
    I --> D
    H --> J[学生可查看成绩]
```

#### 2.3.3 毕业审核流程

```mermaid
flowchart TD
    A[管理员发起审核] --> B[系统逐项检查]
    B --> C{总学分是否达标?}
    C -->|否| D[标记不通过]
    C -->|是| E{必修课是否全部通过?}
    E -->|否| D
    E -->|是| F{公选课学分是否达标?}
    F -->|否| D
    F -->|是| G{实践学分是否达标?}
    G -->|否| D
    G -->|是| H[标记通过]
    D --> I[生成缺修清单]
    H --> J[审核完成]
    I --> J
```

### 2.4 业务规则

#### 2.4.1 选课规则

| 规则 | 说明 |
|------|------|
| 学分上限 | 每学期选课学分上限 25 学分 |
| 学分下限 | 每学期选课学分下限 12 学分 |
| 必修课 | 系统自动预选，学生不可退选 |
| 选修课 | 先到先得，达到最大人数后不可再选 |
| 退选窗口 | 开课后 2 周内可退选 |
| 重复选课 | 同一学期不可重复选同一课程（数据库唯一约束） |

#### 2.4.2 成绩等级换算

| 分数段 | 等级 | 绩点（4.0制） | 是否及格 |
|--------|------|--------------|----------|
| 90-100 | A | 4.0 | 是 |
| 80-89 | B | 3.0 | 是 |
| 70-79 | C | 2.0 | 是 |
| 60-69 | D | 1.0 | 是 |
| 0-59 | F | 0 | 否 |

> 代码位置：`student-edu-system/src/main/java/com/edu/util/GradeUtil.java`

#### 2.4.3 绩点计算公式

```
GPA = Σ(课程绩点 × 课程学分) / Σ课程学分
```

---

## 3. 后端架构文档

### 3.1 项目目录结构

```
student-edu-system/
├── pom.xml                          # Maven 配置与依赖
└── src/
    ├── main/
    │   ├── java/com/edu/
    │   │   ├── StudentEduApplication.java      # 应用入口 (@SpringBootApplication)
    │   │   ├── config/                         # 配置类
    │   │   │   ├── SecurityConfig.java         # Spring Security 安全配置
    │   │   │   ├── CorsConfig.java             # 跨域配置
    │   │   │   └── SwaggerConfig.java          # Swagger/OpenAPI 文档配置
    │   │   ├── common/                         # 公共组件
    │   │   │   ├── Result.java                 # 统一响应封装
    │   │   │   ├── PageResult.java             # 分页响应封装
    │   │   │   ├── PageRequest.java            # 分页请求参数
    │   │   │   ├── BusinessException.java      # 业务异常
    │   │   │   └── GlobalExceptionHandler.java # 全局异常处理器
    │   │   ├── controller/                     # 控制器层（8个）
    │   │   │   ├── AuthController.java         # 认证管理
    │   │   │   ├── StudentController.java      # 学生管理
    │   │   │   ├── TeacherController.java      # 教师管理
    │   │   │   ├── CourseController.java       # 课程管理
    │   │   │   ├── ScoreController.java        # 成绩管理
    │   │   │   ├── ClassController.java        # 班级管理
    │   │   │   ├── DepartmentController.java   # 院系管理
    │   │   │   └── CourseSelectionController.java # 选课管理
    │   │   ├── entity/                         # JPA 实体（8个）
    │   │   ├── dto/                            # 数据传输对象
    │   │   │   ├── request/                    # 请求 DTO（9个）
    │   │   │   └── response/                   # 响应 DTO（4个）
    │   │   ├── service/                        # 业务服务层（8个）
    │   │   ├── repository/                     # 数据访问层（8个）
    │   │   └── util/                           # 工具类
    │   │       ├── JwtUtil.java                # JWT 工具
    │   │       └── GradeUtil.java              # 成绩等级工具
    │   └── resources/
    │       ├── application.yml                 # 主配置
    │       ├── application-local.yml           # 本地环境
    │       └── application-dev.yml             # 开发环境
    └── test/
        └── java/com/edu/
            └── StudentEduApplicationTests.java # 冒烟测试
```

### 3.2 分层架构

```mermaid
flowchart TB
    subgraph presentation [表现层]
        Controllers[Controllers<br/>REST API 端点]
    end
    subgraph business [业务层]
        Services[Services<br/>业务逻辑编排]
    end
    subgraph data [数据访问层]
        Repositories[Repositories<br/>JPA 数据访问]
    end
    subgraph persistence [持久化层]
        Entities[Entities<br/>JPA 实体模型]
        MySQL[(MySQL)]
    end
    subgraph infra [基础设施层]
        Config[Config<br/>安全/跨域/Swagger]
        Common[Common<br/>异常处理/统一响应]
        Util[Util<br/>JWT/成绩工具]
    end

    Controllers --> Services
    Services --> Repositories
    Repositories --> Entities
    Entities --> MySQL
    Config -.-> Controllers
    Config -.-> Services
    Common -.-> Controllers
    Util -.-> Services
```

### 3.3 技术依赖清单

| 依赖 | GroupId | ArtifactId | 版本 | 用途 |
|------|---------|-----------|------|------|
| Spring Boot Web | org.springframework.boot | spring-boot-starter-web | 3.2.5 | REST API |
| Spring Data JPA | org.springframework.boot | spring-boot-starter-data-jpa | 3.2.5 | ORM 数据访问 |
| Spring Security | org.springframework.boot | spring-boot-starter-security | 3.2.5 | 认证与授权 |
| Validation | org.springframework.boot | spring-boot-starter-validation | 3.2.5 | 参数校验 |
| MySQL Connector | com.mysql | mysql-connector-j | managed | MySQL 驱动 |
| H2 Database | com.h2database | h2 | managed | 测试用内存数据库 |
| JWT API | io.jsonwebtoken | jjwt-api | 0.12.5 | JWT API |
| JWT Impl | io.jsonwebtoken | jjwt-impl | 0.12.5 | JWT 实现 |
| JWT Jackson | io.jsonwebtoken | jjwt-jackson | 0.12.5 | JWT Jackson 序列化 |
| Knife4j | com.github.xiaoymin | knife4j-openapi3-jakarta-spring-boot-starter | 4.4.0 | API 文档 |
| Lombok | org.projectlombok | lombok | managed | 简化代码 |
| MapStruct | org.mapstruct | mapstruct | 1.5.5.Final | 对象映射（预留） |
| Apache POI | org.apache.poi | poi-ooxml | 5.2.5 | Excel 导入导出（预留） |

### 3.4 配置说明

> 文件位置：`student-edu-system/src/main/resources/application.yml`

```yaml
server:
  port: 8094                    # 服务端口
  servlet:
    context-path: /             # 上下文路径（根路径）

spring:
  datasource:
    url: jdbc:mysql://192.168.52.66:3306/testinfozcqdb  # 数据库连接
    username: trs
    password: Gongxifacai@2023
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10     # 连接池最大连接数
      connection-timeout: 30000 # 连接超时 30s
  jpa:
    hibernate:
      ddl-auto: update           # 自动建表/更新表结构
    show-sql: true               # 打印 SQL
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss  # 日期格式
    time-zone: Asia/Shanghai          # 时区
    default-property-inclusion: non_null  # 非 null 序列化

jwt:
  secret: YourSuperSecretKeyForJwtTokenGenerationMustBe256BitsLong!!  # JWT 密钥
  expiration: 7200000           # JWT 有效期 2 小时（毫秒）

springdoc:
  swagger-ui:
    path: /swagger-ui.html      # Swagger UI 路径
  api-docs:
    path: /v3/api-docs          # API 文档路径
```

### 3.5 安全架构

> 文件位置：`student-edu-system/src/main/java/com/edu/config/SecurityConfig.java`

#### 安全配置要点

| 配置项 | 值 | 说明 |
|--------|-----|------|
| CSRF | 禁用 | 无状态 API 不需要 CSRF 保护 |
| Session | STATELESS | 不创建 HTTP Session，完全依赖 JWT |
| 公开路径 | `/api/v1/auth/login`, Swagger 路径 | 无需认证即可访问 |
| 认证方式 | JWT Bearer Token | 请求头 `Authorization: Bearer <token>` |
| 密码加密 | BCryptPasswordEncoder | 单向哈希加密 |

#### JWT 认证流程

```mermaid
flowchart LR
    A[客户端请求] --> B[SecurityFilterChain]
    B --> C{路径是否公开?}
    C -->|是| D[直接放行]
    C -->|否| E[JwtAuthFilter]
    E --> F{Authorization 头?}
    F -->|无| G[未认证 401]
    F -->|有| H[解析 JWT Token]
    H --> I{Token 有效?}
    I -->|否| J[清除 SecurityContext]
    I -->|是| K[设置认证信息]
    K --> L[放行到 Controller]
    J --> L
    D --> L
```

#### JWT Token 结构

```
Header: { "alg": "HS384" }
Payload: {
  "sub": "admin",          # 用户名
  "userId": 1,             # 用户 ID
  "role": "admin",         # 角色
  "iat": 1782366496,       # 签发时间
  "exp": 1782373696        # 过期时间（2小时后）
}
```

> 文件位置：`student-edu-system/src/main/java/com/edu/util/JwtUtil.java`

### 3.6 异常处理

> 文件位置：`student-edu-system/src/main/java/com/edu/common/GlobalExceptionHandler.java`

| 异常类型 | HTTP 状态码 | 业务 code | 说明 |
|----------|------------|-----------|------|
| BusinessException | 400 | 自定义 | 业务逻辑异常（如"用户名或密码错误"） |
| BadCredentialsException | 401 | 401 | 认证失败 |
| AccessDeniedException | 403 | 403 | 无权限访问 |
| MethodArgumentNotValidException | 400 | 400 | 参数校验失败 |
| Exception | 500 | 500 | 其他未捕获异常 |

### 3.7 统一响应格式

> 文件位置：`student-edu-system/src/main/java/com/edu/common/Result.java`

```java
public class Result<T> {
    private int code;       // 状态码：200=成功，400/401/403/500=错误
    private String message; // 提示消息
    private T data;         // 数据载荷（成功时返回，失败时为 null）
}
```

**成功响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

**错误响应示例：**
```json
{
  "code": 401,
  "message": "用户名或密码错误"
}
```

### 3.8 跨域配置

> 文件位置：`student-edu-system/src/main/java/com/edu/config/CorsConfig.java`

| 配置项 | 值 |
|--------|-----|
| Allowed Origins | `*`（所有来源） |
| Allowed Methods | GET, POST, PUT, DELETE, OPTIONS |
| Allowed Headers | `*` |
| Allow Credentials | true |
| Max Age | 3600s |

---

## 4. 后端数据模型

### 4.1 ER 关系图

```mermaid
erDiagram
    Department ||--o{ Teacher : "1:N 院系聘用教师"
    Department ||--o{ Clazz : "1:N 院系管理班级"
    Department ||--o{ Course : "1:N 院系开设课程"
    Department ||--o{ Department : "自关联 父子院系"
    Teacher ||--o{ Clazz : "1:N 教师担任班主任"
    Teacher ||--o{ Course : "1:N 教师授课"
    Clazz ||--o{ Student : "1:N 班级包含学生"
    Student ||--o{ Score : "1:N 学生成绩"
    Student ||--o{ CourseSelection : "1:N 学生选课"
    Course ||--o{ Score : "1:N 课程成绩"
    Course ||--o{ CourseSelection : "1:N 课程被选"
    SysUser ||--o| Teacher : "1:1 用户关联教师"
    SysUser ||--o| Student : "1:1 用户关联学生"

    Department {
        bigint id PK
        varchar name
        bigint parent_id FK
        varchar dean
        text description
        datetime created_at
        datetime updated_at
    }

    Teacher {
        bigint id PK
        varchar name
        varchar employee_no UK
        bigint department_id FK
        varchar title
        varchar phone
        varchar email
        int status
        datetime created_at
        datetime updated_at
    }

    Clazz {
        bigint id PK
        varchar name
        bigint department_id FK
        bigint advisor_id FK
        varchar grade
        varchar major
        int student_count
        datetime created_at
        datetime updated_at
    }

    Student {
        bigint id PK
        varchar name
        varchar student_no UK
        bigint class_id FK
        int gender
        date enrollment_date
        varchar phone
        varchar email
        int status
        datetime created_at
        datetime updated_at
    }

    Course {
        bigint id PK
        varchar name
        varchar code UK
        bigint teacher_id FK
        bigint department_id FK
        int credit
        int hours
        int course_type
        varchar semester
        int max_students
        text description
        int status
        datetime created_at
        datetime updated_at
    }

    Score {
        bigint id PK
        bigint student_id FK
        bigint course_id FK
        decimal score_value
        varchar grade_level
        varchar semester
        int score_type
        int is_passed
        varchar remark
        datetime created_at
        datetime updated_at
    }

    CourseSelection {
        bigint id PK
        bigint student_id FK
        bigint course_id FK
        varchar semester
        int status
        datetime selected_at
        datetime dropped_at
    }

    SysUser {
        bigint id PK
        varchar username UK
        varchar password_hash
        varchar role
        bigint ref_id
        int status
        datetime last_login_at
        datetime created_at
    }
```

### 4.2 实体详细定义

#### 4.2.1 Department（院系）

> 文件：`entity/Department.java`　表名：`department`

| 字段 | Java 类型 | 列名 | 约束 | 说明 |
|------|-----------|------|------|------|
| id | Long | id | PK, AUTO_INCREMENT | 主键 |
| name | String | name | NOT NULL, VARCHAR(100) | 院系名称 |
| parentId | Long | parent_id | FK → department.id | 上级院系，顶级为 NULL |
| dean | String | dean | VARCHAR(50) | 院系负责人 |
| description | String | description | TEXT | 院系描述 |
| children | List\<Department\> | — | @Transient | 子院系列表（不持久化） |
| createdAt | LocalDateTime | created_at | NOT NULL, 不可更新 | 创建时间 |
| updatedAt | LocalDateTime | updated_at | NOT NULL | 更新时间 |

#### 4.2.2 Teacher（教师）

> 文件：`entity/Teacher.java`　表名：`teacher`

| 字段 | Java 类型 | 列名 | 约束 | 说明 |
|------|-----------|------|------|------|
| id | Long | id | PK, AUTO_INCREMENT | 主键 |
| name | String | name | NOT NULL, VARCHAR(50) | 姓名 |
| employeeNo | String | employee_no | NOT NULL, UNIQUE, VARCHAR(30) | 工号 |
| departmentId | Long | department_id | FK → department.id | 所属院系 |
| title | String | title | VARCHAR(30) | 职称 |
| phone | String | phone | VARCHAR(20) | 联系电话 |
| email | String | email | VARCHAR(100) | 邮箱 |
| status | Integer | status | NOT NULL, DEFAULT 1 | 状态（1在职/0离职） |
| createdAt | LocalDateTime | created_at | NOT NULL, 不可更新 | 创建时间 |
| updatedAt | LocalDateTime | updated_at | NOT NULL | 更新时间 |

#### 4.2.3 Clazz（班级）

> 文件：`entity/Clazz.java`　表名：`class`

| 字段 | Java 类型 | 列名 | 约束 | 说明 |
|------|-----------|------|------|------|
| id | Long | id | PK, AUTO_INCREMENT | 主键 |
| name | String | name | NOT NULL, VARCHAR(50) | 班级名称 |
| departmentId | Long | department_id | FK → department.id | 所属院系 |
| advisorId | Long | advisor_id | FK → teacher.id | 班主任 |
| grade | String | grade | NOT NULL, VARCHAR(10) | 年级 |
| major | String | major | VARCHAR(100) | 专业方向 |
| studentCount | Integer | student_count | DEFAULT 0 | 学生人数 |
| createdAt | LocalDateTime | created_at | NOT NULL, 不可更新 | 创建时间 |
| updatedAt | LocalDateTime | updated_at | NOT NULL | 更新时间 |

#### 4.2.4 Student（学生）

> 文件：`entity/Student.java`　表名：`student`

| 字段 | Java 类型 | 列名 | 约束 | 说明 |
|------|-----------|------|------|------|
| id | Long | id | PK, AUTO_INCREMENT | 主键 |
| name | String | name | NOT NULL, VARCHAR(50) | 姓名 |
| studentNo | String | student_no | NOT NULL, UNIQUE, VARCHAR(30) | 学号 |
| classId | Long | class_id | FK → class.id | 所属班级 |
| gender | Integer | gender | — | 性别（1男/2女） |
| enrollmentDate | LocalDate | enrollment_date | NOT NULL | 入学日期 |
| phone | String | phone | VARCHAR(20) | 联系电话 |
| email | String | email | VARCHAR(100) | 邮箱 |
| status | Integer | status | NOT NULL, DEFAULT 1 | 状态（1在读/0休学/2毕业） |
| createdAt | LocalDateTime | created_at | NOT NULL, 不可更新 | 创建时间 |
| updatedAt | LocalDateTime | updated_at | NOT NULL | 更新时间 |

#### 4.2.5 Course（课程）

> 文件：`entity/Course.java`　表名：`course`

| 字段 | Java 类型 | 列名 | 约束 | 说明 |
|------|-----------|------|------|------|
| id | Long | id | PK, AUTO_INCREMENT | 主键 |
| name | String | name | NOT NULL, VARCHAR(100) | 课程名称 |
| code | String | code | NOT NULL, UNIQUE, VARCHAR(30) | 课程编码 |
| teacherId | Long | teacher_id | FK → teacher.id | 授课教师 |
| departmentId | Long | department_id | FK → department.id | 开课院系 |
| credit | Integer | credit | NOT NULL | 学分 |
| hours | Integer | hours | NOT NULL | 学时 |
| courseType | Integer | course_type | NOT NULL | 类型（1必修/2选修/3公选） |
| semester | String | semester | NOT NULL, VARCHAR(20) | 开课学期 |
| maxStudents | Integer | max_students | DEFAULT 100 | 最大选课人数 |
| description | String | description | — | 课程描述 |
| status | Integer | status | NOT NULL, DEFAULT 1 | 状态（1开课/0停课） |
| createdAt | LocalDateTime | created_at | NOT NULL, 不可更新 | 创建时间 |
| updatedAt | LocalDateTime | updated_at | NOT NULL | 更新时间 |

#### 4.2.6 Score（成绩）

> 文件：`entity/Score.java`　表名：`score`

| 字段 | Java 类型 | 列名 | 约束 | 说明 |
|------|-----------|------|------|------|
| id | Long | id | PK, AUTO_INCREMENT | 主键 |
| studentId | Long | student_id | NOT NULL, FK | 学生 ID |
| courseId | Long | course_id | NOT NULL, FK | 课程 ID |
| scoreValue | BigDecimal | score_value | DECIMAL(5,2) | 分数（0~100） |
| gradeLevel | String | grade_level | VARCHAR(10) | 等级（A/B/C/D/F） |
| semester | String | semester | NOT NULL, VARCHAR(20) | 学期 |
| scoreType | Integer | score_type | NOT NULL, DEFAULT 1 | 类型（1期末/2补考/3重修） |
| isPassed | Integer | is_passed | DEFAULT 0 | 是否及格（1是/0否） |
| remark | String | remark | — | 备注 |
| createdAt | LocalDateTime | created_at | NOT NULL, 不可更新 | 创建时间 |
| updatedAt | LocalDateTime | updated_at | NOT NULL | 更新时间 |

**唯一约束**：`uk_score (student_id, course_id, semester, score_type)` — 同一学生同一课程同一学期同一考试类型只有一条记录。

#### 4.2.7 CourseSelection（选课记录）

> 文件：`entity/CourseSelection.java`　表名：`course_selection`

| 字段 | Java 类型 | 列名 | 约束 | 说明 |
|------|-----------|------|------|------|
| id | Long | id | PK, AUTO_INCREMENT | 主键 |
| studentId | Long | student_id | NOT NULL, FK | 学生 ID |
| courseId | Long | course_id | NOT NULL, FK | 课程 ID |
| semester | String | semester | NOT NULL, VARCHAR(20) | 学期 |
| status | Integer | status | NOT NULL, DEFAULT 1 | 状态（1已选/0退选） |
| selectedAt | LocalDateTime | selected_at | NOT NULL | 选课时间 |
| droppedAt | LocalDateTime | dropped_at | — | 退选时间 |

**唯一约束**：`uk_selection (student_id, course_id, semester)` — 同一学期不可重复选课。

#### 4.2.8 SysUser（系统用户）

> 文件：`entity/SysUser.java`　表名：`sys_user`

| 字段 | Java 类型 | 列名 | 约束 | 说明 |
|------|-----------|------|------|------|
| id | Long | id | PK, AUTO_INCREMENT | 主键 |
| username | String | username | NOT NULL, UNIQUE, VARCHAR(50) | 用户名 |
| passwordHash | String | password_hash | NOT NULL | 密码哈希（BCrypt） |
| role | String | role | NOT NULL, VARCHAR(20) | 角色（admin/teacher/student） |
| refId | Long | ref_id | — | 关联业务表 ID（教师或学生 ID） |
| status | Integer | status | NOT NULL, DEFAULT 1 | 状态（1启用/0禁用） |
| lastLoginAt | LocalDateTime | last_login_at | — | 最后登录时间 |
| createdAt | LocalDateTime | created_at | NOT NULL, 不可更新 | 创建时间 |

### 4.3 实体生命周期回调

所有实体（除 SysUser 和 CourseSelection 外）均使用 JPA 回调自动管理时间戳：

```java
@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
}

@PreUpdate
protected void onUpdate() {
    updatedAt = LocalDateTime.now();
}
```

- `CourseSelection` 仅在 `@PrePersist` 时设置 `selectedAt`
- `SysUser` 仅在 `@PrePersist` 时设置 `createdAt`，无 `updatedAt`

---

## 5. 后端 API 接口文档

### 5.1 接口规范

- **基础路径**：`/api/v1`
- **认证方式**：Bearer Token (JWT)
- **请求格式**：`Content-Type: application/json`
- **响应格式**：统一 `Result<T>` 封装

### 5.2 认证接口

> Controller：`AuthController.java`　基础路径：`/api/v1/auth`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/auth/login` | 用户登录 | 否 |
| POST | `/api/v1/auth/logout` | 用户登出 | 是 |
| PUT | `/api/v1/auth/password` | 修改密码 | 是 |

**POST /api/v1/auth/login**

请求体：
```json
{
  "username": "admin",
  "password": "123456"
}
```

响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzM4NCJ9...",
    "role": "admin",
    "username": "admin",
    "expiresIn": 7200
  }
}
```

**PUT /api/v1/auth/password**

请求参数（Query）：
- `oldPassword` — 原密码
- `newPassword` — 新密码

### 5.3 学生接口

> Controller：`StudentController.java`　基础路径：`/api/v1/students`

| 方法 | 路径 | 参数 | 响应类型 | 说明 |
|------|------|------|----------|------|
| GET | `/api/v1/students` | `classId?`, `pageNum=1`, `pageSize=10` | `PageResult<Student>` | 学生列表 |
| GET | `/api/v1/students/{id}` | `id` | `Student` | 学生详情 |
| POST | `/api/v1/students` | `StudentRequest` | `Student` | 创建学生 |
| PUT | `/api/v1/students/{id}` | `id`, `StudentRequest` | `Student` | 更新学生 |
| DELETE | `/api/v1/students/{id}` | `id` | `Void` | 删除学生 |
| POST | `/api/v1/students/import` | `List<StudentRequest>` | `List<Student>` | 批量导入 |

### 5.4 教师接口

> Controller：`TeacherController.java`　基础路径：`/api/v1/teachers`

| 方法 | 路径 | 参数 | 响应类型 | 说明 |
|------|------|------|----------|------|
| GET | `/api/v1/teachers` | `departmentId?`, `pageNum=1`, `pageSize=10` | `PageResult<Teacher>` | 教师列表 |
| GET | `/api/v1/teachers/{id}` | `id` | `Teacher` | 教师详情 |
| POST | `/api/v1/teachers` | `TeacherRequest` | `Teacher` | 创建教师 |
| PUT | `/api/v1/teachers/{id}` | `id`, `TeacherRequest` | `Teacher` | 更新教师 |
| DELETE | `/api/v1/teachers/{id}` | `id` | `Void` | 删除教师 |

### 5.5 课程接口

> Controller：`CourseController.java`　基础路径：`/api/v1/courses`

| 方法 | 路径 | 参数 | 响应类型 | 说明 |
|------|------|------|----------|------|
| GET | `/api/v1/courses` | `departmentId?`, `courseType?`, `semester?`, `pageNum=1`, `pageSize=10` | `PageResult<Course>` | 课程列表 |
| GET | `/api/v1/courses/{id}` | `id` | `Course` | 课程详情 |
| POST | `/api/v1/courses` | `CourseRequest` | `Course` | 创建课程 |
| PUT | `/api/v1/courses/{id}` | `id`, `CourseRequest` | `Course` | 更新课程 |
| DELETE | `/api/v1/courses/{id}` | `id` | `Void` | 删除课程 |

### 5.6 成绩接口

> Controller：`ScoreController.java`　基础路径：`/api/v1/scores`

| 方法 | 路径 | 参数 | 响应类型 | 说明 |
|------|------|------|----------|------|
| GET | `/api/v1/scores` | `studentId?`, `courseId?`, `classId?`, `semester?`, `pageNum=1`, `pageSize=10` | `PageResult<StudentScoreResponse>` | 成绩列表 |
| GET | `/api/v1/scores/{id}` | `id` | `StudentScoreResponse` | 成绩详情 |
| POST | `/api/v1/scores` | `ScoreRequest` | `Score` | 录入单条成绩 |
| POST | `/api/v1/scores/batch` | `ScoreBatchRequest` | `Void` | 批量录入成绩 |
| PUT | `/api/v1/scores/{id}` | `id`, `ScoreRequest` | `Score` | 修改成绩 |
| PUT | `/api/v1/scores/{id}/audit` | `id`, `approved` (boolean) | `Score` | 审核成绩 |
| GET | `/api/v1/scores/statistics` | `courseId`, `classId?`, `semester?` | `ScoreStatisticsResponse` | 成绩统计 |

**批量录入请求体（ScoreBatchRequest）：**
```json
{
  "courseId": 1,
  "semester": "2024-2025-1",
  "scoreType": 1,
  "records": [
    { "studentId": 1001, "scoreValue": 85.5 },
    { "studentId": 1002, "scoreValue": 72.0 }
  ]
}
```

**统计响应（ScoreStatisticsResponse）：**
```json
{
  "totalStudents": 45,
  "averageScore": 76.8,
  "maxScore": 98,
  "minScore": 32,
  "passRate": 0.844,
  "gradeDistribution": {
    "A": 8,
    "B": 15,
    "C": 12,
    "D": 7,
    "F": 3
  }
}
```

### 5.7 班级接口

> Controller：`ClassController.java`　基础路径：`/api/v1/classes`

| 方法 | 路径 | 参数 | 响应类型 | 说明 |
|------|------|------|----------|------|
| GET | `/api/v1/classes` | `departmentId?`, `pageNum=1`, `pageSize=10` | `PageResult<Clazz>` | 班级列表 |
| GET | `/api/v1/classes/{id}` | `id` | `Clazz` | 班级详情 |
| POST | `/api/v1/classes` | `ClassRequest` | `Clazz` | 创建班级 |
| PUT | `/api/v1/classes/{id}` | `id`, `ClassRequest` | `Clazz` | 更新班级 |
| DELETE | `/api/v1/classes/{id}` | `id` | `Void` | 删除班级 |

### 5.8 院系接口

> Controller：`DepartmentController.java`　基础路径：`/api/v1/departments`

| 方法 | 路径 | 参数 | 响应类型 | 说明 |
|------|------|------|----------|------|
| GET | `/api/v1/departments` | — | `List<DepartmentTreeResponse>` | 院系树形列表 |
| GET | `/api/v1/departments/{id}` | `id` | `Department` | 院系详情 |
| POST | `/api/v1/departments` | `DepartmentRequest` | `Department` | 创建院系 |
| PUT | `/api/v1/departments/{id}` | `id`, `DepartmentRequest` | `Department` | 更新院系 |
| DELETE | `/api/v1/departments/{id}` | `id` | `Void` | 删除院系 |

### 5.9 选课接口

> Controller：`CourseSelectionController.java`　基础路径：`/api/v1/course-selections`

| 方法 | 路径 | 参数 | 响应类型 | 说明 |
|------|------|------|----------|------|
| GET | `/api/v1/course-selections` | `pageNum=1`, `pageSize=10` | `PageResult<CourseSelection>` | 选课记录列表 |
| GET | `/api/v1/course-selections/courses/{courseId}/selections` | `courseId`, `pageNum=1`, `pageSize=10` | `PageResult<CourseSelection>` | 课程选课学生列表 |
| POST | `/api/v1/course-selections` | `CourseSelectionRequest` | `CourseSelection` | 学生选课 |
| PUT | `/api/v1/course-selections/{id}/drop` | `id` | `Void` | 学生退选 |

**选课请求体（CourseSelectionRequest）：**
```json
{
  "studentId": 1001,
  "courseId": 2001,
  "semester": "2024-2025-1"
}
```

### 5.10 接口汇总

| 模块 | Controller | 接口数 |
|------|-----------|--------|
| 认证 | AuthController | 3 |
| 学生 | StudentController | 6 |
| 教师 | TeacherController | 5 |
| 课程 | CourseController | 5 |
| 成绩 | ScoreController | 7 |
| 班级 | ClassController | 5 |
| 院系 | DepartmentController | 5 |
| 选课 | CourseSelectionController | 4 |
| **合计** | **8** | **40** |

---

## 6. 前端架构文档

### 6.1 项目目录结构

```
front/
├── index.html                         # HTML 入口
├── package.json                       # 依赖与脚本
├── vite.config.js                     # Vite 构建配置
├── package-lock.json                  # 依赖锁定
└── src/
    ├── main.js                        # 应用入口
    ├── App.vue                        # 根组件
    ├── router/
    │   └── index.js                   # 路由配置与导航守卫
    ├── stores/
    │   └── user.js                    # 用户状态管理（Pinia）
    ├── utils/
    │   └── request.js                 # Axios HTTP 客户端
    ├── api/                           # API 接口定义
    │   ├── auth.js                    # 认证接口
    │   ├── department.js              # 院系接口
    │   ├── teacher.js                 # 教师接口
    │   ├── student.js                 # 学生接口
    │   ├── class.js                   # 班级接口
    │   ├── course.js                  # 课程接口
    │   ├── score.js                   # 成绩接口
    │   └── enrollment.js              # 选课接口
    ├── layouts/
    │   └── MainLayout.vue             # 主布局（侧边栏+头部+内容区）
    └── views/                         # 页面组件
        ├── login/
        │   └── LoginView.vue          # 登录页
        ├── dashboard/
        │   └── DashboardView.vue      # 仪表盘
        ├── admin/                     # 管理员页面（9个）
        ├── teacher/                   # 教师页面（4个）
        └── student/                   # 学生页面（4个）
```

### 6.2 技术依赖清单

**运行时依赖：**

| 包名 | 版本 | 用途 |
|------|------|------|
| vue | ^3.4.0 | Vue 3 核心框架 |
| vue-router | ^4.3.0 | SPA 路由 |
| pinia | ^2.1.0 | 状态管理 |
| element-plus | ^2.7.0 | UI 组件库 |
| @element-plus/icons-vue | ^2.3.0 | Element Plus 图标 |
| axios | ^1.7.0 | HTTP 客户端 |
| echarts | ^5.5.0 | 图表库 |
| vue-echarts | ^6.6.0 | ECharts Vue 3 封装 |

**开发依赖：**

| 包名 | 版本 | 用途 |
|------|------|------|
| @vitejs/plugin-vue | ^5.0.0 | Vue SFC 编译插件 |
| vite | ^5.4.0 | 构建工具 |
| unplugin-auto-import | ^0.17.0 | API 自动导入 |
| unplugin-vue-components | ^0.27.0 | 组件自动注册 |

### 6.3 构建配置

> 文件位置：`front/vite.config.js`

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 开发端口 | 5173 | Vite dev server |
| API 代理 | `/api` → `http://localhost:8094` | 开发环境代理后端 |
| 别名 | `@` → `./src` | 路径别名 |
| 自动导入 | Vue / Vue Router / Pinia API | 无需手动 import |
| 组件注册 | Element Plus 组件按需自动注册 | 无需手动注册 |

### 6.4 应用初始化流程

> 文件位置：`front/src/main.js`

```mermaid
flowchart TD
    A[创建 Vue App] --> B[创建 Pinia 实例]
    B --> C[全局注册所有 Element Plus 图标]
    C --> D[app.use(pinia)]
    D --> E[app.use(router)]
    E --> F[app.use(ElementPlus, zh-CN locale)]
    F --> G[app.mount('#app')]
```

### 6.5 路由设计与权限守卫

> 文件位置：`front/src/router/index.js`

#### 路由表

| 路径 | 名称 | 组件 | meta.roles | 说明 |
|------|------|------|------------|------|
| `/login` | Login | LoginView.vue | — | 登录页（无需认证） |
| `/` | — | MainLayout.vue | — | 布局壳（重定向到 /dashboard） |
| `/dashboard` | Dashboard | DashboardView.vue | — | 仪表盘 |
| `/admin/users` | UserManage | admin/UserManage.vue | admin | 用户管理 |
| `/admin/departments` | DepartmentManage | admin/DepartmentManage.vue | admin | 院系管理 |
| `/admin/classes` | ClassManage | admin/ClassManage.vue | admin | 班级管理 |
| `/course-admin/courses` | CourseManage | admin/CourseManage.vue | admin | 课程管理 |
| `/course-admin/teachers` | TeacherManage | admin/TeacherManage.vue | admin | 教师管理 |
| `/course-admin/students` | StudentManage | admin/StudentManage.vue | admin | 学生管理 |
| `/score-admin/audit` | ScoreAudit | admin/ScoreAudit.vue | admin | 成绩审核 |
| `/score-admin/statistics` | ScoreStatistics | admin/ScoreStatistics.vue | admin | 成绩统计 |
| `/score-admin/graduation` | GraduationAudit | admin/GraduationAudit.vue | admin | 毕业审核 |
| `/teacher/my-courses` | MyCourses | teacher/MyCourses.vue | teacher, admin | 我的课程 |
| `/teacher/roster/:courseId` | StudentRoster | teacher/StudentRoster.vue | teacher, admin | 学生名册 |
| `/teacher/score-input` | ScoreInput | teacher/ScoreInput.vue | teacher, admin | 成绩录入 |
| `/teacher/schedule` | TeacherSchedule | teacher/ScheduleView.vue | teacher, admin | 教学课表 |
| `/student/course-selection` | CourseSelection | student/CourseSelection.vue | student, admin | 选课中心 |
| `/student/my-scores` | MyScores | student/MyScores.vue | student, admin | 成绩查询 |
| `/student/my-schedule` | MySchedule | student/MySchedule.vue | student, admin | 我的课表 |
| `/student/training-plan` | TrainingPlan | student/TrainingPlan.vue | student, admin | 培养方案 |

#### 导航守卫逻辑

```javascript
router.beforeEach((to, from, next) => {
  // 1. 认证检查：无 Token → 跳转登录
  if (to.meta.requiresAuth !== false && !userStore.token) {
    next('/login')
  }
  // 2. 授权检查：角色不匹配 → 跳转首页
  else if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
    next('/dashboard')
  }
  // 3. 放行
  else {
    next()
  }
})
```

### 6.6 状态管理

> 文件位置：`front/src/stores/user.js`

使用 Pinia Composition API 语法定义 user store：

| 类型 | 名称 | 说明 |
|------|------|------|
| State | token | JWT Token（从 localStorage 初始化） |
| State | username | 用户名 |
| State | role | 角色（admin/teacher/student） |
| Getter | isLoggedIn | 是否已登录 |
| Getter | isAdmin | 是否管理员 |
| Getter | isTeacher | 是否教师 |
| Getter | isStudent | 是否学生 |
| Action | login(loginForm) | 登录并持久化 |
| Action | logout() | 登出并清除持久化 |

**持久化策略**：手动将 token、username、role 写入 localStorage，页面刷新时从 localStorage 恢复。

### 6.7 HTTP 客户端

> 文件位置：`front/src/utils/request.js`

Axios 实例配置：

| 配置项 | 值 |
|--------|-----|
| baseURL | `/api/v1` |
| timeout | 15000ms |
| Content-Type | application/json |

**请求拦截器**：从 userStore 读取 token，注入 `Authorization: Bearer <token>` 请求头。

**响应拦截器（成功）**：检查 `response.data.code === 200`，是则返回 `response.data.data`（解包），否则显示错误消息。

**响应拦截器（错误）**：
- HTTP 401 或 body.code === 401 → 清除登录状态，跳转登录页
- 其他错误 → 显示 `error.response.data.message` 或通用错误提示
- 网络错误 → 显示"网络错误，请检查网络连接"

---

## 7. 前端页面设计

### 7.1 布局组件

> 文件位置：`front/src/layouts/MainLayout.vue`

```mermaid
flowchart TB
    subgraph layout [MainLayout]
        subgraph aside [侧边栏 el-aside]
            Logo[Logo 区域]
            Menu[el-menu 菜单<br/>按角色动态显示]
        end
        subgraph main [主区域 el-container]
            Header[el-header<br/>折叠按钮 + 面包屑 + 用户信息]
            Content[el-main<br/>router-view 内容区]
        end
    end
```

**侧边栏菜单结构（按角色动态显示）：**

| 角色 | 菜单组 | 菜单项 |
|------|--------|--------|
| 全部 | — | 首页 |
| admin | 系统管理 | 用户管理、院系管理、班级管理 |
| admin | 教学管理 | 课程管理、教师管理、学生管理 |
| admin | 成绩管理 | 成绩审核、成绩统计、毕业审核 |
| teacher | 教学工作 | 我的课程、成绩录入、教学课表 |
| student | 我的学业 | 选课中心、成绩查询、我的课表、培养方案 |

**头部功能**：
- 折叠/展开侧边栏按钮
- 面包屑导航
- 角色标签
- 用户名显示
- 下拉菜单：个人信息、修改密码、退出登录

### 7.2 登录页

> 文件位置：`front/src/views/login/LoginView.vue`

| 元素 | 说明 |
|------|------|
| 系统名称 | 学生教育管理系统 |
| 用户名输入 | el-input + User 图标 |
| 密码输入 | el-input + Lock 图标，show-password |
| 登录按钮 | 调用 `userStore.login()`，成功后跳转 /dashboard |
| 背景 | 渐变色 (#667eea → #764ba2) |

### 7.3 仪表盘

> 文件位置：`front/src/views/dashboard/DashboardView.vue`

按角色显示不同统计卡片：

| 角色 | 卡片内容 |
|------|----------|
| admin | 教师总数、学生总数、开设课程、待审成绩 |
| teacher | 授课数量、学生人数、待录成绩、本周课时 |
| student | 已修学分、本学期课程、当前GPA、待选课程 |

图表组件：
- 成绩分布柱状图（ECharts BarChart）
- 选课人数 TOP5 饼图（ECharts PieChart）

其他区域：
- 待办事项表格
- 通知公告时间线

### 7.4 管理员页面（9个）

| 页面 | 文件 | 功能 | 关键组件 |
|------|------|------|----------|
| 用户管理 | admin/UserManage.vue | 用户 CRUD、启用/禁用、重置密码 | el-table, el-dialog, el-form, el-pagination |
| 院系管理 | admin/DepartmentManage.vue | 树形院系 CRUD | el-table(row-key), el-tree-select |
| 班级管理 | admin/ClassManage.vue | 班级 CRUD、查看学生 | el-table, el-dialog, el-pagination |
| 课程管理 | admin/CourseManage.vue | 课程 CRUD、类型/学期筛选 | el-table, el-dialog, el-input-number |
| 教师管理 | admin/TeacherManage.vue | 教师 CRUD、院系筛选 | el-table, el-dialog, el-pagination |
| 学生管理 | admin/StudentManage.vue | 学生 CRUD、批量导入 | el-table, el-dialog, el-upload |
| 成绩审核 | admin/ScoreAudit.vue | 成绩审核/驳回、批量通过、查看详情 | el-table(selection), el-dialog |
| 成绩统计 | admin/ScoreStatistics.vue | 统计卡片、等级分布图、分数段图 | el-card, v-chart(pie+bar) |
| 毕业审核 | admin/GraduationAudit.vue | 执行审核、查看缺修清单 | el-table, el-dialog |

### 7.5 教师页面（4个）

| 页面 | 文件 | 功能 | 关键组件 |
|------|------|------|----------|
| 我的课程 | teacher/MyCourses.vue | 授课列表、跳转名册/成绩录入 | el-table |
| 学生名册 | teacher/StudentRoster.vue | 选课学生名单、导出 | el-table, el-button |
| 成绩录入 | teacher/ScoreInput.vue | 选择课程、录入成绩、自动计算总评/绩点、批量提交 | el-table, el-input-number, el-select |
| 教学课表 | teacher/ScheduleView.vue | 周课表网格展示 | el-table(border) |

### 7.6 学生页面（4个）

| 页面 | 文件 | 功能 | 关键组件 |
|------|------|------|----------|
| 选课中心 | student/CourseSelection.vue | 课程列表、选课/退选、学分限制校验 | el-table, el-alert, el-tag |
| 成绩查询 | student/MyScores.vue | 个人成绩列表、GPA/学分概览、导出 | el-descriptions, el-table |
| 我的课表 | student/MySchedule.vue | 个人周课表 | el-table(border) |
| 培养方案 | student/TrainingPlan.vue | 学分进度、必修/选修/实践分类、学业预警 | el-progress, el-tabs, el-alert |

---

## 8. 前后端交互设计

### 8.1 认证流程时序图

```mermaid
sequenceDiagram
    participant U as 用户浏览器
    participant F as 前端 Vue
    participant B as 后端 Spring Boot
    participant DB as MySQL

    U->>F: 输入用户名密码，点击登录
    F->>B: POST /api/v1/auth/login {username, password}
    B->>DB: SELECT * FROM sys_user WHERE username=?
    DB-->>B: SysUser 记录
    B->>B: BCrypt.matches(password, passwordHash)
    B->>B: JwtUtil.generateToken(userId, username, role)
    B-->>F: {code:200, data:{token, role, username, expiresIn}}
    F->>F: userStore.login() 存储 token/username/role 到 localStorage
    F-->>U: 跳转到 /dashboard

    Note over F,B: 后续请求自动携带 Token

    U->>F: 点击菜单
    F->>B: GET /api/v1/students (Authorization: Bearer <token>)
    B->>B: JwtAuthFilter 解析 Token
    B->>B: SecurityContext 设置认证信息
    B->>B: Controller 处理请求
    B->>DB: SELECT * FROM student
    DB-->>B: 学生数据
    B-->>F: {code:200, data:{list, total, pageNum, pageSize}}
    F-->>U: 渲染学生列表
```

### 8.2 API 请求/响应示例

#### 8.2.1 登录

**请求：**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

**成功响应（HTTP 200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJJZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyMzY2NDk2LCJleHAiOjE3ODIzNzM2OTZ9.pI78zhdtHpxH...",
    "role": "admin",
    "username": "admin",
    "expiresIn": 7200
  }
}
```

**失败响应（HTTP 400）：**
```json
{
  "code": 401,
  "message": "用户名或密码错误"
}
```

#### 8.2.2 学生选课

**请求：**
```http
POST /api/v1/course-selections
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
Content-Type: application/json

{
  "studentId": 1,
  "courseId": 3,
  "semester": "2024-2025-1"
}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 10,
    "studentId": 1,
    "courseId": 3,
    "semester": "2024-2025-1",
    "status": 1,
    "selectedAt": "2025-01-15 10:30:00",
    "droppedAt": null
  }
}
```

#### 8.2.3 批量录入成绩

**请求：**
```http
POST /api/v1/scores/batch
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
Content-Type: application/json

{
  "courseId": 1,
  "semester": "2024-2025-1",
  "scoreType": 1,
  "records": [
    { "studentId": 1, "scoreValue": 85.5 },
    { "studentId": 2, "scoreValue": 72.0 },
    { "studentId": 3, "scoreValue": 58.0 }
  ]
}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 8.3 错误处理约定

前端 `request.js` 拦截器采用**双重判断**策略：

```mermaid
flowchart TD
    A[HTTP 响应] --> B{HTTP 状态码}
    B -->|2xx| C{body.code === 200?}
    C -->|是| D[返回 body.data]
    C -->|否| E[显示 body.message]
    B -->|401| F{body.code === 401?}
    F -->|是| G[清除登录状态 跳转登录页]
    F -->|否| H[显示错误消息]
    B -->|其他 4xx/5xx| I[显示 body.message 或通用错误]
    B -->|网络错误| J[显示网络错误提示]
```

| HTTP 状态码 | body.code | 前端处理 |
|------------|-----------|----------|
| 200 | 200 | 正常返回 data |
| 200 | 非200 | 显示 message，reject Promise |
| 400 | 401 | 显示"用户名或密码错误" |
| 400 | 400 | 显示参数校验错误 |
| 401 | — | 清除登录，跳转登录页 |
| 403 | 403 | 显示"无权限访问" |
| 500 | 500 | 显示"服务器内部错误" |
| — | — | 显示"网络错误" |

### 8.4 前端 Mock 数据说明

当前前端页面中，除登录功能外，大部分页面使用 `setTimeout` + 硬编码 Mock 数据模拟接口响应。API 接口层（`src/api/*.js`）已完整定义，后续对接真实后端时只需将页面中的 Mock 调用替换为 API 函数调用即可。

| 页面 | 当前数据来源 | API 对接状态 |
|------|-------------|-------------|
| LoginView | 真实 API（/api/v1/auth/login） | 已对接 |
| MainLayout | 真实 API（/api/v1/auth/password） | 已对接 |
| DashboardView | Mock 数据 | 待对接 |
| admin/* | Mock 数据 | 待对接 |
| teacher/* | Mock 数据 | 待对接 |
| student/* | Mock 数据 | 待对接 |

---

## 9. 数据库设计

### 9.1 建表 DDL

数据库表由 JPA `ddl-auto: update` 自动创建/更新。以下是预期表结构：

```sql
-- 院系表
CREATE TABLE department (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    parent_id BIGINT,
    dean VARCHAR(255),
    description TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (parent_id) REFERENCES department(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 教师表
CREATE TABLE teacher (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    employee_no VARCHAR(30) NOT NULL,
    department_id BIGINT,
    title VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    status INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_employee_no (employee_no),
    FOREIGN KEY (department_id) REFERENCES department(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 班级表
CREATE TABLE class (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    department_id BIGINT,
    advisor_id BIGINT,
    grade VARCHAR(10) NOT NULL,
    major VARCHAR(255),
    student_count INT DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id) REFERENCES department(id),
    FOREIGN KEY (advisor_id) REFERENCES teacher(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 学生表
CREATE TABLE student (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    student_no VARCHAR(30) NOT NULL,
    class_id BIGINT,
    gender INT,
    enrollment_date DATE NOT NULL,
    phone VARCHAR(255),
    email VARCHAR(255),
    status INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_student_no (student_no),
    FOREIGN KEY (class_id) REFERENCES class(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 课程表
CREATE TABLE course (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL,
    teacher_id BIGINT,
    department_id BIGINT,
    credit INT NOT NULL,
    hours INT NOT NULL,
    course_type INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    max_students INT DEFAULT 100,
    description VARCHAR(255),
    status INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_code (code),
    FOREIGN KEY (teacher_id) REFERENCES teacher(id),
    FOREIGN KEY (department_id) REFERENCES department(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 成绩表
CREATE TABLE score (
    id BIGINT NOT NULL AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    score_value DECIMAL(5,2),
    grade_level VARCHAR(10),
    semester VARCHAR(20) NOT NULL,
    score_type INT NOT NULL DEFAULT 1,
    is_passed INT DEFAULT 0,
    remark VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_score (student_id, course_id, semester, score_type),
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (course_id) REFERENCES course(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 选课记录表
CREATE TABLE course_selection (
    id BIGINT NOT NULL AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    status INT NOT NULL DEFAULT 1,
    selected_at DATETIME NOT NULL,
    dropped_at DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_selection (student_id, course_id, semester),
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (course_id) REFERENCES course(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 系统用户表
CREATE TABLE sys_user (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    ref_id BIGINT,
    status INT NOT NULL DEFAULT 1,
    last_login_at DATETIME,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 9.2 索引与约束汇总

| 表名 | 约束名 | 类型 | 字段 |
|------|--------|------|------|
| department | — | FK | parent_id → department.id |
| teacher | uk_employee_no | UNIQUE | employee_no |
| teacher | — | FK | department_id → department.id |
| class | — | FK | department_id → department.id |
| class | — | FK | advisor_id → teacher.id |
| student | uk_student_no | UNIQUE | student_no |
| student | — | FK | class_id → class.id |
| course | uk_code | UNIQUE | code |
| course | — | FK | teacher_id → teacher.id |
| course | — | FK | department_id → department.id |
| score | uk_score | UNIQUE | (student_id, course_id, semester, score_type) |
| score | — | FK | student_id → student.id |
| score | — | FK | course_id → course.id |
| course_selection | uk_selection | UNIQUE | (student_id, course_id, semester) |
| course_selection | — | FK | student_id → student.id |
| course_selection | — | FK | course_id → course.id |
| sys_user | uk_username | UNIQUE | username |

### 9.3 初始化数据

系统需要至少一个管理员账号。以下 SQL 用于初始化 admin 用户（密码 `123456` 的 BCrypt 哈希）：

```sql
INSERT INTO sys_user (username, password_hash, role, status, created_at)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'admin', 1, NOW());
```

> 注意：实际 BCrypt 哈希值需通过 `BCryptPasswordEncoder.encode("123456")` 生成。

---

## 10. 部署与运维

### 10.1 后端启动

#### 开发环境

```powershell
# 方式一：Maven 启动
cd d:\Workspace\Comate\demo3\student-edu-system
mvn spring-boot:run

# 方式二：编译后启动
mvn clean package -DskipTests
java -jar target/student-edu-system-1.0.0.jar

# 指定环境
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

- **端口**：8094
- **数据库**：MySQL `192.168.52.66:3306/testinfozcqdb`
- **Swagger 文档**：`http://localhost:8094/swagger-ui.html`
- **API 文档**：`http://localhost:8094/v3/api-docs`

#### 环境配置

| Profile | 配置文件 | 日志级别 |
|---------|----------|----------|
| 默认 | application.yml | INFO |
| local | application-local.yml | com.edu: DEBUG |
| dev | application-dev.yml | com.edu: DEBUG, Hibernate SQL: DEBUG |

### 10.2 前端启动

#### 开发环境

```powershell
cd d:\Workspace\Comate\demo3\front
npm install        # 安装依赖
npm run dev        # 启动开发服务器 http://localhost:5173
```

- **端口**：5173
- **API 代理**：`/api` → `http://localhost:8094`
- **热更新**：Vite HMR 自动刷新

#### 生产构建

```powershell
npm run build      # 构建到 dist/ 目录
npm run preview    # 预览构建结果
```

- 构建输出：`front/dist/`
- 部署方式：将 `dist/` 部署到 Nginx / 静态服务器，配置反向代理 `/api` → 后端

### 10.3 开发环境代理配置

前端 Vite 开发服务器代理配置（`vite.config.js`）：

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8094',
      changeOrigin: true
    }
  }
}
```

生产环境需在 Nginx 中配置等效反向代理：

```nginx
location /api/ {
    proxy_pass http://backend:8094/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 10.4 项目整体目录结构

```
d:\Workspace\Comate\demo3\
├── Design.md                          # 本设计文档
├── readme.md                          # 系统说明文档
├── student-edu-system/                # 后端项目（Spring Boot）
│   ├── pom.xml
│   └── src/
└── front/                             # 前端项目（Vue 3）
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
```

### 10.5 默认账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | 123456 | admin | 系统管理员 |

---

> **文档结束**
