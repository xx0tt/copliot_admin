// 用户相关类型定义

// 用户角色类型
export type UserRole = 'admin' | 'manager' | 'staff'

// 用户状态类型
export type UserStatus = 'active' | 'inactive' | 'suspended'

// 用户信息接口
export interface User {
  id: number                    // 用户唯一标识
  username: string             // 用户名
  email: string                // 邮箱
  role: UserRole              // 用户角色
  status: UserStatus          // 用户状态
  avatar?: string             // 头像URL
  phone?: string              // 手机号
  lastLoginTime?: string      // 最后登录时间
  createdAt: string           // 创建时间
  updatedAt: string           // 更新时间
}

// 员工信息接口（继承用户接口）
export interface Employee extends User {
  name: string                // 员工姓名
  position: string           // 职位
  department: string         // 部门
  salary?: number            // 薪资
  hireDate: string          // 入职日期
}

// 登录请求接口
export interface LoginRequest {
  username: string           // 用户名
  password: string          // 密码
  remember?: boolean        // 是否记住登录
}

// 登录响应接口
export interface LoginResponse {
  token: string             // 认证令牌
  user: User               // 用户信息
  expiresIn: number        // 令牌过期时间（秒）
}
