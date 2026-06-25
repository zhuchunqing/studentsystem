import { get, post, put } from '@/utils/request'
import type { CourseSelection, CourseSelectionRequest, PageQuery, PageResult } from '@/types'

export interface SelectionQuery extends PageQuery {
  studentId?: number
  courseId?: number
}

export function getCourseSelections(params: SelectionQuery): Promise<PageResult<CourseSelection>> {
  return get<PageResult<CourseSelection>>('/course-selections', { params })
}

export function getCourseStudents(courseId: number, params?: PageQuery): Promise<PageResult<CourseSelection>> {
  return get<PageResult<CourseSelection>>(`/courses/${courseId}/selections`, { params })
}

export function selectCourse(data: CourseSelectionRequest): Promise<CourseSelection> {
  return post<CourseSelection>('/course-selections', data)
}

export function dropCourse(id: number): Promise<void> {
  return put<void>(`/course-selections/${id}/drop`)
}
