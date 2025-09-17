import request from '@/utils/request'
import type { LoginRequest, LoginResponse, User } from '@/types/user'
import type { ApiResponse } from '@/types'

// 用户登录API
export const loginApi = (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 获取用户信息API
export const getUserInfoApi = (): Promise<ApiResponse<User>> => {
  return request({
    url: '/auth/user-info',
    method: 'get'
  })
}

// 用户登出API
export const logoutApi = (): Promise<ApiResponse<null>> => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
