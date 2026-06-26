import { post, put } from '@/utils/request'
import type { ChangePasswordRequest, LoginRequest, LoginResult } from '@/types'

export function login(data: LoginRequest): Promise<LoginResult> {
  return post<LoginResult>('/auth/login', data)
}

export function logout(): Promise<void> {
  return post<void>('/auth/logout')
}

export function changePassword(data: ChangePasswordRequest): Promise<void> {
  // 后端使用 Query 参数接收 oldPassword / newPassword
  return put<void>('/auth/password', undefined, { params: data })
}
