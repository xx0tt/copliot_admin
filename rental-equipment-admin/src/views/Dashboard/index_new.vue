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
                @click="handleOrderClick(order)"
              >
                <div class="order-header">
                  <span class="order-id">{{ order.orderNumber }}</span>
                  <el-tag 
                    :type="getStatusTag(order.status).type" 
                    size="small"
                  >
                    {{ getStatusTag(order.status).text }}
                  </el-tag>
                </div>
                <div class="order-info">
                  <div class="customer-name">{{ order.customerName }}</div>
                  <div class="equipment-name">{{ order.equipmentName }}</div>
                  <div class="order-time">{{ order.createTime }}</div>
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

// 快速操作数据
const quickActions = ref<QuickAction[]>([
  {
    label: '新增订单',
    icon: Plus,
    color: '#409EFF',
    action: 'create-order'
  },
  {
    label: '设备查询',
    icon: Search,
    color: '#67C23A',
    action: 'search-equipment'
  },
  {
    label: '生成报表',
    icon: Document,
    color: '#E6A23C',
    action: 'generate-report'
  },
  {
    label: '客户管理',
    icon: User,
    color: '#F56C6C',
    action: 'manage-customer'
  },
  {
    label: '系统设置',
    icon: Setting,
    color: '#909399',
    action: 'system-setting'
  },
  {
    label: '数据分析',
    icon: DataAnalysis,
    color: '#722ED1',
    action: 'data-analysis'
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
    createTime: '2024-01-01 10:15:00'
  },
  {
    id: '3',
    orderNumber: 'ORD20240101003',
    customerName: '王五建筑',
    equipmentName: '推土机D6K',
    status: OrderStatus.COMPLETED,
    totalAmount: 12000,
    createTime: '2024-01-01 11:20:00'
  }
])

// 方法
const changeRentalPeriod = (period: string) => {
  rentalPeriod.value = period
  // 这里可以重新加载数据
}

const loadIncomeData = () => {
  // 根据选择的月份加载收入数据
  console.log('加载收入数据:', incomeDate.value)
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
      router.push('/financial')
      break
    case 'manage-customer':
      router.push('/customer-service')
      break
    case 'system-setting':
      // 打开系统设置对话框
      break
    case 'data-analysis':
      // 打开数据分析页面
      break
  }
}

const handleOrderClick = (order: RecentOrder) => {
  router.push(`/orders/${order.id}`)
}

const getStatusTag = (status: OrderStatus) => {
  const statusMap = {
    [OrderStatus.PENDING]: { type: 'warning', text: '待处理' },
    [OrderStatus.CONFIRMED]: { type: 'info', text: '已确认' },
    [OrderStatus.ONGOING]: { type: 'primary', text: '进行中' },
    [OrderStatus.COMPLETED]: { type: 'success', text: '已完成' },
    [OrderStatus.CANCELLED]: { type: 'danger', text: '已取消' }
  }
  return statusMap[status] || { type: 'info', text: '未知' }
}

// 生命周期
onMounted(() => {
  // 组件挂载后可以进行数据加载
  console.log('Dashboard mounted')
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  .stats-cards {
    margin-bottom: 20px;
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
