import { del, get, post, put } from '@/utils/request'
import type { Department, DepartmentOption, DepartmentTreeResponse } from '@/types'

/** 获取院系树形列表 */
export function getDepartments(): Promise<DepartmentTreeResponse[]> {
  return get<DepartmentTreeResponse[]>('/departments')
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

/** 扁平化院系树，提取下拉选项 */
function flattenTree(nodes: DepartmentTreeResponse[], result: DepartmentOption[] = []): DepartmentOption[] {
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name })
    if (node.children?.length) {
      flattenTree(node.children, result)
    }
  }
  return result
}

/** 获取院系下拉选项（前端从树形数据中提取） */
export async function getDepartmentOptions(): Promise<DepartmentOption[]> {
  const tree = await getDepartments()
  return flattenTree(tree)
}
