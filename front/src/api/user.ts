import { del, get, post, put } from '@/utils/request'
import type { PageQuery, PageResult, SysUser } from '@/types'

export interface UserQuery extends PageQuery {
  username?: string
  role?: string
  status?: number
}

/**
 * 用户管理接口。
 * 注意：后端暂无 UserController，以下接口待后端补充后即可对接。
 */
export function getUsers(params: UserQuery): Promise<PageResult<SysUser>> {
  return get<PageResult<SysUser>>('/users', { params })
}

export function getUser(id: number): Promise<SysUser> {
  return get<SysUser>(`/users/${id}`)
}

export function createUser(data: { username: string; password: string; role: string; status: number }): Promise<SysUser> {
  return post<SysUser>('/users', data)
}

export function updateUser(id: number, data: Partial<SysUser>): Promise<SysUser> {
  return put<SysUser>(`/users/${id}`, data)
}

export function deleteUser(id: number): Promise<void> {
  return del<void>(`/users/${id}`)
}

export function resetPassword(id: number): Promise<void> {
  return put<void>(`/users/${id}/reset-password`)
}

export function toggleUserStatus(id: number, status: number): Promise<SysUser> {
  return put<SysUser>(`/users/${id}/status`, { status })
}
