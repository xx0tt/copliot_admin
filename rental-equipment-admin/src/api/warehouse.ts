import request from '@/utils/request'
import type { ApiResponse, PaginationQuery, PaginationResponse } from '@/types'
import type { Warehouse, InventoryItem, StockMovement, StockAlert } from '@/types/warehouse'

/**
 * 仓库管理 API
 */

// 获取仓库列表
export const getWarehouses = (params?: PaginationQuery): Promise<ApiResponse<PaginationResponse<Warehouse>>> => {
  return request.get('/warehouses', { params })
}

// 获取仓库详情
export const getWarehouse = (id: string): Promise<ApiResponse<Warehouse>> => {
  return request.get(`/warehouses/${id}`)
}

// 创建仓库
export const createWarehouse = (data: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> => {
  return request.post('/warehouses', data)
}

// 更新仓库
export const updateWarehouse = (id: string, data: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> => {
  return request.put(`/warehouses/${id}`, data)
}

// 删除仓库
export const deleteWarehouse = (id: string): Promise<ApiResponse<null>> => {
  return request.delete(`/warehouses/${id}`)
}

// 获取库存列表
export const getInventory = (params?: PaginationQuery & {
  warehouseId?: string
  equipmentId?: string
  status?: string
}): Promise<ApiResponse<PaginationResponse<InventoryItem>>> => {
  return request.get('/inventory', { params })
}

// 获取库存移动记录
export const getStockMovements = (params?: PaginationQuery & {
  warehouseId?: string
  equipmentId?: string
  type?: string
}): Promise<ApiResponse<PaginationResponse<StockMovement>>> => {
  return request.get('/stock-movements', { params })
}

// 创建库存移动记录
export const createStockMovement = (data: Partial<StockMovement>): Promise<ApiResponse<StockMovement>> => {
  return request.post('/stock-movements', data)
}

// 获取库存预警
export const getStockAlerts = (params?: PaginationQuery & {
  warehouseId?: string
  alertType?: string
  isRead?: boolean
}): Promise<ApiResponse<PaginationResponse<StockAlert>>> => {
  return request.get('/stock-alerts', { params })
}

// 标记预警为已读
export const markAlertAsRead = (id: string): Promise<ApiResponse<null>> => {
  return request.patch(`/stock-alerts/${id}/read`)
}

// 库存盘点
export const stockTaking = (data: {
  warehouseId: string
  items: Array<{
    equipmentId: string
    actualQuantity: number
  }>
}): Promise<ApiResponse<null>> => {
  return request.post('/stock-taking', data)
}

// 库存转移
export const transferStock = (data: {
  equipmentId: string
  fromWarehouseId: string
  toWarehouseId: string
  quantity: number
  reason: string
}): Promise<ApiResponse<null>> => {
  return request.post('/stock-transfer', data)
}
