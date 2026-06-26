import { del, get, post, put } from '@/utils/request'
import type { ClassOption, Clazz, PageQuery, PageResult } from '@/types'

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

/** 获取班级下拉选项（前端从分页列表中提取） */
export async function getClassOptions(): Promise<ClassOption[]> {
  const page = await getClasses({ pageSize: 999 })
  return page.list.map(c => ({ id: c.id, name: c.name }))
}
