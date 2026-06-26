import { del, get, post, put } from '@/utils/request'
import type { PageQuery, PageResult, Teacher, TeacherOption } from '@/types'

export interface TeacherQuery extends PageQuery {
  name?: string
  employeeNo?: string
  departmentId?: number
}

export function getTeachers(params: TeacherQuery): Promise<PageResult<Teacher>> {
  return get<PageResult<Teacher>>('/teachers', { params })
}

export function getTeacher(id: number): Promise<Teacher> {
  return get<Teacher>(`/teachers/${id}`)
}

export function createTeacher(data: Partial<Teacher>): Promise<Teacher> {
  return post<Teacher>('/teachers', data)
}

export function updateTeacher(id: number, data: Partial<Teacher>): Promise<Teacher> {
  return put<Teacher>(`/teachers/${id}`, data)
}

export function deleteTeacher(id: number): Promise<void> {
  return del<void>(`/teachers/${id}`)
}

/** 获取教师下拉选项（前端从分页列表中提取） */
export async function getTeacherOptions(): Promise<TeacherOption[]> {
  const page = await getTeachers({ pageSize: 999 })
  return page.list.map(t => ({ id: t.id, name: t.name }))
}
