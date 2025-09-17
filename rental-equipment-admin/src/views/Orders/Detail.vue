<template>
  <div class="order-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" type="text">
          <el-icon><ArrowLeft /></el-icon>
          返回订单列表
        </el-button>
        <h2 class="page-title">订单详情</h2>
      </div>
      <div class="header-right">
        <el-button-group v-if="orderDetail">
          <el-button 
            v-if="canEditOrder(orderDetail.status)"
            type="primary" 
            @click="editOrder"
          >
            <el-icon><Edit /></el-icon>
            编辑订单
          </el-button>
          <el-button 
            v-if="canCancelOrder(orderDetail.status)"
            type="danger" 
            @click="cancelOrder"
          >
            <el-icon><Delete /></el-icon>
            取消订单
          </el-button>
          <el-button @click="printOrder">
            <el-icon><Printer /></el-icon>
            打印订单
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-loading="loading" class="loading-container" v-if="loading">
      <div style="height: 400px;"></div>
    </div>

    <!-- 订单信息 -->
    <div v-else-if="orderDetail" class="order-content">
      <!-- 订单基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">订单基本信息</span>
            <el-tag 
              :type="getOrderStatusTagType(orderDetail.status)" 
              size="large"
            >
              {{ getOrderStatusText(orderDetail.status) }}
            </el-tag>
          </div>
        </template>
        
        <el-row :gutter="30">
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <label>订单号:</label>
              <span class="order-number">{{ orderDetail.orderNumber }}</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <label>订单类型:</label>
              <el-tag :type="getOrderTypeTagType(orderDetail.type)">
                {{ getOrderTypeText(orderDetail.type) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <label>创建时间:</label>
              <span>{{ formatDateTime(orderDetail.createTime) }}</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <label>开始日期:</label>
              <span>{{ formatDate(orderDetail.startDate) }}</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <label>结束日期:</label>
              <span>{{ formatDate(orderDetail.endDate) }}</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <label>租赁天数:</label>
              <span>{{ calculateRentalDays() }} 天</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 客户信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">客户信息</span>
          </div>
        </template>
        
        <el-row :gutter="30">
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <label>客户名称:</label>
              <span>{{ orderDetail.customerName }}</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <label>联系人:</label>
              <span>{{ orderDetail.contactPerson || '-' }}</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <label>联系电话:</label>
              <span>{{ orderDetail.contactPhone || '-' }}</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <label>邮箱地址:</label>
              <span>{{ orderDetail.contactEmail || '-' }}</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="16">
            <div class="info-item">
              <label>项目地址:</label>
              <span>{{ orderDetail.projectAddress || '-' }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 设备信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">设备信息</span>
          </div>
        </template>
        
        <el-table :data="orderDetail.items" stripe>
          <el-table-column prop="equipmentName" label="设备名称" width="200" />
          <el-table-column prop="equipmentModel" label="设备型号" width="150" />
          <el-table-column prop="quantity" label="数量" width="80">
            <template #default="{ row }">
              {{ row.quantity }} 台
            </template>
          </el-table-column>
          <el-table-column prop="unitPrice" label="单价/天" width="120">
            <template #default="{ row }">
              ¥{{ row.unitPrice.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" width="120">
            <template #default="{ row }">
              <span class="amount">¥{{ row.subtotal.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </el-table>
      </el-card>

      <!-- 费用明细 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">费用明细</span>
          </div>
        </template>
        
        <div class="cost-details">
          <el-row :gutter="20">
            <el-col :xs="24" :md="16">
              <el-table :data="costBreakdown" stripe>
                <el-table-column prop="item" label="费用项目" />
                <el-table-column prop="amount" label="金额">
                  <template #default="{ row }">
                    <span :class="{ 'amount': row.item !== '优惠金额' }">
                      {{ row.item === '优惠金额' ? '-' : '' }}¥{{ Math.abs(row.amount).toLocaleString() }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="说明" show-overflow-tooltip />
              </el-table>
            </el-col>
            <el-col :xs="24" :md="8">
              <div class="total-summary">
                <div class="summary-item">
                  <label>设备租赁费:</label>
                  <span class="amount">¥{{ orderDetail.rentalAmount.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <label>运输费用:</label>
                  <span class="amount">¥{{ orderDetail.transportFee.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <label>保险费用:</label>
                  <span class="amount">¥{{ orderDetail.insuranceFee.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <label>其他费用:</label>
                  <span class="amount">¥{{ orderDetail.otherFee.toLocaleString() }}</span>
                </div>
                <div class="summary-item discount">
                  <label>优惠金额:</label>
                  <span class="discount-amount">-¥{{ orderDetail.discountAmount.toLocaleString() }}</span>
                </div>
                <div class="summary-item total">
                  <label>订单总金额:</label>
                  <span class="total-amount">¥{{ orderDetail.totalAmount.toLocaleString() }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 订单进度 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">订单进度</span>
          </div>
        </template>
        
        <el-timeline>
          <el-timeline-item
            v-for="(step, index) in orderProgress"
            :key="index"
            :timestamp="step.time"
            :type="step.type"
          >
            <div class="timeline-content">
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
              <span v-if="step.operator" class="operator">操作人: {{ step.operator }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 附件和备注 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">附件和备注</span>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <div class="section">
              <h4>订单附件</h4>
              <div class="attachments">
                <div 
                  v-for="file in orderDetail.attachments"
                  :key="file.id"
                  class="file-item"
                  @click="downloadFile(file)"
                >
                  <el-icon><Document /></el-icon>
                  <span>{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
                <div v-if="orderDetail.attachments.length === 0" class="empty-attachments">
                  暂无附件
                </div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :md="12">
            <div class="section">
              <h4>订单备注</h4>
              <div class="remark-content">
                {{ orderDetail.remark || '暂无备注' }}
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-result
        icon="warning"
        title="订单不存在"
        sub-title="请检查订单号是否正确或联系管理员"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">返回订单列表</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Edit, 
  Delete, 
  Printer, 
  Document 
} from '@element-plus/icons-vue'
import { Order, OrderStatus, OrderType } from '@/types/order'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const orderDetail = ref<Order | null>(null)

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

// 费用明细数据
const costBreakdown = computed(() => {
  if (!orderDetail.value) return []
  
  return [
    {
      item: '设备租赁费',
      amount: orderDetail.value.rentalAmount,
      description: '按天计算的设备租赁费用'
    },
    {
      item: '运输费用',
      amount: orderDetail.value.transportFee,
      description: '设备运输和安装费用'
    },
    {
      item: '保险费用',
      amount: orderDetail.value.insuranceFee,
      description: '设备租赁期间的保险费用'
    },
    {
      item: '其他费用',
      amount: orderDetail.value.otherFee,
      description: '其他杂项费用'
    },
    {
      item: '优惠金额',
      amount: -orderDetail.value.discountAmount,
      description: '折扣和优惠减免金额'
    }
  ]
})

// 订单进度数据
const orderProgress = computed(() => {
  return [
    {
      title: '订单已创建',
      description: '订单创建成功，等待审核确认',
      time: '2024-01-01 09:30:00',
      type: 'primary',
      operator: '张三'
    },
    {
      title: '订单已确认',
      description: '订单信息已确认，开始安排设备',
      time: '2024-01-01 10:15:00',
      type: 'success',
      operator: '李四'
    },
    {
      title: '设备已发出',
      description: '设备已从仓库发出，正在运输中',
      time: '2024-01-01 14:20:00',
      type: 'success',
      operator: '王五'
    },
    {
      title: '设备已到达',
      description: '设备已到达现场，开始安装调试',
      time: '2024-01-02 08:30:00',
      type: 'success',
      operator: '赵六'
    }
  ]
})

// 方法
const loadOrderDetail = async () => {
  loading.value = true
  try {
    const orderId = route.params.id as string
    
    // TODO: 调用API获取订单详情
    // const response = await getOrderDetail(orderId)
    // orderDetail.value = response.data
    
    // 模拟数据
    orderDetail.value = {
      id: orderId,
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
          orderId: orderId,
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
  } catch (error) {
    ElMessage.error('加载订单详情失败')
    console.error('Load order detail error:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/orders')
}

const editOrder = () => {
  if (orderDetail.value) {
    router.push(`/orders/edit/${orderDetail.value.id}`)
  }
}

const cancelOrder = async () => {
  if (!orderDetail.value) return
  
  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${orderDetail.value.orderNumber} 吗？取消后不可恢复。`,
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用取消订单API
    ElMessage.success('订单取消成功')
    goBack()
  } catch (error) {
    // 用户取消操作
  }
}

const printOrder = () => {
  window.print()
}

const downloadFile = (file: any) => {
  // TODO: 实现文件下载
  ElMessage.info(`下载文件: ${file.name}`)
}

const calculateRentalDays = () => {
  if (!orderDetail.value) return 0
  
  const start = new Date(orderDetail.value.startDate)
  const end = new Date(orderDetail.value.endDate)
  const timeDiff = end.getTime() - start.getTime()
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
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

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生命周期
onMounted(() => {
  loadOrderDetail()
})
</script>

<style lang="scss" scoped>
.order-detail-container {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .page-title {
        margin: 0;
        font-size: 24px;
        color: #333;
      }
    }
  }
  
  .loading-container {
    min-height: 400px;
  }
  
  .order-content {
    .info-card {
      margin-bottom: 20px;
      
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
      
      .info-item {
        margin-bottom: 15px;
        
        label {
          display: inline-block;
          width: 100px;
          color: #666;
          font-weight: 500;
        }
        
        .order-number {
          color: #409EFF;
          font-weight: bold;
        }
      }
      
      .amount {
        color: #67C23A;
        font-weight: bold;
      }
      
      .cost-details {
        .total-summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            label {
              color: #666;
              font-weight: 500;
            }
            
            &.discount {
              .discount-amount {
                color: #F56C6C;
                font-weight: bold;
              }
            }
            
            &.total {
              border-top: 1px solid #ddd;
              padding-top: 12px;
              margin-top: 12px;
              
              label {
                color: #333;
                font-weight: bold;
                font-size: 16px;
              }
              
              .total-amount {
                color: #67C23A;
                font-weight: bold;
                font-size: 18px;
              }
            }
          }
        }
      }
      
      .timeline-content {
        h4 {
          margin: 0 0 8px 0;
          color: #333;
        }
        
        p {
          margin: 0 0 8px 0;
          color: #666;
        }
        
        .operator {
          font-size: 12px;
          color: #999;
        }
      }
      
      .section {
        h4 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 14px;
        }
        
        .attachments {
          .file-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border: 1px solid #e4e7ed;
            border-radius: 4px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
            
            &:hover {
              background-color: #f5f7fa;
              border-color: #409EFF;
            }
            
            .file-size {
              margin-left: auto;
              font-size: 12px;
              color: #999;
            }
          }
          
          .empty-attachments {
            color: #999;
            text-align: center;
            padding: 40px 0;
          }
        }
        
        .remark-content {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          color: #666;
          line-height: 1.6;
          min-height: 80px;
        }
      }
    }
  }
  
  .error-container {
    padding: 40px 0;
  }
}

// 打印样式
@media print {
  .page-header .header-right {
    display: none;
  }
  
  .order-detail-container {
    padding: 0;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .order-detail-container {
    padding: 10px;
    
    .page-header {
      flex-direction: column;
      align-items: stretch;
      gap: 15px;
      
      .header-left {
        justify-content: space-between;
        
        .page-title {
          font-size: 20px;
        }
      }
      
      .header-right {
        .el-button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }
    }
    
    .order-content {
      .info-card {
        .cost-details {
          .el-row {
            flex-direction: column-reverse;
          }
        }
        
        .info-item {
          label {
            width: 80px;
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
