import { del, get, post, put } from '@/utils/request'
import type { PageQuery, PageResult, Student, StudentOption } from '@/types'

export interface StudentQuery extends PageQuery {
  name?: string
  studentNo?: string
  classId?: number
}

export function getStudents(params: StudentQuery): Promise<PageResult<Student>> {
  return get<PageResult<Student>>('/students', { params })
}

export function getStudent(id: number): Promise<Student> {
  return get<Student>(`/students/${id}`)
}

export function createStudent(data: Partial<Student>): Promise<Student> {
  return post<Student>('/students', data)
}

export function updateStudent(id: number, data: Partial<Student>): Promise<Student> {
  return put<Student>(`/students/${id}`, data)
}

export function deleteStudent(id: number): Promise<void> {
  return del<void>(`/students/${id}`)
}

export function importStudents(data: Partial<Student>[]): Promise<Student[]> {
  return post<Student[]>('/students/import', data)
}

export function getStudentOptions(): Promise<StudentOption[]> {
  return get<StudentOption[]>('/students/options')
}
