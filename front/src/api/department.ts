import { del, get, post, put } from '@/utils/request'
import type { Department, DepartmentOption, DepartmentTree } from '@/types'

export function getDepartments(): Promise<DepartmentTree[]> {
  return get<DepartmentTree[]>('/departments')
}

export function getDepartment(id: number): Promise<Department> {
  return get<Department>(`/departments/${id}`)
}

export function createDepartment(data: Partial<Department>): Promise<Department> {
  return post<Department>('/departments', data)
}

export function updateDepartment(id: number, data: Partial<Department>): Promise<Department> {
  return put<Department>(`/departments/${id}`, data)
}

export function deleteDepartment(id: number): Promise<void> {
  return del<void>(`/departments/${id}`)
}

export function getDepartmentOptions(): Promise<DepartmentOption[]> {
  return get<DepartmentOption[]>('/departments/options')
}
