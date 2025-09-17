/**
 * 仓库管理相关类型定义
 */

export interface Warehouse {
  id: string
  name: string
  address: string
  manager: string
  phone: string
  capacity: number
  currentStock: number
  status: WarehouseStatus
  area: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  equipmentId: string
  equipmentName: string
  equipmentModel: string
  warehouseId: string
  warehouseName: string
  quantity: number
  availableQuantity: number
  rentedQuantity: number
  maintenanceQuantity: number
  location: string
  lastCheckDate: string
  status: InventoryStatus
}

export interface StockMovement {
  id: string
  equipmentId: string
  equipmentName: string
  warehouseId: string
  warehouseName: string
  type: MovementType
  quantity: number
  beforeQuantity: number
  afterQuantity: number
  reason: string
  operator: string
  createdAt: string
}

export interface StockAlert {
  id: string
  equipmentId: string
  equipmentName: string
  warehouseId: string
  warehouseName: string
  alertType: AlertType
  currentQuantity: number
  threshold: number
  message: string
  isRead: boolean
  createdAt: string
}

export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export enum InventoryStatus {
  NORMAL = 'normal',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  EXCESS = 'excess'
}

export enum MovementType {
  IN = 'in',
  OUT = 'out',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  MAINTENANCE = 'maintenance',
  RETURN = 'return'
}

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  EXCESS_STOCK = 'excess_stock',
  EXPIRE_WARNING = 'expire_warning'
}
