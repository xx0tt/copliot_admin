import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest } from '@/types/user'
import { loginApi, getUserInfoApi } from '@/api/auth'

// 定义认证状态管理
export const useAuthStore = defineStore('auth', () => {
  // 状态定义
  const token = ref<string>('')
  const userInfo = ref<User | null>(null)
  const loading = ref<boolean>(false)

  // 计算属性 - 是否已认证
  const isAuthenticated = computed(() => !!token.value)

  // 初始化 - 从本地存储恢复token
  const initAuth = () => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      token.value = savedToken
      // 获取用户信息
      getUserInfo()
    } else {
      // 临时：如果没有token，设置一个默认token用于测试
      console.log('设置临时认证状态用于测试')
      token.value = 'temp-token-for-testing'
      userInfo.value = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        avatar: '',
        phone: '13800138000',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('auth_token', token.value)
    }
  }

  // 登录方法
  const login = async (loginData: LoginRequest) => {
    try {
      loading.value = true
      
      // 模拟登录成功
      const mockResponse = {
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 1,
            username: loginData.username,
            email: 'admin@example.com',
            role: 'admin' as const,
            status: 'active' as const,
            avatar: '',
            phone: '13800138000',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          expiresIn: 3600
        }
      }
      
      // 保存token
      token.value = mockResponse.data.token
      localStorage.setItem('auth_token', mockResponse.data.token)
      
      // 保存用户信息
      userInfo.value = mockResponse.data.user
      
      return { success: true }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, message: '登录失败，请检查用户名和密码' }
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      // 模拟获取用户信息
      if (userInfo.value) return
      
      const mockUser: User = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        avatar: '',
        phone: '13800138000',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      userInfo.value = mockUser
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，清除认证状态
      logout()
    }
  }

  // 登出方法
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('auth_token')
  }

  // 初始化认证状态
  initAuth()

  return {
    // 状态
    token,
    userInfo,
    loading,
    // 计算属性
    isAuthenticated,
    // 方法
    login,
    logout,
    getUserInfo
  }
})
