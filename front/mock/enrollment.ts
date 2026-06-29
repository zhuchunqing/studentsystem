import type { MockMethod } from 'vite-plugin-mock'
import { courseSelections, success, fail, nextId, paginate } from './data'

export default [
  {
    url: '/api/v1/course-selections',
    method: 'get',
    response: ({ query }: any) => {
      const { pageNum = 1, pageSize = 10, studentId, courseId } = query
      let list = [...courseSelections]
      if (studentId) list = list.filter(s => s.studentId === Number(studentId))
      if (courseId) list = list.filter(s => s.courseId === Number(courseId))
      return success(paginate(list, Number(pageNum), Number(pageSize)))
    },
  },
  {
    url: '/api/v1/courses/:courseId/selections',
    method: 'get',
    response: ({ url, query }: any) => {
      const match = url.match(/\/courses\/(\d+)\/selections/)
      const courseId = Number(match ? match[1] : query.courseId)
      const { pageNum = 1, pageSize = 10 } = query
      const list = courseSelections.filter(s => s.courseId === courseId)
      return success(paginate(list, Number(pageNum), Number(pageSize)))
    },
  },
  {
    url: '/api/v1/course-selections',
    method: 'post',
    response: ({ body }: any) => {
      const exists = courseSelections.find(s => s.studentId === body.studentId && s.courseId === body.courseId)
      if (exists) return fail('已选过该课程')
      const sel = {
        id: nextId(courseSelections),
        ...body,
        status: 1,
        selectedAt: '2025-06-29T10:00:00',
        droppedAt: null,
      }
      courseSelections.push(sel)
      return success(sel, '选课成功')
    },
  },
  {
    url: '/api/v1/course-selections/:id/drop',
    method: 'put',
    response: ({ query }: any) => {
      const id = Number(query.id)
      const idx = courseSelections.findIndex(s => s.id === id)
      if (idx === -1) return fail('选课记录不存在', 404)
      courseSelections[idx].status = 0
      courseSelections[idx].droppedAt = '2025-06-29T10:00:00'
      return success(null, '退课成功')
    },
  },
] as MockMethod[]
