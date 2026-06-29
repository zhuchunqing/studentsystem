import type { MockMethod } from 'vite-plugin-mock'
import { scores, students, courses, success, fail, nextId, paginate } from './data'

function buildScoreResponse(s: any) {
  const student = students.find(st => st.id === s.studentId)
  const course = courses.find(c => c.id === s.courseId)
  return {
    scoreId: s.id,
    studentName: student?.name ?? null,
    studentNo: student?.studentNo ?? null,
    courseName: course?.name ?? null,
    courseCode: course?.code ?? null,
    scoreValue: s.scoreValue,
    gradeLevel: s.gradeLevel,
    semester: s.semester,
    scoreType: s.scoreType,
    isPassed: s.isPassed === 1,
  }
}

export default [
  {
    url: '/api/v1/scores',
    method: 'get',
    response: ({ query }: any) => {
      const { pageNum = 1, pageSize = 10, studentId, courseId, classId, semester } = query
      let list = [...scores]
      if (studentId) list = list.filter(s => s.studentId === Number(studentId))
      if (courseId) list = list.filter(s => s.courseId === Number(courseId))
      if (semester) list = list.filter(s => s.semester === semester)
      if (classId) {
        const classStudentIds = students.filter(s => s.classId === Number(classId)).map(s => s.id)
        list = list.filter(s => classStudentIds.includes(s.studentId))
      }
      const paged = paginate(list, Number(pageNum), Number(pageSize))
      return success({ ...paged, list: paged.list.map(buildScoreResponse) })
    },
  },
  {
    url: '/api/v1/scores/statistics',
    method: 'get',
    response: ({ query }: any) => {
      const { courseId, classId } = query
      let list = [...scores]
      if (courseId) list = list.filter(s => s.courseId === Number(courseId))
      if (classId) {
        const classStudentIds = students.filter(s => s.classId === Number(classId)).map(s => s.id)
        list = list.filter(s => classStudentIds.includes(s.studentId))
      }
      const vals = list.map(s => s.scoreValue).filter((v: number | null) => v !== null) as number[]
      const passed = list.filter(s => s.isPassed === 1).length
      const totalStudents = new Set(list.map(s => s.studentId)).size
      return success({
        totalStudents,
        averageScore: vals.length ? +(vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(2) : 0,
        maxScore: vals.length ? Math.max(...vals) : 0,
        minScore: vals.length ? Math.min(...vals) : 0,
        passRate: list.length ? +(passed / list.length).toFixed(4) : 0,
        gradeDistribution: {
          A: list.filter(s => s.gradeLevel === 'A').length,
          B: list.filter(s => s.gradeLevel === 'B').length,
          C: list.filter(s => s.gradeLevel === 'C').length,
          D: list.filter(s => s.gradeLevel === 'D').length,
          F: list.filter(s => s.gradeLevel === 'F').length,
        },
      })
    },
  },
  {
    url: '/api/v1/scores/:id',
    method: 'get',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop())
      const s = scores.find(s => s.id === id)
      return s ? success(buildScoreResponse(s)) : fail('成绩不存在', 404)
    },
  },
  {
    url: '/api/v1/scores',
    method: 'post',
    response: ({ body }: any) => {
      const s = { id: nextId(scores), ...body, createdAt: '2025-06-29T10:00:00', updatedAt: '2025-06-29T10:00:00' }
      scores.push(s)
      return success(s)
    },
  },
  {
    url: '/api/v1/scores/batch',
    method: 'post',
    response: ({ body }: any) => {
      const { courseId, semester, scoreType, records } = body
      for (const rec of records) {
        const existing = scores.find(s => s.studentId === rec.studentId && s.courseId === courseId && s.semester === semester)
        if (existing) {
          existing.scoreValue = rec.scoreValue
          existing.updatedAt = '2025-06-29T10:00:00'
        } else {
          scores.push({
            id: nextId(scores),
            studentId: rec.studentId,
            courseId,
            semester,
            scoreType,
            scoreValue: rec.scoreValue,
            gradeLevel: 'B',
            isPassed: rec.scoreValue >= 60 ? 1 : 0,
            remark: '',
            createdAt: '2025-06-29T10:00:00',
            updatedAt: '2025-06-29T10:00:00',
          })
        }
      }
      return success(null, '批量录入成功')
    },
  },
  {
    url: '/api/v1/scores/:id',
    method: 'put',
    response: ({ query, body }: any) => {
      const id = Number(query.id)
      const idx = scores.findIndex(s => s.id === id)
      if (idx === -1) return fail('成绩不存在', 404)
      scores[idx] = { ...scores[idx], ...body, updatedAt: '2025-06-29T10:00:00' }
      return success(scores[idx], '更新成功')
    },
  },
  {
    url: '/api/v1/scores/:id/audit',
    method: 'put',
    response: ({ url, query }: any) => {
      const id = Number(query.id)
      const s = scores.find(s => s.id === id)
      if (!s) return fail('成绩不存在', 404)
      const searchParams = new URL(url, 'http://localhost').searchParams
      const approved = searchParams.get('approved') === 'true'
      s.auditStatus = approved ? 'approved' : 'rejected'
      return success(s, '审核完成')
    },
  },
] as MockMethod[]
