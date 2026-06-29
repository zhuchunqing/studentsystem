import type { MockMethod } from 'vite-plugin-mock'
import { students, success, fail, nextId, paginate } from './data'

export default [
  {
    url: '/api/v1/students',
    method: 'get',
    response: ({ query }: any) => {
      const { pageNum = 1, pageSize = 10, name, studentNo, classId } = query
      let list = [...students]
      if (name) list = list.filter(s => s.name.includes(name))
      if (studentNo) list = list.filter(s => s.studentNo.includes(studentNo))
      if (classId) list = list.filter(s => s.classId === Number(classId))
      return success(paginate(list, Number(pageNum), Number(pageSize)))
    },
  },
  {
    url: '/api/v1/students/:id',
    method: 'get',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const s = students.find(s => s.id === id)
      return s ? success(s) : fail('学生不存在', 404)
    },
  },
  {
    url: '/api/v1/students',
    method: 'post',
    response: ({ body }: any) => {
      const s = { id: nextId(students), status: 1, ...body, createdAt: '2025-06-29T10:00:00', updatedAt: '2025-06-29T10:00:00' }
      students.push(s)
      return success(s, '创建成功')
    },
  },
  {
    url: '/api/v1/students/:id',
    method: 'put',
    response: ({ url, body }: any) => {
      const id = Number(url.split('/').pop())
      const idx = students.findIndex(s => s.id === id)
      if (idx === -1) return fail('学生不存在', 404)
      students[idx] = { ...students[idx], ...body, updatedAt: '2025-06-29T10:00:00' }
      return success(students[idx], '更新成功')
    },
  },
  {
    url: '/api/v1/students/:id',
    method: 'delete',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const idx = students.findIndex(s => s.id === id)
      if (idx === -1) return fail('学生不存在', 404)
      students.splice(idx, 1)
      return success(null, '删除成功')
    },
  },
  {
    url: '/api/v1/students/import',
    method: 'post',
    response: ({ body }: any) => {
      const list = Array.isArray(body) ? body : [body]
      const result: any[] = []
      for (const item of list) {
        const s = { id: nextId(students), status: 1, enrollmentDate: '2024-09-01', ...item, createdAt: '2025-06-29T10:00:00', updatedAt: '2025-06-29T10:00:00' }
        students.push(s)
        result.push(s)
      }
      return success(result, `成功导入 ${result.length} 名学生`)
    },
  },
] as MockMethod[]
