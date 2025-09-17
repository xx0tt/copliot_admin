import request from '@/utils/request'
import type { ApiResponse, PaginationQuery, PaginationResponse } from '@/types'
import type { Customer, ServiceTicket, TicketResponse, CustomerStats } from '@/types/customer'

/**
 * 客户服务管理 API
 */

// 获取客户列表
export const getCustomers = (params?: PaginationQuery & {
  name?: string
  phone?: string
  customerType?: string
  level?: string
  status?: string
}): Promise<ApiResponse<PaginationResponse<Customer>>> => {
  return request.get('/customers', { params })
}

// 获取客户详情
export const getCustomer = (id: string): Promise<ApiResponse<Customer>> => {
  return request.get(`/customers/${id}`)
}

// 创建客户
export const createCustomer = (data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
  return request.post('/customers', data)
}

// 更新客户
export const updateCustomer = (id: string, data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
  return request.put(`/customers/${id}`, data)
}

// 删除客户
export const deleteCustomer = (id: string): Promise<ApiResponse<null>> => {
  return request.delete(`/customers/${id}`)
}

// 获取客户订单历史
export const getCustomerOrders = (customerId: string, params?: PaginationQuery): Promise<ApiResponse<PaginationResponse<any>>> => {
  return request.get(`/customers/${customerId}/orders`, { params })
}

// 获取服务工单列表
export const getServiceTickets = (params?: PaginationQuery & {
  customerId?: string
  type?: string
  priority?: string
  status?: string
  assigneeId?: string
}): Promise<ApiResponse<PaginationResponse<ServiceTicket>>> => {
  return request.get('/service-tickets', { params })
}

// 获取工单详情
export const getServiceTicket = (id: string): Promise<ApiResponse<ServiceTicket>> => {
  return request.get(`/service-tickets/${id}`)
}

// 创建工单
export const createServiceTicket = (data: Partial<ServiceTicket>): Promise<ApiResponse<ServiceTicket>> => {
  return request.post('/service-tickets', data)
}

// 更新工单
export const updateServiceTicket = (id: string, data: Partial<ServiceTicket>): Promise<ApiResponse<ServiceTicket>> => {
  return request.put(`/service-tickets/${id}`, data)
}

// 分配工单
export const assignTicket = (id: string, assigneeId: string): Promise<ApiResponse<null>> => {
  return request.patch(`/service-tickets/${id}/assign`, { assigneeId })
}

// 添加工单回复
export const addTicketResponse = (ticketId: string, data: Partial<TicketResponse>): Promise<ApiResponse<TicketResponse>> => {
  return request.post(`/service-tickets/${ticketId}/responses`, data)
}

// 关闭工单
export const closeTicket = (id: string): Promise<ApiResponse<null>> => {
  return request.patch(`/service-tickets/${id}/close`)
}

// 获取客户服务统计
export const getCustomerStats = (): Promise<ApiResponse<CustomerStats>> => {
  return request.get('/customer-stats')
}

// 上传附件
export const uploadAttachment = (file: File): Promise<ApiResponse<{ url: string; id: string }>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/attachments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
