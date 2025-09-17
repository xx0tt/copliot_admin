import request from '@/utils/request'
import type { ApiResponse, PaginationQuery, PaginationResponse } from '@/types'
import type { 
  Employee, Department, Position, Attendance, LeaveRequest, PerformanceReview 
} from '@/types/employee'

/**
 * 员工管理 API
 */

// 员工管理
export const getEmployees = (params?: PaginationQuery & {
  name?: string
  department?: string
  position?: string
  role?: string
  status?: string
}): Promise<ApiResponse<PaginationResponse<Employee>>> => {
  return request.get('/employees', { params })
}

export const getEmployee = (id: string): Promise<ApiResponse<Employee>> => {
  return request.get(`/employees/${id}`)
}

export const createEmployee = (data: Partial<Employee>): Promise<ApiResponse<Employee>> => {
  return request.post('/employees', data)
}

export const updateEmployee = (id: string, data: Partial<Employee>): Promise<ApiResponse<Employee>> => {
  return request.put(`/employees/${id}`, data)
}

export const deleteEmployee = (id: string): Promise<ApiResponse<null>> => {
  return request.delete(`/employees/${id}`)
}

export const resetEmployeePassword = (id: string): Promise<ApiResponse<{ password: string }>> => {
  return request.patch(`/employees/${id}/reset-password`)
}

// 部门管理
export const getDepartments = (): Promise<ApiResponse<Department[]>> => {
  return request.get('/departments')
}

export const createDepartment = (data: Partial<Department>): Promise<ApiResponse<Department>> => {
  return request.post('/departments', data)
}

export const updateDepartment = (id: string, data: Partial<Department>): Promise<ApiResponse<Department>> => {
  return request.put(`/departments/${id}`, data)
}

export const deleteDepartment = (id: string): Promise<ApiResponse<null>> => {
  return request.delete(`/departments/${id}`)
}

// 职位管理
export const getPositions = (departmentId?: string): Promise<ApiResponse<Position[]>> => {
  return request.get('/positions', { params: { departmentId } })
}

export const createPosition = (data: Partial<Position>): Promise<ApiResponse<Position>> => {
  return request.post('/positions', data)
}

export const updatePosition = (id: string, data: Partial<Position>): Promise<ApiResponse<Position>> => {
  return request.put(`/positions/${id}`, data)
}

export const deletePosition = (id: string): Promise<ApiResponse<null>> => {
  return request.delete(`/positions/${id}`)
}

// 考勤管理
export const getAttendance = (params?: PaginationQuery & {
  employeeId?: string
  department?: string
  startDate?: string
  endDate?: string
  status?: string
}): Promise<ApiResponse<PaginationResponse<Attendance>>> => {
  return request.get('/attendance', { params })
}

export const recordAttendance = (data: {
  employeeId: string
  type: 'check_in' | 'check_out'
  time: string
}): Promise<ApiResponse<Attendance>> => {
  return request.post('/attendance/record', data)
}

export const updateAttendance = (id: string, data: Partial<Attendance>): Promise<ApiResponse<Attendance>> => {
  return request.put(`/attendance/${id}`, data)
}

// 请假管理
export const getLeaveRequests = (params?: PaginationQuery & {
  employeeId?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<PaginationResponse<LeaveRequest>>> => {
  return request.get('/leave-requests', { params })
}

export const createLeaveRequest = (data: Partial<LeaveRequest>): Promise<ApiResponse<LeaveRequest>> => {
  return request.post('/leave-requests', data)
}

export const approveLeaveRequest = (id: string, approved: boolean, remarks?: string): Promise<ApiResponse<null>> => {
  return request.patch(`/leave-requests/${id}/approve`, { approved, remarks })
}

// 绩效管理
export const getPerformanceReviews = (params?: PaginationQuery & {
  employeeId?: string
  reviewPeriod?: string
  status?: string
}): Promise<ApiResponse<PaginationResponse<PerformanceReview>>> => {
  return request.get('/performance-reviews', { params })
}

export const createPerformanceReview = (data: Partial<PerformanceReview>): Promise<ApiResponse<PerformanceReview>> => {
  return request.post('/performance-reviews', data)
}

export const updatePerformanceReview = (id: string, data: Partial<PerformanceReview>): Promise<ApiResponse<PerformanceReview>> => {
  return request.put(`/performance-reviews/${id}`, data)
}

// 员工统计
export const getEmployeeStats = (): Promise<ApiResponse<{
  totalEmployees: number
  activeEmployees: number
  newHires: number
  departures: number
  attendanceRate: number
  avgPerformanceScore: number
}>> => {
  return request.get('/employee-stats')
}
