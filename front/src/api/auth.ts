import { post, put } from '@/utils/request'
import type { ChangePasswordRequest, LoginRequest, LoginResult } from '@/types'

export function login(data: LoginRequest): Promise<LoginResult> {
  return post<LoginResult>('/auth/login', data)
}

export function logout(): Promise<void> {
  return post<void>('/auth/logout')
}

export function changePassword(data: ChangePasswordRequest): Promise<void> {
  return put<void>('/auth/password', data)
}
