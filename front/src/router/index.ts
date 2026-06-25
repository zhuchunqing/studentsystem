import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { UserRole } from '@/types'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    roles?: UserRole[]
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      // 管理员路由
      {
        path: 'admin/users',
        name: 'UserManage',
        component: () => import('@/views/admin/UserManage.vue'),
        meta: { title: '用户管理', icon: 'User', roles: ['admin'] }
      },
      {
        path: 'admin/departments',
        name: 'DepartmentManage',
        component: () => import('@/views/admin/DepartmentManage.vue'),
        meta: { title: '院系管理', icon: 'OfficeBuilding', roles: ['admin'] }
      },
      {
        path: 'admin/classes',
        name: 'ClassManage',
        component: () => import('@/views/admin/ClassManage.vue'),
        meta: { title: '班级管理', icon: 'School', roles: ['admin'] }
      },
      {
        path: 'course-admin/courses',
        name: 'CourseManage',
        component: () => import('@/views/admin/CourseManage.vue'),
        meta: { title: '课程管理', icon: 'Notebook', roles: ['admin'] }
      },
      {
        path: 'course-admin/teachers',
        name: 'TeacherManage',
        component: () => import('@/views/admin/TeacherManage.vue'),
        meta: { title: '教师管理', icon: 'UserFilled', roles: ['admin'] }
      },
      {
        path: 'course-admin/students',
        name: 'StudentManage',
        component: () => import('@/views/admin/StudentManage.vue'),
        meta: { title: '学生管理', icon: 'Avatar', roles: ['admin'] }
      },
      {
        path: 'score-admin/audit',
        name: 'ScoreAudit',
        component: () => import('@/views/admin/ScoreAudit.vue'),
        meta: { title: '成绩审核', icon: 'CircleCheck', roles: ['admin'] }
      },
      {
        path: 'score-admin/statistics',
        name: 'ScoreStatistics',
        component: () => import('@/views/admin/ScoreStatistics.vue'),
        meta: { title: '成绩统计', icon: 'TrendCharts', roles: ['admin'] }
      },
      {
        path: 'score-admin/graduation',
        name: 'GraduationAudit',
        component: () => import('@/views/admin/GraduationAudit.vue'),
        meta: { title: '毕业审核', icon: 'Stamp', roles: ['admin'] }
      },
      // 教师路由
      {
        path: 'teacher/my-courses',
        name: 'MyCourses',
        component: () => import('@/views/teacher/MyCourses.vue'),
        meta: { title: '我的课程', icon: 'Notebook', roles: ['teacher', 'admin'] }
      },
      {
        path: 'teacher/roster/:courseId',
        name: 'StudentRoster',
        component: () => import('@/views/teacher/StudentRoster.vue'),
        meta: { title: '学生名册', roles: ['teacher', 'admin'] },
        props: true
      },
      {
        path: 'teacher/score-input',
        name: 'ScoreInput',
        component: () => import('@/views/teacher/ScoreInput.vue'),
        meta: { title: '成绩录入', icon: 'Edit', roles: ['teacher', 'admin'] }
      },
      {
        path: 'teacher/schedule',
        name: 'TeacherSchedule',
        component: () => import('@/views/teacher/ScheduleView.vue'),
        meta: { title: '教学课表', icon: 'Calendar', roles: ['teacher', 'admin'] }
      },
      // 学生路由
      {
        path: 'student/course-selection',
        name: 'CourseSelection',
        component: () => import('@/views/student/CourseSelection.vue'),
        meta: { title: '选课中心', icon: 'Pointer', roles: ['student', 'admin'] }
      },
      {
        path: 'student/my-scores',
        name: 'MyScores',
        component: () => import('@/views/student/MyScores.vue'),
        meta: { title: '成绩查询', icon: 'Histogram', roles: ['student', 'admin'] }
      },
      {
        path: 'student/my-schedule',
        name: 'MySchedule',
        component: () => import('@/views/student/MySchedule.vue'),
        meta: { title: '我的课表', icon: 'Calendar', roles: ['student', 'admin'] }
      },
      {
        path: 'student/training-plan',
        name: 'TrainingPlan',
        component: () => import('@/views/student/TrainingPlan.vue'),
        meta: { title: '培养方案', icon: 'Document', roles: ['student', 'admin'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  document.title = to.meta.title ? `${to.meta.title} - 学生教育管理系统` : '学生教育管理系统'

  if (to.meta.requiresAuth !== false && !userStore.token) {
    next('/login')
  } else if (to.meta.roles && !to.meta.roles.includes(userStore.role as UserRole)) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
