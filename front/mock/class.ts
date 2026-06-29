import type { MockMethod } from 'vite-plugin-mock'
import { classes, success, fail, nextId, paginate } from './data'

export default [
  {
    url: '/api/v1/classes',
    method: 'get',
    response: ({ query }: any) => {
      const { pageNum = 1, pageSize = 10, departmentId, grade } = query
      let list = [...classes]
      if (departmentId) list = list.filter(c => c.departmentId === Number(departmentId))
      if (grade) list = list.filter(c => c.grade === grade)
      return success(paginate(list, Number(pageNum), Number(pageSize)))
    },
  },
  {
    url: '/api/v1/classes/:id',
    method: 'get',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const cls = classes.find(c => c.id === id)
      return cls ? success(cls) : fail('班级不存在', 404)
    },
  },
  {
    url: '/api/v1/classes',
    method: 'post',
    response: ({ body }: any) => {
      const cls = { id: nextId(classes), studentCount: 0, ...body, createdAt: '2025-06-29T10:00:00', updatedAt: '2025-06-29T10:00:00' }
      classes.push(cls)
      return success(cls, '创建成功')
    },
  },
  {
    url: '/api/v1/classes/:id',
    method: 'put',
    response: ({ url, body }: any) => {
      const id = Number(url.split('/').pop())
      const idx = classes.findIndex(c => c.id === id)
      if (idx === -1) return fail('班级不存在', 404)
      classes[idx] = { ...classes[idx], ...body, updatedAt: '2025-06-29T10:00:00' }
      return success(classes[idx], '更新成功')
    },
  },
  {
    url: '/api/v1/classes/:id',
    method: 'delete',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const idx = classes.findIndex(c => c.id === id)
      if (idx === -1) return fail('班级不存在', 404)
      classes.splice(idx, 1)
      return success(null, '删除成功')
    },
  },
] as MockMethod[]
