// 通用类型定义

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginationQuery {
  page: number
  size: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  size: number
}

// 导出所有模块类型，避免命名冲突
export * from './user'
export * from './order'
export * from './equipment'
export * from './warehouse'
export * from './customer'
export type { 
  Employee as EmployeeDetail,
  Department,
  Position,
  Attendance,
  LeaveRequest,
  AttendanceStatus,
  LeaveType,
  LeaveStatus
} from './employee'
export type { 
  FinancialReport,
  Invoice,
  Payment,
  ReportType,
  InvoiceStatus,
  PaymentStatus as FinancialPaymentStatus,
  PaymentMethod
} from './financial'
