import type { MockMethod } from 'vite-plugin-mock'
import { success, fail, users, nextId } from './data'

export default [
  {
    url: '/api/v1/auth/login',
    method: 'post',
    response: ({ body }: any) => {
      const { username, password } = body
      const user = users.find(u => u.username === username && u.password === password)
      if (user) {
        return success({
          token: `mock-token-${user.role}-${user.id}`,
          role: user.role,
          username: user.username,
          expiresIn: 7200,
        }, '登录成功')
      }
      return fail('用户名或密码错误', 401)
    },
  },
  {
    url: '/api/v1/auth/logout',
    method: 'post',
    response: () => success(null, '退出成功'),
  },
  {
    url: '/api/v1/auth/password',
    method: 'put',
    response: ({ query }: any) => {
      const { oldPassword, newPassword } = query
      if (oldPassword && newPassword) {
        return success(null, '密码修改成功')
      }
      return fail('参数错误')
    },
  },
] as MockMethod[]
