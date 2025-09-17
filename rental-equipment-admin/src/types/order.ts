// 订单相关类型定义

// 订单状态枚举
export const OrderStatus = {
  PENDING: 'pending',
  ONGOING: 'ongoing', 
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus]

// 支付状态类型
export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | 'refunded'

// 订单类型枚举
export const OrderType = {
  SHORT_TERM: 'short_term',
  LONG_TERM: 'long_term', 
  MAINTENANCE: 'maintenance',
  TECHNICAL_SUPPORT: 'technical_support'
} as const

export type OrderTypeType = typeof OrderType[keyof typeof OrderType]

// 订单项接口
export interface OrderItem {
  id: string                   // 订单项ID
  orderId?: string             // 订单ID
  equipmentId: string          // 设备ID (改为字符串)
  equipmentName: string        // 设备名称
  equipmentModel?: string      // 设备型号
  quantity: number             // 数量
  unitPrice: number            // 单价
  subtotal: number             // 小计金额
  remark?: string              // 备注
}

// 订单接口
export interface Order {
  id: string                   // 订单ID
  orderNumber: string          // 订单编号
  customerName: string         // 客户姓名
  contactPerson?: string       // 联系人
  contactPhone?: string        // 联系电话
  contactEmail?: string        // 联系邮箱
  projectAddress?: string      // 项目地址
  type: OrderTypeType          // 订单类型
  status: OrderStatusType      // 订单状态
  startDate: string            // 开始日期
  endDate: string              // 结束日期
  rentalAmount?: number        // 租赁金额
  transportFee?: number        // 运输费用
  insuranceFee?: number        // 保险费用
  otherFee?: number            // 其他费用
  discountAmount?: number      // 折扣金额
  totalAmount: number          // 订单总金额
  createTime: string           // 创建时间
  updateTime?: string          // 更新时间
  items: OrderItem[]           // 订单项列表
  attachments?: any[]          // 附件列表
  remark?: string              // 备注
}

// 订单查询参数
export interface OrderQueryParams {
  keyword?: string            // 关键字搜索
  status?: OrderStatusType    // 订单状态
  type?: OrderTypeType        // 订单类型
  startDate?: string          // 开始日期
  endDate?: string            // 结束日期
  customerId?: number         // 客户ID
  page?: number               // 页码
  pageSize?: number           // 每页数量
}
