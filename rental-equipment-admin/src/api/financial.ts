import request from '@/utils/request'
import type { ApiResponse, PaginationQuery, PaginationResponse } from '@/types'
import type { FinancialReport, Invoice, Payment, ReportType, ReportPeriod } from '@/types/financial'

/**
 * 财务管理 API
 */

// 财务报告
export const getFinancialReports = (params?: PaginationQuery & {
  type?: ReportType
  period?: ReportPeriod
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<PaginationResponse<FinancialReport>>> => {
  return request.get('/financial-reports', { params })
}

export const getFinancialReport = (id: string): Promise<ApiResponse<FinancialReport>> => {
  return request.get(`/financial-reports/${id}`)
}

export const generateFinancialReport = (data: {
  name: string
  type: ReportType
  period: ReportPeriod
  startDate: string
  endDate: string
}): Promise<ApiResponse<FinancialReport>> => {
  return request.post('/financial-reports/generate', data)
}

export const deleteFinancialReport = (id: string): Promise<ApiResponse<null>> => {
  return request.delete(`/financial-reports/${id}`)
}

// 收入分析
export const getRevenueAnalysis = (params: {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month' | 'quarter'
}): Promise<ApiResponse<any>> => {
  return request.get('/financial/revenue-analysis', { params })
}

// 支出分析
export const getExpenseAnalysis = (params: {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month' | 'quarter'
}): Promise<ApiResponse<any>> => {
  return request.get('/financial/expense-analysis', { params })
}

// 利润分析
export const getProfitAnalysis = (params: {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month' | 'quarter'
}): Promise<ApiResponse<any>> => {
  return request.get('/financial/profit-analysis', { params })
}

// 现金流分析
export const getCashFlowAnalysis = (params: {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month' | 'quarter'
}): Promise<ApiResponse<any>> => {
  return request.get('/financial/cash-flow-analysis', { params })
}

// 发票管理
export const getInvoices = (params?: PaginationQuery & {
  customerId?: string
  status?: string
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<PaginationResponse<Invoice>>> => {
  return request.get('/invoices', { params })
}

export const getInvoice = (id: string): Promise<ApiResponse<Invoice>> => {
  return request.get(`/invoices/${id}`)
}

export const createInvoice = (data: Partial<Invoice>): Promise<ApiResponse<Invoice>> => {
  return request.post('/invoices', data)
}

export const updateInvoice = (id: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>> => {
  return request.put(`/invoices/${id}`, data)
}

export const sendInvoice = (id: string): Promise<ApiResponse<null>> => {
  return request.patch(`/invoices/${id}/send`)
}

export const cancelInvoice = (id: string): Promise<ApiResponse<null>> => {
  return request.patch(`/invoices/${id}/cancel`)
}

// 付款管理
export const getPayments = (params?: PaginationQuery & {
  customerId?: string
  method?: string
  status?: string
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<PaginationResponse<Payment>>> => {
  return request.get('/payments', { params })
}

export const getPayment = (id: string): Promise<ApiResponse<Payment>> => {
  return request.get(`/payments/${id}`)
}

export const createPayment = (data: Partial<Payment>): Promise<ApiResponse<Payment>> => {
  return request.post('/payments', data)
}

export const updatePayment = (id: string, data: Partial<Payment>): Promise<ApiResponse<Payment>> => {
  return request.put(`/payments/${id}`, data)
}

export const processPayment = (id: string): Promise<ApiResponse<null>> => {
  return request.patch(`/payments/${id}/process`)
}

export const refundPayment = (id: string, amount?: number): Promise<ApiResponse<null>> => {
  return request.patch(`/payments/${id}/refund`, { amount })
}

// 应收账款
export const getReceivables = (params?: PaginationQuery & {
  customerId?: string
  overdue?: boolean
  ageRange?: string
}): Promise<ApiResponse<PaginationResponse<any>>> => {
  return request.get('/receivables', { params })
}

// 应付账款
export const getPayables = (params?: PaginationQuery & {
  supplierId?: string
  overdue?: boolean
  ageRange?: string
}): Promise<ApiResponse<PaginationResponse<any>>> => {
  return request.get('/payables', { params })
}

// 财务统计
export const getFinancialStats = (params?: {
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<{
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  totalReceivables: number
  overdueReceivables: number
  totalInvoices: number
  paidInvoices: number
  pendingPayments: number
  completedPayments: number
}>> => {
  return request.get('/financial-stats', { params })
}

// 导出报告
export const exportReport = (reportId: string, format: 'pdf' | 'excel'): Promise<Blob> => {
  return request.get(`/financial-reports/${reportId}/export`, {
    params: { format },
    responseType: 'blob'
  })
}
