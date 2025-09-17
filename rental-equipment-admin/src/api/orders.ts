import { OrderStatus, OrderType } from '@/types/order'
import type { Order, OrderQueryParams } from '@/types/order'
import type { ApiResponse, PaginationResponse } from '@/types'

// 获取订单列表
export const getOrders = async (params: OrderQueryParams): Promise<ApiResponse<PaginationResponse<Order>>> => {
  // 模拟API响应
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD20240101001',
          customerName: '张三建设集团',
          contactPerson: '张经理',
          contactPhone: '13800138000',
          contactEmail: 'zhang@example.com',
          projectAddress: '北京市朝阳区某某工程项目现场',
          type: OrderType.LONG_TERM,
          status: OrderStatus.ONGOING,
          startDate: '2024-01-02',
          endDate: '2024-03-02',
          rentalAmount: 180000,
          transportFee: 5000,
          insuranceFee: 3000,
          otherFee: 2000,
          discountAmount: 5000,
          totalAmount: 185000,
          createTime: '2024-01-01 09:30:00',
          updateTime: '2024-01-02 08:30:00',
          items: [
            {
              id: '1',
              orderId: '1',
              equipmentId: 'EQ001',
              equipmentName: '挖掘机CAT320D',
              equipmentModel: 'CAT320D',
              quantity: 2,
              unitPrice: 1500,
              subtotal: 180000,
              remark: '需要专业操作员'
            }
          ],
          attachments: [
            {
              id: '1',
              name: '租赁合同.pdf',
              size: 2048576,
              url: '/files/contract.pdf'
            }
          ],
          remark: '请确保设备按时到达现场，并提供专业操作培训。'
        },
        {
          id: '2',
          orderNumber: 'ORD20240101002',
          customerName: '李四工程公司',
          contactPerson: '李总',
          contactPhone: '13900139000',
          contactEmail: 'li@example.com',
          projectAddress: '上海市浦东新区建设工地',
          type: OrderType.SHORT_TERM,
          status: OrderStatus.PENDING,
          startDate: '2024-01-05',
          endDate: '2024-01-15',
          rentalAmount: 25000,
          transportFee: 2000,
          insuranceFee: 1000,
          otherFee: 500,
          discountAmount: 1000,
          totalAmount: 27500,
          createTime: '2024-01-01 14:20:00',
          updateTime: '2024-01-01 14:20:00',
          items: [
            {
              id: '2',
              orderId: '2',
              equipmentId: 'EQ002',
              equipmentName: '起重机QTZ63',
              equipmentModel: 'QTZ63',
              quantity: 1,
              unitPrice: 2500,
              subtotal: 25000,
              remark: '需要高级操作证书'
            }
          ],
          attachments: [],
          remark: '紧急项目，需要尽快安排。'
        }
      ]

      // 模拟分页和搜索
      let filteredOrders = mockOrders
      if (params.keyword) {
        filteredOrders = mockOrders.filter(order => 
          order.orderNumber.includes(params.keyword!) ||
          order.customerName.includes(params.keyword!)
        )
      }
      if (params.status) {
        filteredOrders = filteredOrders.filter(order => order.status === params.status)
      }
      if (params.type) {
        filteredOrders = filteredOrders.filter(order => order.type === params.type)
      }

      const pageSize = params.pageSize || 20
      const currentPage = params.page || 1
      const total = filteredOrders.length
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      const list = filteredOrders.slice(start, end)

      resolve({
        code: 200,
        message: 'success',
        data: {
          list,
          total,
          page: currentPage,
          size: pageSize
        }
      })
    }, 500)
  })
}

// 获取单个订单详情
export const getOrderDetail = async (id: string): Promise<ApiResponse<Order>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 这里应该根据id返回具体的订单详情
      // 为了演示，返回一个固定的订单详情
      const mockOrder: Order = {
        id: id,
        orderNumber: 'ORD20240101001',
        customerName: '张三建设集团',
        contactPerson: '张经理',
        contactPhone: '13800138000',
        contactEmail: 'zhang@example.com',
        projectAddress: '北京市朝阳区某某工程项目现场',
        type: OrderType.LONG_TERM,
        status: OrderStatus.ONGOING,
        startDate: '2024-01-02',
        endDate: '2024-03-02',
        rentalAmount: 180000,
        transportFee: 5000,
        insuranceFee: 3000,
        otherFee: 2000,
        discountAmount: 5000,
        totalAmount: 185000,
        createTime: '2024-01-01 09:30:00',
        updateTime: '2024-01-02 08:30:00',
        items: [
          {
            id: '1',
            orderId: id,
            equipmentId: 'EQ001',
            equipmentName: '挖掘机CAT320D',
            equipmentModel: 'CAT320D',
            quantity: 2,
            unitPrice: 1500,
            subtotal: 180000,
            remark: '需要专业操作员'
          }
        ],
        attachments: [
          {
            id: '1',
            name: '租赁合同.pdf',
            size: 2048576,
            url: '/files/contract.pdf'
          },
          {
            id: '2',
            name: '现场照片.jpg',
            size: 1024000,
            url: '/files/site-photo.jpg'
          }
        ],
        remark: '请确保设备按时到达现场，并提供专业操作培训。'
      }

      resolve({
        code: 200,
        message: 'success',
        data: mockOrder
      })
    }, 300)
  })
}

// 创建新订单
export const createOrder = async (data: Partial<Order>): Promise<ApiResponse<Order>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newOrder: Order = {
        id: Date.now().toString(),
        orderNumber: `ORD${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        customerName: data.customerName || '',
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        projectAddress: data.projectAddress,
        type: data.type || OrderType.SHORT_TERM,
        status: OrderStatus.PENDING,
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        rentalAmount: data.rentalAmount || 0,
        transportFee: data.transportFee || 0,
        insuranceFee: data.insuranceFee || 0,
        otherFee: data.otherFee || 0,
        discountAmount: data.discountAmount || 0,
        totalAmount: data.totalAmount || 0,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        items: data.items || [],
        attachments: data.attachments || [],
        remark: data.remark
      }

      resolve({
        code: 200,
        message: 'success',
        data: newOrder
      })
    }, 1000)
  })
}

// 更新订单信息
export const updateOrder = async (id: string, data: Partial<Order>): Promise<ApiResponse<Order>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟更新操作
      const updatedOrder: Order = {
        ...data as Order,
        id
      }

      resolve({
        code: 200,
        message: 'success',
        data: updatedOrder
      })
    }, 1000)
  })
}

// 删除订单
export const deleteOrder = async (id: string): Promise<ApiResponse<null>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟删除操作，这里可以添加实际删除逻辑
      console.log(`删除订单: ${id}`)
      resolve({
        code: 200,
        message: 'success',
        data: null
      })
    }, 500)
  })
}

// 取消订单
export const cancelOrder = async (id: string): Promise<ApiResponse<null>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟取消操作，这里可以添加实际取消逻辑
      console.log(`取消订单: ${id}`)
      resolve({
        code: 200,
        message: 'success',
        data: null
      })
    }, 500)
  })
}
