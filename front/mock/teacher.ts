import type { MockMethod } from 'vite-plugin-mock'
import { teachers, success, fail, nextId, paginate } from './data'

export default [
  {
    url: '/api/v1/teachers',
    method: 'get',
    response: ({ query }: any) => {
      const { pageNum = 1, pageSize = 10, name, employeeNo, departmentId } = query
      let list = [...teachers]
      if (name) list = list.filter(t => t.name.includes(name))
      if (employeeNo) list = list.filter(t => t.employeeNo.includes(employeeNo))
      if (departmentId) list = list.filter(t => t.departmentId === Number(departmentId))
      return success(paginate(list, Number(pageNum), Number(pageSize)))
    },
  },
  {
    url: '/api/v1/teachers/:id',
    method: 'get',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const t = teachers.find(t => t.id === id)
      return t ? success(t) : fail('教师不存在', 404)
    },
  },
  {
    url: '/api/v1/teachers',
    method: 'post',
    response: ({ body }: any) => {
      const t = { id: nextId(teachers), status: 1, ...body, createdAt: '2025-06-29T10:00:00', updatedAt: '2025-06-29T10:00:00' }
      teachers.push(t)
      return success(t, '创建成功')
    },
  },
  {
    url: '/api/v1/teachers/:id',
    method: 'put',
    response: ({ url, body }: any) => {
      const id = Number(url.split('/').pop())
      const idx = teachers.findIndex(t => t.id === id)
      if (idx === -1) return fail('教师不存在', 404)
      teachers[idx] = { ...teachers[idx], ...body, updatedAt: '2025-06-29T10:00:00' }
      return success(teachers[idx], '更新成功')
    },
  },
  {
    url: '/api/v1/teachers/:id',
    method: 'delete',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const idx = teachers.findIndex(t => t.id === id)
      if (idx === -1) return fail('教师不存在', 404)
      teachers.splice(idx, 1)
      return success(null, '删除成功')
    },
  },
] as MockMethod[]
