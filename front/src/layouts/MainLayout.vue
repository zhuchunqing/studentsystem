<template>
  <el-container class="main-layout">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <div class="logo">
        <el-icon :size="28"><School /></el-icon>
        <span v-show="!isCollapse" class="logo-text">学生教育管理系统</span>
      </div>
      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <template v-if="userStore.isAdmin">
            <el-sub-menu index="admin">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>系统管理</span>
              </template>
              <el-menu-item index="/admin/users">用户管理</el-menu-item>
              <el-menu-item index="/admin/departments">院系管理</el-menu-item>
              <el-menu-item index="/admin/classes">班级管理</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="course-admin">
              <template #title>
                <el-icon><Reading /></el-icon>
                <span>教学管理</span>
              </template>
              <el-menu-item index="/course-admin/courses">课程管理</el-menu-item>
              <el-menu-item index="/course-admin/teachers">教师管理</el-menu-item>
              <el-menu-item index="/course-admin/students">学生管理</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="score-admin">
              <template #title>
                <el-icon><DataLine /></el-icon>
                <span>成绩管理</span>
              </template>
              <el-menu-item index="/score-admin/audit">成绩审核</el-menu-item>
              <el-menu-item index="/score-admin/statistics">成绩统计</el-menu-item>
              <el-menu-item index="/score-admin/graduation">毕业审核</el-menu-item>
            </el-sub-menu>
          </template>

          <template v-if="userStore.isTeacher">
            <el-sub-menu index="teacher">
              <template #title>
                <el-icon><EditPen /></el-icon>
                <span>教学工作</span>
              </template>
              <el-menu-item index="/teacher/my-courses">我的课程</el-menu-item>
              <el-menu-item index="/teacher/score-input">成绩录入</el-menu-item>
              <el-menu-item index="/teacher/schedule">教学课表</el-menu-item>
            </el-sub-menu>
          </template>

          <template v-if="userStore.isStudent">
            <el-sub-menu index="student">
              <template #title>
                <el-icon><Reading /></el-icon>
                <span>我的学业</span>
              </template>
              <el-menu-item index="/student/course-selection">选课中心</el-menu-item>
              <el-menu-item index="/student/my-scores">成绩查询</el-menu-item>
              <el-menu-item index="/student/my-schedule">我的课表</el-menu-item>
              <el-menu-item index="/student/training-plan">培养方案</el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title && route.path !== '/dashboard'">
              {{ route.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tag :type="roleTagType" size="small">{{ roleLabel }}</el-tag>
          <span class="username">{{ userStore.username }}</span>
          <el-dropdown @command="handleCommand">
            <el-icon class="user-icon"><UserFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>

    <el-dialog v-model="passwordVisible" title="修改密码" width="420px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="80px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { changePassword } from '@/api/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const roleLabel = computed(() => {
  const map: Record<string, string> = { admin: '管理员', teacher: '教师', student: '学生' }
  return map[userStore.role] || userStore.role
})
const roleTagType = computed(() => {
  const map: Record<string, '' | 'danger' | 'warning' | 'info'> = { admin: 'danger', teacher: 'warning', student: '' }
  return map[userStore.role] || 'info'
})

function handleMenuSelect(index: string) {
  if (index && index.startsWith('/')) {
    router.push(index)
  }
}

interface PasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const passwordVisible = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = ref<PasswordForm>({ oldPassword: '', newPassword: '', confirmPassword: '' })
const passwordRules: FormRules<PasswordForm> = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
  confirmPassword: [{
    validator: (_rule, value: string, callback) => {
      if (value !== passwordForm.value.newPassword) {
        callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    }, trigger: 'blur'
  }]
}

async function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    await ElMessageBox.confirm('确定退出登录？', '提示', { type: 'warning' })
    userStore.logout()
    router.push('/login')
  } else if (cmd === 'password') {
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    passwordVisible.value = true
  }
}

async function handlePasswordSubmit() {
  await passwordFormRef.value?.validate()
  await changePassword({
    oldPassword: passwordForm.value.oldPassword,
    newPassword: passwordForm.value.newPassword
  })
  ElMessage.success('密码修改成功')
  passwordVisible.value = false
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}
.aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  gap: 8px;
  border-bottom: 1px solid #3a4a5b;
}
.logo-text {
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
}
.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
  height: 60px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.collapse-btn {
  cursor: pointer;
  font-size: 20px;
  color: #606266;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.username {
  font-size: 14px;
  color: #606266;
}
.user-icon {
  cursor: pointer;
  font-size: 20px;
  color: #606266;
}
.main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
