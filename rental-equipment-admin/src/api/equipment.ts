import request from '@/utils/request'
import type { Equipment, MaintenanceRecord } from '@/types/equipment'
import type { ApiResponse, PaginationResponse } from '@/types'

// 获取设备列表
export const fetchEquipmentApi = (page: number = 1): Promise<PaginationResponse<Equipment>> => {
  return request({
    url: '/equipment',
    method: 'get',
    params: { page }
  })
}

// 获取单个设备详情
export const getEquipmentDetailApi = (id: number): Promise<ApiResponse<Equipment>> => {
  return request({
    url: `/equipment/${id}`,
    method: 'get'
  })
}

// 创建新设备
export const createEquipmentApi = (data: Partial<Equipment>): Promise<ApiResponse<Equipment>> => {
  return request({
    url: '/equipment',
    method: 'post',
    data
  })
}

// 更新设备信息
export const updateEquipmentApi = (id: number, data: Partial<Equipment>): Promise<ApiResponse<Equipment>> => {
  return request({
    url: `/equipment/${id}`,
    method: 'put',
    data
  })
}

// 删除设备
export const deleteEquipmentApi = (id: number): Promise<ApiResponse<null>> => {
  return request({
    url: `/equipment/${id}`,
    method: 'delete'
  })
}

// 获取设备维护记录
export const getMaintenanceRecordsApi = (equipmentId: number): Promise<ApiResponse<MaintenanceRecord[]>> => {
  return request({
    url: `/equipment/${equipmentId}/maintenance`,
    method: 'get'
  })
}
