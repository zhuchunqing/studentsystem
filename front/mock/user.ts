import type { MockMethod } from 'vite-plugin-mock'
import { users, success, fail, nextId, paginate } from './data'

export default [
  {
    url: '/api/v1/users',
    method: 'get',
    response: ({ query }: any) => {
      const { pageNum = 1, pageSize = 10, username, role, status } = query
      let list = [...users]
      if (username) list = list.filter(u => u.username.includes(username))
      if (role) list = list.filter(u => u.role === role)
      if (status !== undefined && status !== '') list = list.filter(u => u.status === Number(status))
      const paged = paginate(list, Number(pageNum), Number(pageSize))
      const safeList = paged.list.map(({ password, ...u }: any) => u)
      return success({ ...paged, list: safeList })
    },
  },
  {
    url: '/api/v1/users/:id',
    method: 'get',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const u = users.find(u => u.id === id)
      if (!u) return fail('用户不存在', 404)
      const { password, ...safe } = u
      return success(safe)
    },
  },
  {
    url: '/api/v1/users',
    method: 'post',
    response: ({ body }: any) => {
      const exists = users.find(u => u.username === body.username)
      if (exists) return fail('用户名已存在')
      const u = { id: nextId(users), lastLoginAt: null, createdAt: '2025-06-29T10:00:00', ...body }
      users.push(u)
      const { password, ...safe } = u
      return success(safe, '创建成功')
    },
  },
  {
    url: '/api/v1/users/:id',
    method: 'put',
    response: ({ url, body }: any) => {
      const id = Number(url.split('/').pop())
      const idx = users.findIndex(u => u.id === id)
      if (idx === -1) return fail('用户不存在', 404)
      users[idx] = { ...users[idx], ...body }
      const { password, ...safe } = users[idx]
      return success(safe, '更新成功')
    },
  },
  {
    url: '/api/v1/users/:id',
    method: 'delete',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const idx = users.findIndex(u => u.id === id)
      if (idx === -1) return fail('用户不存在', 404)
      users.splice(idx, 1)
      return success(null, '删除成功')
    },
  },
  {
    url: '/api/v1/users/:id/reset-password',
    method: 'put',
    response: ({ query }: any) => {
      const id = Number(query.id)
      const u = users.find(u => u.id === id)
      if (!u) return fail('用户不存在', 404)
      u.password = '123456'
      return success(null, '密码已重置为 123456')
    },
  },
  {
    url: '/api/v1/users/:id/status',
    method: 'put',
    response: ({ query, body }: any) => {
      const id = Number(query.id)
      const idx = users.findIndex(u => u.id === id)
      if (idx === -1) return fail('用户不存在', 404)
      users[idx].status = body.status
      const { password, ...safe } = users[idx]
      return success(safe, '状态更新成功')
    },
  },
] as MockMethod[]
