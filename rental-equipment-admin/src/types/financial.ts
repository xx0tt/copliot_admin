/**
 * 财务报告相关类型定义
 */

export interface FinancialReport {
  id: string
  name: string
  type: ReportType
  period: ReportPeriod
  startDate: string
  endDate: string
  status: ReportStatus
  data: ReportData
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ReportData {
  revenue: Revenue
  expenses: Expenses
  profit: Profit
  cashFlow: CashFlow
  assets: Assets
  liabilities: Liabilities
  receivables: Receivables
  payables: Payables
}

export interface Revenue {
  totalRevenue: number
  rentalRevenue: number
  serviceRevenue: number
  otherRevenue: number
  monthlyRevenue: MonthlyData[]
  revenueByCategory: CategoryData[]
  revenueByRegion: RegionData[]
}

export interface Expenses {
  totalExpenses: number
  operatingExpenses: number
  maintenanceExpenses: number
  marketingExpenses: number
  administrativeExpenses: number
  monthlyExpenses: MonthlyData[]
  expensesByCategory: CategoryData[]
}

export interface Profit {
  grossProfit: number
  netProfit: number
  profitMargin: number
  monthlyProfit: MonthlyData[]
  profitGrowthRate: number
}

export interface CashFlow {
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  netCashFlow: number
  monthlyCashFlow: MonthlyData[]
}

export interface Assets {
  totalAssets: number
  currentAssets: number
  fixedAssets: number
  equipmentValue: number
  assetsByCategory: CategoryData[]
}

export interface Liabilities {
  totalLiabilities: number
  currentLiabilities: number
  longTermLiabilities: number
  liabilitiesByCategory: CategoryData[]
}

export interface Receivables {
  totalReceivables: number
  overdueReceivables: number
  averageCollectionPeriod: number
  receivablesByAge: AgeData[]
}

export interface Payables {
  totalPayables: number
  overduePayables: number
  averagePaymentPeriod: number
  payablesByAge: AgeData[]
}

export interface MonthlyData {
  month: string
  value: number
  growth?: number
}

export interface CategoryData {
  category: string
  value: number
  percentage: number
}

export interface RegionData {
  region: string
  value: number
  percentage: number
}

export interface AgeData {
  ageRange: string
  amount: number
  percentage: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  orderId?: string
  amount: number
  taxAmount: number
  totalAmount: number
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  paidDate?: string
  items: InvoiceItem[]
  createdAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxRate: number
}

export interface Payment {
  id: string
  invoiceId?: string
  orderId?: string
  customerId: string
  customerName: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  processedDate: string
  remarks?: string
  createdAt: string
}

export enum ReportType {
  INCOME_STATEMENT = 'income_statement',
  BALANCE_SHEET = 'balance_sheet',
  CASH_FLOW = 'cash_flow',
  PROFIT_LOSS = 'profit_loss',
  RECEIVABLES = 'receivables',
  PAYABLES = 'payables',
  COMPREHENSIVE = 'comprehensive'
}

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export enum ReportStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  ALIPAY = 'alipay',
  WECHAT_PAY = 'wechat_pay',
  CHECK = 'check'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
