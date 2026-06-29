import type { MockMethod } from 'vite-plugin-mock'
import { courses, success, fail, nextId, paginate } from './data'

export default [
  {
    url: '/api/v1/courses',
    method: 'get',
    response: ({ query }: any) => {
      const { pageNum = 1, pageSize = 10, name, departmentId, courseType, semester } = query
      let list = [...courses]
      if (name) list = list.filter(c => c.name.includes(name))
      if (departmentId) list = list.filter(c => c.departmentId === Number(departmentId))
      if (courseType) list = list.filter(c => c.courseType === Number(courseType))
      if (semester) list = list.filter(c => c.semester === semester)
      return success(paginate(list, Number(pageNum), Number(pageSize)))
    },
  },
  {
    url: '/api/v1/courses/:id',
    method: 'get',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const c = courses.find(c => c.id === id)
      return c ? success(c) : fail('课程不存在', 404)
    },
  },
  {
    url: '/api/v1/courses',
    method: 'post',
    response: ({ body }: any) => {
      const c = { id: nextId(courses), status: 1, ...body, createdAt: '2025-06-29T10:00:00', updatedAt: '2025-06-29T10:00:00' }
      courses.push(c)
      return success(c, '创建成功')
    },
  },
  {
    url: '/api/v1/courses/:id',
    method: 'put',
    response: ({ url, body }: any) => {
      const id = Number(url.split('/').pop())
      const idx = courses.findIndex(c => c.id === id)
      if (idx === -1) return fail('课程不存在', 404)
      courses[idx] = { ...courses[idx], ...body, updatedAt: '2025-06-29T10:00:00' }
      return success(courses[idx], '更新成功')
    },
  },
  {
    url: '/api/v1/courses/:id',
    method: 'delete',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const idx = courses.findIndex(c => c.id === id)
      if (idx === -1) return fail('课程不存在', 404)
      courses.splice(idx, 1)
      return success(null, '删除成功')
    },
  },
] as MockMethod[]
