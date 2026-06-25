import { del, get, post, put } from '@/utils/request'
import type { ClassOption, Clazz, PageQuery, PageResult, Student } from '@/types'

export interface ClassQuery extends PageQuery {
  departmentId?: number
  grade?: string
}

export function getClasses(params: ClassQuery): Promise<PageResult<Clazz>> {
  return get<PageResult<Clazz>>('/classes', { params })
}

export function getClass(id: number): Promise<Clazz> {
  return get<Clazz>(`/classes/${id}`)
}

export function createClass(data: Partial<Clazz>): Promise<Clazz> {
  return post<Clazz>('/classes', data)
}

export function updateClass(id: number, data: Partial<Clazz>): Promise<Clazz> {
  return put<Clazz>(`/classes/${id}`, data)
}

export function deleteClass(id: number): Promise<void> {
  return del<void>(`/classes/${id}`)
}

export function getClassStudents(id: number): Promise<Student[]> {
  return get<Student[]>(`/classes/${id}/students`)
}

/** 下拉选项（前端用，复用列表接口） */
export function getClassOptions(): Promise<ClassOption[]> {
  return get<ClassOption[]>('/classes/options')
}
