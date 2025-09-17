/**
 * 员工管理相关类型定义
 */

export interface Employee {
  id: string
  employeeNumber: string
  name: string
  username: string
  email: string
  phone: string
  department: string
  position: string
  role: EmployeeRole
  status: EmployeeStatus
  avatar?: string
  hireDate: string
  salary?: number
  permissions: string[]
  supervisor?: string
  subordinates: string[]
  workLocation: string
  emergencyContact: EmergencyContact
  createdAt: string
  updatedAt: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface Department {
  id: string
  name: string
  description?: string
  managerId: string
  managerName: string
  employeeCount: number
  parentId?: string
  level: number
  createdAt: string
}

export interface Position {
  id: string
  name: string
  departmentId: string
  description?: string
  requirements: string[]
  responsibilities: string[]
  salaryRange: {
    min: number
    max: number
  }
  level: number
  createdAt: string
}

export interface Attendance {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  workHours: number
  status: AttendanceStatus
  overtimeHours: number
  lateMinutes: number
  earlyLeaveMinutes: number
  remarks?: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  reason: string
  status: LeaveStatus
  approverId?: string
  approverName?: string
  approvedAt?: string
  remarks?: string
  createdAt: string
}

export interface PerformanceReview {
  id: string
  employeeId: string
  employeeName: string
  reviewPeriod: string
  reviewerId: string
  reviewerName: string
  score: number
  goals: PerformanceGoal[]
  feedback: string
  improvementPlan?: string
  status: ReviewStatus
  createdAt: string
  updatedAt: string
}

export interface PerformanceGoal {
  id: string
  title: string
  description: string
  weight: number
  targetValue: string
  actualValue?: string
  score: number
  completed: boolean
}

export enum EmployeeRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  EMPLOYEE = 'employee',
  INTERN = 'intern'
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated'
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EARLY_LEAVE = 'early_leave',
  HOLIDAY = 'holiday',
  SICK_LEAVE = 'sick_leave',
  VACATION = 'vacation'
}

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  EMERGENCY = 'emergency'
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum ReviewStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  APPROVED = 'approved'
}
