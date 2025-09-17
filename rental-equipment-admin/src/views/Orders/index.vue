<template>
  <div class="orders-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">订单管理</h2>
        <div class="header-actions">
          <Export
            :data="orders"
            :columns="exportColumns"
            :selected-data="selectedOrders"
            filename="订单数据"
            @export-start="handleExportStart"
            @export-success="handleExportSuccess"
            @export-error="handleExportError"
          />
          <el-button type="primary" @click="createOrder">
            <el-icon><Plus /></el-icon>
            新建订单
          </el-button>
        </div>
      </div>
      
      <!-- 搜索和筛选区域 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索订单号、客户名称"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="searchForm.status" placeholder="订单状态" clearable>
              <el-option 
                v-for="status in orderStatusOptions" 
                :key="status.value"
                :label="status.label" 
                :value="status.value"
              />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="searchForm.type" placeholder="订单类型" clearable>
              <el-option 
                v-for="type in orderTypeOptions" 
                :key="type.value"
                :label="type.label" 
                :value="type.value"
              />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-col>
          <el-col :xs="24" :sm="24" :md="4">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="table-section">
      <el-card shadow="never">
        <el-table
          v-loading="loading"
          :data="orderList"
          stripe
          style="width: 100%"
          @sort-change="handleSortChange"
        >
          <el-table-column prop="orderNumber" label="订单号" width="140" fixed="left">
            <template #default="{ row }">
              <el-button type="text" @click="viewOrderDetail(row.id)">
                {{ row.orderNumber }}
              </el-button>
            </template>
          </el-table-column>
          
          <el-table-column prop="customerName" label="客户名称" width="150" />
          
          <el-table-column prop="equipmentName" label="设备名称" width="180" />
          
          <el-table-column prop="type" label="订单类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getOrderTypeTagType(row.type)">
                {{ getOrderTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="订单状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getOrderStatusTagType(row.status)">
                {{ getOrderStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="startDate" label="开始日期" width="120" sortable="custom">
            <template #default="{ row }">
              {{ formatDate(row.startDate) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="endDate" label="结束日期" width="120" sortable="custom">
            <template #default="{ row }">
              {{ formatDate(row.endDate) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="totalAmount" label="订单金额" width="120" sortable="custom">
            <template #default="{ row }">
              <span class="amount">¥{{ row.totalAmount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="createTime" label="创建时间" width="160" sortable="custom">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button type="primary" size="small" @click="viewOrderDetail(row.id)">
                  查看
                </el-button>
                <el-button 
                  v-if="canEditOrder(row.status)"
                  type="warning" 
                  size="small" 
                  @click="editOrder(row.id)"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="canCancelOrder(row.status)"
                  type="danger" 
                  size="small" 
                  @click="cancelOrder(row)"
                >
                  取消
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 批量操作 -->
    <div class="batch-operations" v-if="selectedOrders.length > 0">
      <el-card shadow="always">
        <div class="batch-content">
          <span>已选择 {{ selectedOrders.length }} 条记录</span>
          <div class="batch-actions">
            <el-button type="primary" @click="batchExport">批量导出</el-button>
            <el-button type="warning" @click="batchUpdate">批量更新状态</el-button>
            <el-button type="danger" @click="batchCancel">批量取消</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { Order, OrderStatus, OrderType } from '@/types/order'
import { getOrders } from '@/api/orders'
import { Export } from '@/components/Common'

// 响应式数据
const loading = ref(false)
const orderList = ref<Order[]>([])
const selectedOrders = ref<Order[]>([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  type: '',
  dateRange: [] as string[]
})

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 订单状态选项
const orderStatusOptions = [
  { label: '待开始', value: OrderStatus.PENDING },
  { label: '进行中', value: OrderStatus.ONGOING },
  { label: '已完成', value: OrderStatus.COMPLETED },
  { label: '已取消', value: OrderStatus.CANCELLED }
]

// 订单类型选项
const orderTypeOptions = [
  { label: '短期租赁', value: OrderType.SHORT_TERM },
  { label: '长期租赁', value: OrderType.LONG_TERM },
  { label: '维修服务', value: OrderType.MAINTENANCE },
  { label: '技术支持', value: OrderType.TECHNICAL_SUPPORT }
]

// 计算属性
const canEditOrder = computed(() => {
  return (status: OrderStatus) => {
    return status === OrderStatus.PENDING
  }
})

const canCancelOrder = computed(() => {
  return (status: OrderStatus) => {
    return status === OrderStatus.PENDING || status === OrderStatus.ONGOING
  }
})

// 导出相关数据
const exportColumns = ref([
  { prop: 'orderNumber', label: '订单号', required: true },
  { prop: 'customerName', label: '客户名称', required: true },
  { prop: 'equipmentName', label: '设备名称' },
  { prop: 'type', label: '订单类型' },
  { prop: 'status', label: '订单状态' },
  { prop: 'startDate', label: '开始日期' },
  { prop: 'endDate', label: '结束日期' },
  { prop: 'totalAmount', label: '订单金额' },
  { prop: 'createTime', label: '创建时间' }
])

// 导出事件处理
const handleExportStart = (config: any) => {
  console.log('导出开始:', config)
  ElMessage.info('正在导出数据...')
}

const handleExportSuccess = (data: any) => {
  console.log('导出成功:', data)
  ElMessage.success('数据导出成功！')
}

const handleExportError = (error: any) => {
  console.error('导出失败:', error)
  ElMessage.error('数据导出失败，请重试')
}

// 方法
const loadOrderList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status,
      type: searchForm.type,
      startDate: searchForm.dateRange[0],
      endDate: searchForm.dateRange[1]
    }
    
    const response = await getOrders(params)
    orderList.value = response.data.list
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载订单列表失败')
    console.error('Load orders error:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadOrderList()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.type = ''
  searchForm.dateRange = []
  pagination.currentPage = 1
  loadOrderList()
}

const handleSortChange = ({ column, prop, order }: any) => {
  // TODO: 实现排序逻辑
  console.log('Sort change:', { column, prop, order })
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadOrderList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadOrderList()
}

const createOrder = () => {
  router.push('/orders/create')
}

const viewOrderDetail = (orderId: string) => {
  router.push(`/orders/${orderId}`)
}

const editOrder = (orderId: string) => {
  router.push(`/orders/edit/${orderId}`)
}

const cancelOrder = async (order: Order) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${order.orderNumber} 吗？取消后不可恢复。`,
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用取消订单API
    ElMessage.success('订单取消成功')
    loadOrderList()
  } catch (error) {
    // 用户取消操作
  }
}

const batchExport = () => {
  ElMessage.info('批量导出功能开发中')
}

const batchUpdate = () => {
  ElMessage.info('批量更新状态功能开发中')
}

const batchCancel = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要取消选中的 ${selectedOrders.value.length} 个订单吗？`,
      '批量取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用批量取消API
    ElMessage.success('批量取消成功')
    selectedOrders.value = []
    loadOrderList()
  } catch (error) {
    // 用户取消操作
  }
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

const getOrderStatusTagType = (status: OrderStatus) => {
  const typeMap = {
    [OrderStatus.PENDING]: 'warning',
    [OrderStatus.ONGOING]: 'success',
    [OrderStatus.COMPLETED]: 'info',
    [OrderStatus.CANCELLED]: 'danger'
  }
  return typeMap[status] || 'info'
}

const getOrderTypeText = (type: OrderType) => {
  const typeMap = {
    [OrderType.SHORT_TERM]: '短期租赁',
    [OrderType.LONG_TERM]: '长期租赁',
    [OrderType.MAINTENANCE]: '维修服务',
    [OrderType.TECHNICAL_SUPPORT]: '技术支持'
  }
  return typeMap[type] || '未知'
}

const getOrderTypeTagType = (type: OrderType) => {
  const typeMap = {
    [OrderType.SHORT_TERM]: 'primary',
    [OrderType.LONG_TERM]: 'success',
    [OrderType.MAINTENANCE]: 'warning',
    [OrderType.TECHNICAL_SUPPORT]: 'info'
  }
  return typeMap[type] || 'info'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadOrderList()
})
</script>

<style lang="scss" scoped>
.orders-container {
  padding: 20px;
  
  .page-header {
    margin-bottom: 20px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .page-title {
        margin: 0;
        font-size: 24px;
        color: #333;
      }
    }
    
    .search-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
  
  .table-section {
    .amount {
      color: #67C23A;
      font-weight: bold;
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
  
  .batch-operations {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    
    .batch-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      min-width: 300px;
      
      .batch-actions {
        display: flex;
        gap: 10px;
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .orders-container {
    padding: 10px;
    
    .page-header {
      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
        
        .page-title {
          font-size: 20px;
        }
      }
      
      .search-section {
        padding: 15px;
        
        .el-col {
          margin-bottom: 15px;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
    
    .batch-operations {
      .batch-content {
        flex-direction: column;
        gap: 10px;
        text-align: center;
        
        .batch-actions {
          justify-content: center;
        }
      }
    }
  }
}
</style>
