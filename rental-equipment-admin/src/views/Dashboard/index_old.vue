<template>
  <div class="dashboard-container">
    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="stat in statsData" :key="stat.title">
          <StatsCard
            :title="stat.title"
            :value="stat.value"
            :icon="stat.icon"
            :color="stat.color"
            :trend="stat.trend"
            :description="stat.description"
            :animated="true"
            :theme="stat.theme"
          >
            <template #action v-if="stat.action">
              <el-button size="small" type="primary" link @click="stat.action.handler">
                {{ stat.action.text }}
              </el-button>
            </template>
          </StatsCard>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 租赁趋势图 -->
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">租赁趋势</span>
                <el-button-group>
                  <el-button 
                    :type="rentalPeriod === '7d' ? 'primary' : ''" 
                    size="small"
                    @click="changeRentalPeriod('7d')"
                  >
                    近7天
                  </el-button>
                  <el-button 
                    :type="rentalPeriod === '30d' ? 'primary' : ''" 
                    size="small"
                    @click="changeRentalPeriod('30d')"
                  >
                    近30天
                  </el-button>
                  <el-button 
                    :type="rentalPeriod === '90d' ? 'primary' : ''" 
                    size="small"
                    @click="changeRentalPeriod('90d')"
                  >
                    近90天
                  </el-button>
                </el-button-group>
              </div>
            </template>
            <LineChart
              :data="rentalTrendData"
              :options="rentalTrendOptions"
              height="300px"
            />
          </el-card>
        </el-col>

        <!-- 设备类型分布 -->
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">设备类型分布</span>
              </div>
            </template>
            <PieChart
              :data="equipmentTypeData"
              :options="equipmentTypeOptions"
              height="300px"
            />
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-20">
        <!-- 收入统计 -->
        <el-col :xs="24" :lg="16">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">收入统计</span>
                <el-date-picker
                  v-model="incomeDate"
                  type="month"
                  placeholder="选择月份"
                  size="small"
                  @change="loadIncomeData"
                />
              </div>
            </template>
            <BarChart
              :data="incomeData"
              :options="incomeOptions"
              height="300px"
            />
          </el-card>
        </el-col>

        <!-- 近期订单 -->
        <el-col :xs="24" :lg="8">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">近期订单</span>
                <el-button type="text" @click="$router.push('/orders')">
                  查看全部
                </el-button>
              </div>
            </template>
            <div class="recent-orders">
              <div 
                v-for="order in recentOrders" 
                :key="order.id"
                class="order-item"
                @click="viewOrderDetail(order.id)"
              >
                <div class="order-header">
                  <span class="order-id">{{ order.orderNumber }}</span>
                  <el-tag 
                    :type="getOrderStatusType(order.status)" 
                    size="small"
                  >
                    {{ getOrderStatusText(order.status) }}
                  </el-tag>
                </div>
                <div class="order-info">
                  <div class="customer-name">{{ order.customerName }}</div>
                  <div class="equipment-name">{{ order.equipmentName }}</div>
                  <div class="order-time">{{ formatDate(order.createTime) }}</div>
                </div>
                <div class="order-amount">¥{{ order.totalAmount.toLocaleString() }}</div>
              </div>
              <div v-if="recentOrders.length === 0" class="empty-orders">
                暂无最新订单
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快速操作区域 -->
    <div class="quick-actions">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">快速操作</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6" :md="4" v-for="action in quickActions" :key="action.label">
            <div class="action-item" @click="handleQuickAction(action.action)">
              <div class="action-icon" :style="{ backgroundColor: action.color }">
                <el-icon :size="24">
                  <component :is="action.icon" />
                </el-icon>
              </div>
              <div class="action-label">{{ action.label }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Box, 
  ShoppingCart, 
  Tools, 
  Money,
  TrendCharts,
  ArrowUp,
  ArrowDown,
  Plus,
  Search,
  Document,
  User,
  Setting,
  DataAnalysis
} from '@element-plus/icons-vue'
import { OrderStatus } from '@/types/order'
import { StatsCard, LineChart, PieChart, BarChart } from '@/components/Common'

// 定义接口
interface StatData {
  title: string
  value: string | number
  color: string
  icon: any
  trend: {
    type: 'up' | 'down' | 'equal'
    value: string | number
    unit?: string
  }
  description?: string
  theme?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  action?: {
    text: string
    handler: () => void
  }
}

interface QuickAction {
  label: string
  icon: any
  color: string
  action: string
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  equipmentName: string
  status: OrderStatus
  totalAmount: number
  createTime: string
}

const router = useRouter()

// 响应式数据
const rentalPeriod = ref('7d')
const incomeDate = ref(new Date())

// 图表数据
const rentalTrendData = computed(() => ({
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
  legend: ['新增订单', '完成订单'],
  series: [
    {
      name: '新增订单',
      type: 'line',
      data: [120, 132, 101, 134, 90, 230, 210],
      smooth: true,
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '完成订单',
      type: 'line',
      data: [220, 182, 191, 234, 290, 330, 310],
      smooth: true,
      itemStyle: { color: '#67C23A' }
    }
  ]
}))

const rentalTrendOptions = computed(() => ({
  title: {
    text: '租赁趋势分析',
    left: 'center',
    textStyle: { fontSize: 14 }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  }
}))

// 设备类型分布数据
const equipmentTypeData = computed(() => [
  { value: 335, name: '挖掘机' },
  { value: 310, name: '推土机' },
  { value: 234, name: '起重机' },
  { value: 135, name: '压路机' },
  { value: 1548, name: '其他设备' }
])

const equipmentTypeOptions = computed(() => ({
  title: {
    text: '设备类型分布',
    left: 'center',
    textStyle: { fontSize: 14 }
  }
}))

// 收入统计数据
const incomeData = computed(() => ({
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
  legend: ['租赁收入', '维修收入'],
  series: [
    {
      name: '租赁收入',
      type: 'bar',
      data: [120000, 132000, 101000, 134000, 90000, 230000],
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '维修收入',
      type: 'bar',
      data: [22000, 18200, 19100, 23400, 29000, 33000],
      itemStyle: { color: '#67C23A' }
    }
  ]
}))

const incomeOptions = computed(() => ({
  title: {
    text: '收入统计分析',
    left: 'center',
    textStyle: { fontSize: 14 }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: (value: number) => `${(value / 1000).toFixed(0)}K`
    }
  }
}))

// 统计数据
const statsData = ref<StatData[]>([
  {
    title: '总订单数',
    value: 1234,
    color: '#409EFF',
    icon: ShoppingCart,
    theme: 'primary',
    trend: { type: 'up', value: 12.5, unit: '%' },
    description: '较上月增长',
    action: {
      text: '查看详情',
      handler: () => router.push('/orders')
    }
  },
  {
    title: '设备总数',
    value: 856,
    color: '#67C23A',
    icon: Box,
    theme: 'success',
    trend: { type: 'up', value: 8.2, unit: '%' },
    description: '较上月增长',
    action: {
      text: '管理设备',
      handler: () => router.push('/equipment')
    }
  },
  {
    title: '维修中设备',
    value: 23,
    color: '#E6A23C',
    icon: Tools,
    theme: 'warning',
    trend: { type: 'down', value: 5.3, unit: '%' },
    description: '较上月减少',
    action: {
      text: '查看维修',
      handler: () => router.push('/equipment/maintenance')
    }
  },
  {
    title: '本月收入',
    value: '¥245,680',
    color: '#F56C6C',
    icon: Money,
    theme: 'danger',
    trend: { type: 'up', value: 15.7, unit: '%' },
    description: '较上月增长',
    action: {
      text: '财务报表',
      handler: () => router.push('/financial')
    }
  }
])

// 近期订单数据
const recentOrders = ref<RecentOrder[]>([
  {
    id: '1',
    orderNumber: 'ORD20240101001',
    customerName: '张三建设集团',
    equipmentName: '挖掘机CAT320D',
    status: OrderStatus.ONGOING,
    totalAmount: 15000,
    createTime: '2024-01-01 09:30:00'
  },
  {
    id: '2',
    orderNumber: 'ORD20240101002',
    customerName: '李四工程公司',
    equipmentName: '起重机QTZ63',
    status: OrderStatus.PENDING,
    totalAmount: 25000,
    createTime: '2024-01-01 14:20:00'
  },
  {
    id: '3',
    orderNumber: 'ORD20240101003',
    customerName: '王五建筑有限公司',
    equipmentName: '装载机LG936L',
    status: OrderStatus.COMPLETED,
    totalAmount: 8000,
    createTime: '2024-01-01 16:45:00'
  }
])

// 快速操作数据
const quickActions = ref<QuickAction[]>([
  { label: '新建订单', icon: Plus, color: '#409EFF', action: 'create-order' },
  { label: '设备查询', icon: Search, color: '#67C23A', action: 'search-equipment' },
  { label: '生成报告', icon: Document, color: '#E6A23C', action: 'generate-report' },
  { label: '客户管理', icon: User, color: '#F56C6C', action: 'manage-customers' },
  { label: '系统设置', icon: Setting, color: '#909399', action: 'system-settings' },
  { label: '数据分析', icon: DataAnalysis, color: '#17B3A3', action: 'data-analysis' }
])

// 方法
const changeRentalPeriod = (period: string) => {
  rentalPeriod.value = period
  loadRentalTrendData()
}

const loadIncomeData = () => {
  // 重新加载收入数据
  initIncomeChart()
}

const getOrderStatusType = (status: OrderStatus) => {
  const statusMap = {
    [OrderStatus.PENDING]: 'warning',
    [OrderStatus.ONGOING]: 'success',
    [OrderStatus.COMPLETED]: 'info',
    [OrderStatus.CANCELLED]: 'danger'
  }
  return statusMap[status] || 'info'
}

const getOrderStatusText = (status: OrderStatus) => {
  const statusMap = {
    [OrderStatus.PENDING]: '待开始',
    [OrderStatus.ONGOING]: '进行中',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消'
  }
  return statusMap[status] || '未知'
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

const viewOrderDetail = (orderId: string) => {
  router.push(`/orders/${orderId}`)
}

const handleQuickAction = (action: string) => {
  switch (action) {
    case 'create-order':
      router.push('/orders/create')
      break
    case 'search-equipment':
      router.push('/equipment')
      break
    case 'generate-report':
      router.push('/reports')
      break
    case 'manage-customers':
      router.push('/customers')
      break
    case 'system-settings':
      router.push('/settings')
      break
    case 'data-analysis':
      router.push('/analytics')
      break
  }
}

// 初始化租赁趋势图表
const initRentalTrendChart = () => {
  if (!rentalTrendChart.value) return
  
  rentalChart = echarts.init(rentalTrendChart.value)
  loadRentalTrendData()
}

const loadRentalTrendData = () => {
  if (!rentalChart) return
  
  // 模拟数据
  const data = {
    '7d': {
      dates: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7'],
      orders: [23, 34, 28, 45, 38, 52, 47],
      revenue: [12000, 18000, 15000, 24000, 20000, 28000, 25000]
    },
    '30d': {
      dates: Array.from({ length: 30 }, (_, i) => `${Math.floor(i / 7) + 1}周`),
      orders: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 20),
      revenue: Array.from({ length: 30 }, () => Math.floor(Math.random() * 20000) + 10000)
    },
    '90d': {
      dates: ['第1月', '第2月', '第3月'],
      orders: [1200, 1450, 1680],
      revenue: [650000, 780000, 920000]
    }
  }
  
  const currentData = data[rentalPeriod.value as keyof typeof data]
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['订单数量', '租赁收入']
    },
    xAxis: {
      type: 'category',
      data: currentData.dates
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数量',
        position: 'left'
      },
      {
        type: 'value',
        name: '收入 (元)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '订单数量',
        type: 'line',
        data: currentData.orders,
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '租赁收入',
        type: 'bar',
        yAxisIndex: 1,
        data: currentData.revenue,
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }
  
  rentalChart.setOption(option)
}

// 初始化设备类型分布图表
const initEquipmentTypeChart = () => {
  if (!equipmentTypeChart.value) return
  
  equipmentChart = echarts.init(equipmentTypeChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 156, name: '挖掘机' },
          { value: 89, name: '起重机' },
          { value: 67, name: '装载机' },
          { value: 45, name: '推土机' },
          { value: 34, name: '压路机' },
          { value: 23, name: '其他设备' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  equipmentChart.setOption(option)
}

// 初始化收入统计图表
const initIncomeChart = () => {
  if (!incomeChart.value) return
  
  incomeChartInstance = echarts.init(incomeChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['租赁收入', '维修收入', '其他收入']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value',
      name: '收入 (万元)'
    },
    series: [
      {
        name: '租赁收入',
        type: 'bar',
        stack: 'total',
        data: [45, 52, 61, 68, 72, 78, 85, 89, 94, 102, 108, 115],
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '维修收入',
        type: 'bar',
        stack: 'total',
        data: [12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 42],
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '其他收入',
        type: 'bar',
        stack: 'total',
        data: [5, 6, 8, 9, 10, 12, 15, 18, 20, 22, 25, 28],
        itemStyle: {
          color: '#E6A23C'
        }
      }
    ]
  }
  
  incomeChartInstance.setOption(option)
}

// 窗口大小调整处理
const handleResize = () => {
  nextTick(() => {
    rentalChart?.resize()
    equipmentChart?.resize()
    incomeChartInstance?.resize()
  })
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initRentalTrendChart()
    initEquipmentTypeChart()
    initIncomeChart()
  })
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  rentalChart?.dispose()
  equipmentChart?.dispose()
  incomeChartInstance?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  .stats-cards {
    margin-bottom: 20px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 16px;
        }
        
        .stat-info {
          flex: 1;
          
          .stat-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
          }
          
          .stat-desc {
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
            
            &.up {
              color: #67C23A;
            }
            
            &.down {
              color: #F56C6C;
            }
          }
        }
      }
    }
  }
  
  .charts-section {
    .chart-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .card-title {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
      }
      
      .chart-container {
        height: 300px;
        width: 100%;
      }
      
      .recent-orders {
        .order-item {
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.2s;
          
          &:hover {
            background-color: #f5f7fa;
          }
          
          &:last-child {
            border-bottom: none;
          }
          
          .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            
            .order-id {
              font-size: 14px;
              font-weight: bold;
              color: #409EFF;
            }
          }
          
          .order-info {
            .customer-name {
              font-size: 13px;
              color: #333;
              margin-bottom: 4px;
            }
            
            .equipment-name {
              font-size: 12px;
              color: #666;
              margin-bottom: 4px;
            }
            
            .order-time {
              font-size: 11px;
              color: #999;
            }
          }
          
          .order-amount {
            text-align: right;
            font-size: 14px;
            font-weight: bold;
            color: #67C23A;
            margin-top: 8px;
          }
        }
        
        .empty-orders {
          text-align: center;
          color: #999;
          padding: 40px 0;
          font-size: 14px;
        }
      }
    }
  }
  
  .quick-actions {
    margin-top: 20px;
    
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 10px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
      
      &:hover {
        background-color: #f5f7fa;
        transform: translateY(-2px);
      }
      
      .action-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-bottom: 12px;
      }
      
      .action-label {
        font-size: 14px;
        color: #333;
        text-align: center;
      }
    }
  }
  
  .mt-20 {
    margin-top: 20px;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
    
    .charts-section {
      .chart-card {
        .chart-container {
          height: 250px;
        }
      }
    }
    
    .quick-actions {
      .action-item {
        padding: 15px 5px;
        
        .action-icon {
          width: 40px;
          height: 40px;
        }
        
        .action-label {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
