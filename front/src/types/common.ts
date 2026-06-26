/** 后端统一响应封装 Result<T> */
export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页查询结果 */
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  totalPages: number
}

/** 分页查询参数 */
export interface PageQuery {
  pageNum?: number
  pageSize?: number
}

/** 登录请求 */
export interface LoginRequest {
  username: string
  password: string
}

/** 登录响应 */
export interface LoginResult {
  token: string
  role: string
  username: string
  expiresIn: number
}

/** 修改密码请求（后端使用 Query 参数） */
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}
