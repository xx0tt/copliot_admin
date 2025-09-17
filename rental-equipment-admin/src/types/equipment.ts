// 设备相关类型定义

// 设备状态常量
export const EquipmentStatus = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  DAMAGED: 'damaged',
  RETIRED: 'retired'
} as const

// 设备状态类型
export type EquipmentStatusType = typeof EquipmentStatus[keyof typeof EquipmentStatus]

// 设备类别常量
export const EquipmentCategory = {
  EXCAVATOR: 'excavator',
  CRANE: 'crane',
  EARTHMOVING: 'earthmoving',
  COMPACTOR: 'compactor',
  CONCRETE: 'concrete',
  PILING: 'piling',
  OTHER: 'other'
} as const

// 设备类别类型
export type EquipmentCategoryType = typeof EquipmentCategory[keyof typeof EquipmentCategory]

// 设备接口
export interface Equipment {
  id: number                         // 设备ID
  name: string                      // 设备名称
  model: string                     // 设备型号
  brand: string                     // 品牌
  category: EquipmentCategoryType   // 设备类别
  status: EquipmentStatusType       // 设备状态
  dailyRentalPrice: number          // 日租金
  originalPrice: number             // 原价
  currentValue: number              // 当前价值
  purchaseDate: string              // 购买日期
  warrantyExpiry?: string           // 保修到期日期
  description?: string              // 设备描述
  specifications?: string           // 规格参数
  images?: string[]                 // 设备图片
  serialNumber?: string             // 序列号
  qrCode?: string                  // 二维码
  location?: string                // 存放位置
  lastMaintenanceDate?: string     // 最后维护日期
  nextMaintenanceDate?: string     // 下次维护日期
  totalRentalDays?: number         // 总租赁天数
  totalRevenue?: number            // 总收入
  createdAt: string                // 创建时间
  updatedAt: string                // 更新时间
}

// 设备维护记录接口
export interface MaintenanceRecord {
  id: number                  // 维护记录ID
  equipmentId: number        // 设备ID
  type: 'routine' | 'repair' | 'upgrade' // 维护类型
  description: string        // 维护描述
  cost: number              // 维护费用
  performedBy: string       // 执行人
  performedAt: string       // 执行时间
  nextMaintenanceDate?: string // 下次维护日期
}
