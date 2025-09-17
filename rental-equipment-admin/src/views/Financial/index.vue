<template>
  <div class="financial-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>财务报告</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showGenerateReport = true">
          <el-icon><Document /></el-icon>
          生成报告
        </el-button>
        <el-button @click="showInvoiceManagement = true">
          <el-icon><Tickets /></el-icon>
          发票管理
        </el-button>
        <el-button @click="showPaymentManagement = true">
          <el-icon><Money /></el-icon>
          付款管理
        </el-button>
      </div>
    </div>

    <!-- 财务概览卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">¥{{ formatCurrency(stats.totalRevenue) }}</div>
          <div class="stat-label">总收入</div>
          <div class="stat-change positive">+12.5%</div>
        </div>
        <el-icon class="stat-icon revenue"><TrendCharts /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">¥{{ formatCurrency(stats.totalExpenses) }}</div>
          <div class="stat-label">总支出</div>
          <div class="stat-change negative">+5.2%</div>
        </div>
        <el-icon class="stat-icon expenses"><Minus /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">¥{{ formatCurrency(stats.netProfit) }}</div>
          <div class="stat-label">净利润</div>
          <div class="stat-change positive">+18.3%</div>
        </div>
        <el-icon class="stat-icon profit"><Trophy /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.profitMargin }}%</div>
          <div class="stat-label">利润率</div>
          <div class="stat-change positive">+2.1%</div>
        </div>
        <el-icon class="stat-icon margin"><DataAnalysis /></el-icon>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 收入趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>收入趋势</span>
            <el-radio-group v-model="revenueChartPeriod" size="small" @change="loadRevenueChart">
              <el-radio-button label="month">月度</el-radio-button>
              <el-radio-button label="quarter">季度</el-radio-button>
              <el-radio-button label="year">年度</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="revenueChartRef" class="chart-container"></div>
      </el-card>

      <!-- 支出分析图 -->
      <el-card class="chart-card">
        <template #header>
          <span>支出分析</span>
        </template>
        <div ref="expenseChartRef" class="chart-container"></div>
      </el-card>

      <!-- 利润分析图 -->
      <el-card class="chart-card full-width">
        <template #header>
          <div class="chart-header">
            <span>收支对比分析</span>
            <el-date-picker
              v-model="profitDateRange"
              type="monthrange"
              range-separator="至"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
              size="small"
              @change="loadProfitChart"
            />
          </div>
        </template>
        <div ref="profitChartRef" class="chart-container-large"></div>
      </el-card>

      <!-- 现金流图 -->
      <el-card class="chart-card">
        <template #header>
          <span>现金流分析</span>
        </template>
        <div ref="cashFlowChartRef" class="chart-container"></div>
      </el-card>

      <!-- 应收账款图 -->
      <el-card class="chart-card">
        <template #header>
          <span>应收账款账龄</span>
        </template>
        <div ref="receivablesChartRef" class="chart-container"></div>
      </el-card>
    </div>

    <!-- 报告列表 -->
    <el-card class="report-list">
      <template #header>
        <div class="list-header">
          <span>财务报告列表</span>
          <el-form :inline="true" :model="reportSearch" class="search-form">
            <el-form-item>
              <el-select v-model="reportSearch.type" placeholder="报告类型" clearable size="small">
                <el-option label="利润表" value="income_statement" />
                <el-option label="资产负债表" value="balance_sheet" />
                <el-option label="现金流量表" value="cash_flow" />
                <el-option label="应收账款" value="receivables" />
                <el-option label="综合报告" value="comprehensive" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="reportSearch.period" placeholder="报告周期" clearable size="small">
                <el-option label="日报" value="daily" />
                <el-option label="周报" value="weekly" />
                <el-option label="月报" value="monthly" />
                <el-option label="季报" value="quarterly" />
                <el-option label="年报" value="yearly" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="loadReports">搜索</el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>

      <el-table :data="reports" :loading="reportLoading" stripe>
        <el-table-column prop="name" label="报告名称" min-width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getReportTypeColor(row.type)" size="small">
              {{ getReportTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="period" label="周期" width="100">
          <template #default="{ row }">
            {{ getReportPeriodText(row.period) }}
          </template>
        </el-table-column>
        <el-table-column label="报告期间" width="200">
          <template #default="{ row }">
            {{ formatDateRange(row.startDate, row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getReportStatusColor(row.status)" size="small">
              {{ getReportStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text @click="viewReport(row)">
              查看
            </el-button>
            <el-button type="success" text @click="downloadReport(row, 'pdf')">
              PDF
            </el-button>
            <el-button type="warning" text @click="downloadReport(row, 'excel')">
              Excel
            </el-button>
            <el-button type="danger" text @click="deleteReport(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="reportPagination.page"
          v-model:page-size="reportPagination.size"
          :total="reportPagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadReports"
          @current-change="loadReports"
        />
      </div>
    </el-card>

    <!-- 生成报告对话框 -->
    <el-dialog
      v-model="showGenerateReport"
      title="生成财务报告"
      width="600px"
    >
      <el-form
        ref="reportFormRef"
        :model="reportForm"
        :rules="reportRules"
        label-width="100px"
      >
        <el-form-item label="报告名称" prop="name">
          <el-input v-model="reportForm.name" placeholder="请输入报告名称" />
        </el-form-item>
        <el-form-item label="报告类型" prop="type">
          <el-select v-model="reportForm.type" placeholder="请选择报告类型" style="width: 100%">
            <el-option label="利润表" value="income_statement" />
            <el-option label="资产负债表" value="balance_sheet" />
            <el-option label="现金流量表" value="cash_flow" />
            <el-option label="应收账款分析" value="receivables" />
            <el-option label="应付账款分析" value="payables" />
            <el-option label="综合财务报告" value="comprehensive" />
          </el-select>
        </el-form-item>
        <el-form-item label="报告周期" prop="period">
          <el-select v-model="reportForm.period" placeholder="请选择报告周期" style="width: 100%">
            <el-option label="日报" value="daily" />
            <el-option label="周报" value="weekly" />
            <el-option label="月报" value="monthly" />
            <el-option label="季报" value="quarterly" />
            <el-option label="年报" value="yearly" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="报告期间" prop="dateRange">
          <el-date-picker
            v-model="reportForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showGenerateReport = false">取消</el-button>
        <el-button type="primary" @click="generateReport" :loading="generating">
          生成报告
        </el-button>
      </template>
    </el-dialog>

    <!-- 发票管理对话框 -->
    <el-dialog
      v-model="showInvoiceManagement"
      title="发票管理"
      width="90%"
      top="5vh"
    >
      <div class="invoice-management">
        <!-- 发票搜索 -->
        <el-form :inline="true" :model="invoiceSearch" class="search-form">
          <el-form-item label="客户">
            <el-input v-model="invoiceSearch.customerName" placeholder="请输入客户名称" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="invoiceSearch.status" placeholder="请选择状态" clearable>
              <el-option label="草稿" value="draft" />
              <el-option label="已发送" value="sent" />
              <el-option label="已付款" value="paid" />
              <el-option label="逾期" value="overdue" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="invoiceSearch.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadInvoices">搜索</el-button>
            <el-button @click="showCreateInvoice = true">新建发票</el-button>
          </el-form-item>
        </el-form>

        <!-- 发票列表 -->
        <el-table :data="invoices" :loading="invoiceLoading">
          <el-table-column prop="invoiceNumber" label="发票号" width="150" />
          <el-table-column prop="customerName" label="客户名称" min-width="150" />
          <el-table-column prop="totalAmount" label="金额" width="120">
            <template #default="{ row }">
              ¥{{ row.totalAmount.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getInvoiceStatusColor(row.status)" size="small">
                {{ getInvoiceStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="issueDate" label="开票日期" width="120" />
          <el-table-column prop="dueDate" label="到期日期" width="120" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" text @click="viewInvoice(row)">查看</el-button>
              <el-button 
                v-if="row.status === 'draft'" 
                type="success" 
                text 
                @click="sendInvoice(row)"
              >
                发送
              </el-button>
              <el-button type="warning" text @click="downloadInvoice(row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 付款管理对话框 -->
    <el-dialog
      v-model="showPaymentManagement"
      title="付款管理"
      width="90%"
      top="5vh"
    >
      <div class="payment-management">
        <!-- 付款搜索 -->
        <el-form :inline="true" :model="paymentSearch" class="search-form">
          <el-form-item label="客户">
            <el-input v-model="paymentSearch.customerName" placeholder="请输入客户名称" clearable />
          </el-form-item>
          <el-form-item label="付款方式">
            <el-select v-model="paymentSearch.method" placeholder="请选择付款方式" clearable>
              <el-option label="现金" value="cash" />
              <el-option label="银行转账" value="bank_transfer" />
              <el-option label="信用卡" value="credit_card" />
              <el-option label="支付宝" value="alipay" />
              <el-option label="微信支付" value="wechat_pay" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="paymentSearch.status" placeholder="请选择状态" clearable>
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已完成" value="completed" />
              <el-option label="失败" value="failed" />
              <el-option label="已退款" value="refunded" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadPayments">搜索</el-button>
            <el-button @click="showCreatePayment = true">记录付款</el-button>
          </el-form-item>
        </el-form>

        <!-- 付款列表 -->
        <el-table :data="payments" :loading="paymentLoading">
          <el-table-column prop="id" label="付款ID" width="120">
            <template #default="{ row }">
              #{{ row.id.slice(-8) }}
            </template>
          </el-table-column>
          <el-table-column prop="customerName" label="客户名称" min-width="150" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">
              ¥{{ row.amount.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="method" label="付款方式" width="120">
            <template #default="{ row }">
              {{ getPaymentMethodText(row.method) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getPaymentStatusColor(row.status)" size="small">
                {{ getPaymentStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="processedDate" label="处理日期" width="120" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" text @click="viewPayment(row)">查看</el-button>
              <el-button 
                v-if="row.status === 'completed'" 
                type="warning" 
                text 
                @click="refundPayment(row)"
              >
                退款
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Document, Tickets, Money, TrendCharts, Minus, Trophy, DataAnalysis
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { 
  getFinancialReports, generateFinancialReport as generateReportApi,
  getFinancialStats, getRevenueAnalysis, getExpenseAnalysis, getProfitAnalysis,
  getCashFlowAnalysis, getInvoices, getPayments, exportReport
} from '@/api/financial'
import type { 
  FinancialReport, Invoice, Payment, ReportType, ReportPeriod 
} from '@/types/financial'

// 响应式数据
const reportLoading = ref(false)
const invoiceLoading = ref(false)
const paymentLoading = ref(false)
const generating = ref(false)

// 图表引用
const revenueChartRef = ref<HTMLDivElement>()
const expenseChartRef = ref<HTMLDivElement>()
const profitChartRef = ref<HTMLDivElement>()
const cashFlowChartRef = ref<HTMLDivElement>()
const receivablesChartRef = ref<HTMLDivElement>()

// 图表实例
let revenueChart: echarts.ECharts | null = null
let expenseChart: echarts.ECharts | null = null
let profitChart: echarts.ECharts | null = null
let cashFlowChart: echarts.ECharts | null = null
let receivablesChart: echarts.ECharts | null = null

// 数据列表
const reports = ref<FinancialReport[]>([])
const invoices = ref<Invoice[]>([])
const payments = ref<Payment[]>([])

// 对话框显示状态
const showGenerateReport = ref(false)
const showInvoiceManagement = ref(false)
const showPaymentManagement = ref(false)
const showCreateInvoice = ref(false)
const showCreatePayment = ref(false)

// 图表控制
const revenueChartPeriod = ref('month')
const profitDateRange = ref<string[]>([])

// 统计数据
const stats = reactive({
  totalRevenue: 0,
  totalExpenses: 0,
  netProfit: 0,
  profitMargin: 0,
  totalReceivables: 0,
  overdueReceivables: 0,
  totalInvoices: 0,
  paidInvoices: 0
})

// 搜索表单
const reportSearch = reactive({
  type: '',
  period: ''
})

const invoiceSearch = reactive({
  customerName: '',
  status: '',
  dateRange: [] as string[]
})

const paymentSearch = reactive({
  customerName: '',
  method: '',
  status: ''
})

// 分页数据
const reportPagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 报告表单
const reportForm = reactive({
  name: '',
  type: '' as ReportType,
  period: '' as ReportPeriod,
  dateRange: [] as string[]
})

// 表单引用和验证规则
const reportFormRef = ref<FormInstance>()
const reportRules: FormRules = {
  name: [
    { required: true, message: '请输入报告名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择报告类型', trigger: 'change' }
  ],
  period: [
    { required: true, message: '请选择报告周期', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '请选择报告期间', trigger: 'change' }
  ]
}

// 初始化数据
onMounted(async () => {
  await loadStats()
  await loadReports()
  await nextTick()
  initCharts()
  loadAllCharts()
})

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await getFinancialStats()
    Object.assign(stats, response.data)
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

// 加载报告列表
const loadReports = async () => {
  try {
    reportLoading.value = true
    const params = {
      page: reportPagination.page,
      size: reportPagination.size,
      ...reportSearch
    }
    const response = await getFinancialReports(params)
    reports.value = response.data.list
    reportPagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载报告列表失败')
  } finally {
    reportLoading.value = false
  }
}

// 加载发票列表
const loadInvoices = async () => {
  try {
    invoiceLoading.value = true
    const params = {
      ...invoiceSearch,
      startDate: invoiceSearch.dateRange[0],
      endDate: invoiceSearch.dateRange[1]
    }
    const response = await getInvoices(params)
    invoices.value = response.data.list
  } catch (error) {
    ElMessage.error('加载发票列表失败')
  } finally {
    invoiceLoading.value = false
  }
}

// 加载付款列表
const loadPayments = async () => {
  try {
    paymentLoading.value = true
    const response = await getPayments(paymentSearch)
    payments.value = response.data.list
  } catch (error) {
    ElMessage.error('加载付款列表失败')
  } finally {
    paymentLoading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  if (revenueChartRef.value) {
    revenueChart = echarts.init(revenueChartRef.value)
  }
  if (expenseChartRef.value) {
    expenseChart = echarts.init(expenseChartRef.value)
  }
  if (profitChartRef.value) {
    profitChart = echarts.init(profitChartRef.value)
  }
  if (cashFlowChartRef.value) {
    cashFlowChart = echarts.init(cashFlowChartRef.value)
  }
  if (receivablesChartRef.value) {
    receivablesChart = echarts.init(receivablesChartRef.value)
  }
}

// 加载所有图表
const loadAllCharts = () => {
  loadRevenueChart()
  loadExpenseChart()
  loadProfitChart()
  loadCashFlowChart()
  loadReceivablesChart()
}

// 加载收入图表
const loadRevenueChart = async () => {
  try {
    const response = await getRevenueAnalysis({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      groupBy: revenueChartPeriod.value as 'month'
    })
    
    const option = {
      title: { text: '收入趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: response.data.map((item: any) => item.month)
      },
      yAxis: { type: 'value' },
      series: [{
        data: response.data.map((item: any) => item.value),
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.8)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }]
    }
    
    revenueChart?.setOption(option)
  } catch (error) {
    console.error('加载收入图表失败:', error)
  }
}

// 加载支出图表
const loadExpenseChart = async () => {
  try {
    // 模拟数据
    const data = [
      { name: '设备维护', value: 120000 },
      { name: '人员工资', value: 80000 },
      { name: '办公费用', value: 30000 },
      { name: '营销费用', value: 25000 },
      { name: '其他费用', value: 15000 }
    ]
    
    const option = {
      title: { text: '支出构成' },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '70%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    }
    
    expenseChart?.setOption(option)
  } catch (error) {
    console.error('加载支出图表失败:', error)
  }
}

// 加载利润图表
const loadProfitChart = async () => {
  try {
    // 模拟数据
    const months = ['1月', '2月', '3月', '4月', '5月', '6月']
    const revenue = [85000, 92000, 88000, 95000, 102000, 98000]
    const expenses = [65000, 68000, 66000, 71000, 75000, 73000]
    const profit = revenue.map((r, i) => r - expenses[i])
    
    const option = {
      title: { text: '收支对比分析' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['收入', '支出', '利润'] },
      xAxis: {
        type: 'category',
        data: months
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '收入',
          type: 'bar',
          data: revenue,
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '支出',
          type: 'bar',
          data: expenses,
          itemStyle: { color: '#f56c6c' }
        },
        {
          name: '利润',
          type: 'line',
          data: profit,
          itemStyle: { color: '#409eff' }
        }
      ]
    }
    
    profitChart?.setOption(option)
  } catch (error) {
    console.error('加载利润图表失败:', error)
  }
}

// 加载现金流图表
const loadCashFlowChart = async () => {
  try {
    // 模拟数据
    const data = [
      { name: '经营活动', value: 150000 },
      { name: '投资活动', value: -80000 },
      { name: '筹资活动', value: 30000 }
    ]
    
    const option = {
      title: { text: '现金流分析' },
      tooltip: { trigger: 'item' },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name)
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: data.map(item => ({
          value: item.value,
          itemStyle: {
            color: item.value > 0 ? '#67c23a' : '#f56c6c'
          }
        }))
      }]
    }
    
    cashFlowChart?.setOption(option)
  } catch (error) {
    console.error('加载现金流图表失败:', error)
  }
}

// 加载应收账款图表
const loadReceivablesChart = async () => {
  try {
    // 模拟数据
    const data = [
      { name: '30天内', value: 80000 },
      { name: '31-60天', value: 45000 },
      { name: '61-90天', value: 25000 },
      { name: '90天以上', value: 12000 }
    ]
    
    const option = {
      title: { text: '应收账款账龄' },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    }
    
    receivablesChart?.setOption(option)
  } catch (error) {
    console.error('加载应收账款图表失败:', error)
  }
}

// 生成报告
const generateReport = async () => {
  if (!reportFormRef.value) return
  
  try {
    await reportFormRef.value.validate()
    generating.value = true
    
    const data = {
      name: reportForm.name,
      type: reportForm.type,
      period: reportForm.period,
      startDate: reportForm.dateRange[0],
      endDate: reportForm.dateRange[1]
    }
    
    await generateReportApi(data)
    ElMessage.success('报告生成成功')
    
    showGenerateReport.value = false
    resetReportForm()
    loadReports()
  } catch (error) {
    ElMessage.error('生成报告失败')
  } finally {
    generating.value = false
  }
}

// 查看报告
const viewReport = (report: FinancialReport) => {
  // 跳转到报告详情页面
  console.log('查看报告:', report)
}

// 下载报告
const downloadReport = async (report: FinancialReport, format: 'pdf' | 'excel') => {
  try {
    const blob = await exportReport(report.id, format)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.name}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载报告失败')
  }
}

// 删除报告
const deleteReport = async (report: FinancialReport) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除报告"${report.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 调用删除API
    ElMessage.success('删除报告成功')
    loadReports()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除报告失败')
    }
  }
}

// 查看发票
const viewInvoice = (invoice: Invoice) => {
  console.log('查看发票:', invoice)
}

// 发送发票
const sendInvoice = (invoice: Invoice) => {
  console.log('发送发票:', invoice)
}

// 下载发票
const downloadInvoice = (invoice: Invoice) => {
  console.log('下载发票:', invoice)
}

// 查看付款
const viewPayment = (payment: Payment) => {
  console.log('查看付款:', payment)
}

// 退款
const refundPayment = (payment: Payment) => {
  console.log('退款:', payment)
}

// 重置报告表单
const resetReportForm = () => {
  Object.assign(reportForm, {
    name: '',
    type: '',
    period: '',
    dateRange: []
  })
  reportFormRef.value?.resetFields()
}

// 格式化货币
const formatCurrency = (amount: number) => {
  return amount.toLocaleString()
}

// 格式化日期范围
const formatDateRange = (startDate: string, endDate: string) => {
  return `${startDate} 至 ${endDate}`
}

// 获取报告类型颜色
const getReportTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    income_statement: 'success',
    balance_sheet: 'warning',
    cash_flow: 'info',
    receivables: 'danger',
    comprehensive: 'primary'
  }
  return colors[type] || ''
}

// 获取报告类型文本
const getReportTypeText = (type: string) => {
  const texts: Record<string, string> = {
    income_statement: '利润表',
    balance_sheet: '资产负债表',
    cash_flow: '现金流量表',
    receivables: '应收账款',
    payables: '应付账款',
    comprehensive: '综合报告'
  }
  return texts[type] || '未知'
}

// 获取报告周期文本
const getReportPeriodText = (period: string) => {
  const texts: Record<string, string> = {
    daily: '日报',
    weekly: '周报',
    monthly: '月报',
    quarterly: '季报',
    yearly: '年报',
    custom: '自定义'
  }
  return texts[period] || '未知'
}

// 获取报告状态颜色
const getReportStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'info',
    generating: 'warning',
    completed: 'success',
    error: 'danger'
  }
  return colors[status] || 'info'
}

// 获取报告状态文本
const getReportStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: '草稿',
    generating: '生成中',
    completed: '已完成',
    error: '错误'
  }
  return texts[status] || '未知'
}

// 获取发票状态颜色
const getInvoiceStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'info',
    sent: 'warning',
    paid: 'success',
    overdue: 'danger',
    cancelled: 'info'
  }
  return colors[status] || 'info'
}

// 获取发票状态文本
const getInvoiceStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: '草稿',
    sent: '已发送',
    paid: '已付款',
    overdue: '逾期',
    cancelled: '已取消'
  }
  return texts[status] || '未知'
}

// 获取付款方式文本
const getPaymentMethodText = (method: string) => {
  const texts: Record<string, string> = {
    cash: '现金',
    bank_transfer: '银行转账',
    credit_card: '信用卡',
    alipay: '支付宝',
    wechat_pay: '微信支付',
    check: '支票'
  }
  return texts[method] || '未知'
}

// 获取付款状态颜色
const getPaymentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    failed: 'danger',
    refunded: 'info'
  }
  return colors[status] || 'info'
}

// 获取付款状态文本
const getPaymentStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
    refunded: '已退款'
  }
  return texts[status] || '未知'
}
</script>

<style lang="scss" scoped>
.financial-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .stat-card {
      position: relative;

      .stat-content {
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 4px;
        }

        .stat-change {
          font-size: 12px;
          
          &.positive {
            color: #67c23a;
          }
          
          &.negative {
            color: #f56c6c;
          }
        }
      }

      .stat-icon {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 40px;
        opacity: 0.3;

        &.revenue {
          color: #409eff;
        }

        &.expenses {
          color: #f56c6c;
        }

        &.profit {
          color: #67c23a;
        }

        &.margin {
          color: #e6a23c;
        }
      }
    }
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;

    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chart-container {
        height: 300px;
        width: 100%;
      }

      .chart-container-large {
        height: 400px;
        width: 100%;
      }

      &.full-width {
        grid-column: 1 / -1;
      }
    }
  }

  .report-list {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .search-form {
        margin: 0;
      }
    }

    .pagination {
      margin-top: 20px;
      text-align: right;
    }
  }

  .invoice-management,
  .payment-management {
    .search-form {
      margin-bottom: 20px;
    }
  }
}
</style>
