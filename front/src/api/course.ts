import { del, get, post, put } from '@/utils/request'
import type { Course, CourseOption, PageQuery, PageResult } from '@/types'

export interface CourseQuery extends PageQuery {
  name?: string
  departmentId?: number
  courseType?: number
  semester?: string
}

export function getCourses(params: CourseQuery): Promise<PageResult<Course>> {
  return get<PageResult<Course>>('/courses', { params })
}

export function getCourse(id: number): Promise<Course> {
  return get<Course>(`/courses/${id}`)
}

export function createCourse(data: Partial<Course>): Promise<Course> {
  return post<Course>('/courses', data)
}

export function updateCourse(id: number, data: Partial<Course>): Promise<Course> {
  return put<Course>(`/courses/${id}`, data)
}

export function deleteCourse(id: number): Promise<void> {
  return del<void>(`/courses/${id}`)
}

export function getCourseOptions(): Promise<CourseOption[]> {
  return get<CourseOption[]>('/courses/options')
}
