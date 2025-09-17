/**
 * 客户服务相关类型定义
 */

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  company?: string
  address: string
  contactPerson?: string
  customerType: CustomerType
  level: CustomerLevel
  status: CustomerStatus
  totalOrders: number
  totalAmount: number
  lastOrderDate?: string
  registrationDate: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface ServiceTicket {
  id: string
  customerId: string
  customerName: string
  title: string
  description: string
  type: TicketType
  priority: TicketPriority
  status: TicketStatus
  assigneeId?: string
  assigneeName?: string
  orderId?: string
  equipmentId?: string
  equipmentName?: string
  tags: string[]
  attachments: Attachment[]
  responses: TicketResponse[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface TicketResponse {
  id: string
  ticketId: string
  content: string
  isCustomer: boolean
  authorId: string
  authorName: string
  attachments: Attachment[]
  createdAt: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  createdAt: string
}

export interface CustomerStats {
  totalCustomers: number
  newCustomersThisMonth: number
  activeCustomers: number
  vipCustomers: number
  totalTickets: number
  pendingTickets: number
  resolvedTickets: number
  avgResponseTime: number
}

export enum CustomerType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  GOVERNMENT = 'government'
}

export enum CustomerLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  VIP = 'vip'
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLACKLIST = 'blacklist'
}

export enum TicketType {
  CONSULTATION = 'consultation',
  COMPLAINT = 'complaint',
  TECHNICAL_SUPPORT = 'technical_support',
  RETURN_REQUEST = 'return_request',
  MAINTENANCE = 'maintenance',
  OTHER = 'other'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING_CUSTOMER = 'pending_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}
