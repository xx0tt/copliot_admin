<template>
  <div class="order-form-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" type="text">
          <el-icon><ArrowLeft /></el-icon>
          返回订单列表
        </el-button>
        <h2 class="page-title">{{ isEdit ? '编辑订单' : '新建订单' }}</h2>
      </div>
      <div class="header-right">
        <el-button @click="saveDraft" v-if="!isEdit">
          <el-icon><Document /></el-icon>
          保存草稿
        </el-button>
        <el-button type="primary" @click="submitOrder" :loading="submitting">
          <el-icon><Check /></el-icon>
          {{ isEdit ? '更新订单' : '提交订单' }}
        </el-button>
      </div>
    </div>

    <!-- 订单表单 -->
    <div class="form-content">
      <el-form
        ref="orderFormRef"
        :model="orderForm"
        :rules="formRules"
        label-width="120px"
        size="default"
      >
        <!-- 基本信息 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="订单类型" prop="type">
                <el-select v-model="orderForm.type" placeholder="请选择订单类型">
                  <el-option 
                    v-for="type in orderTypeOptions" 
                    :key="type.value"
                    :label="type.label" 
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="优先级" prop="priority">
                <el-select v-model="orderForm.priority" placeholder="请选择优先级">
                  <el-option label="普通" value="normal" />
                  <el-option label="紧急" value="urgent" />
                  <el-option label="非常紧急" value="critical" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="开始日期" prop="startDate">
                <el-date-picker
                  v-model="orderForm.startDate"
                  type="date"
                  placeholder="选择开始日期"
                  style="width: 100%"
                  :disabled-date="disabledStartDate"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="结束日期" prop="endDate">
                <el-date-picker
                  v-model="orderForm.endDate"
                  type="date"
                  placeholder="选择结束日期"
                  style="width: 100%"
                  :disabled-date="disabledEndDate"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 客户信息 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">客户信息</span>
              <el-button type="text" @click="selectCustomer">
                从客户库选择
              </el-button>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="客户名称" prop="customerName">
                <el-input v-model="orderForm.customerName" placeholder="请输入客户名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="联系人" prop="contactPerson">
                <el-input v-model="orderForm.contactPerson" placeholder="请输入联系人姓名" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="联系电话" prop="contactPhone">
                <el-input v-model="orderForm.contactPhone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="邮箱地址" prop="contactEmail">
                <el-input v-model="orderForm.contactEmail" placeholder="请输入邮箱地址" />
              </el-form-item>
            </el-col>
            <el-col :xs="24">
              <el-form-item label="项目地址" prop="projectAddress">
                <el-input
                  v-model="orderForm.projectAddress"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入项目详细地址"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 设备信息 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">设备信息</span>
              <el-button type="primary" @click="addEquipment">
                <el-icon><Plus /></el-icon>
                添加设备
              </el-button>
            </div>
          </template>
          
          <el-table :data="orderForm.items" stripe>
            <el-table-column label="设备名称" width="200">
              <template #default="{ row, $index }">
                <el-select
                  v-model="row.equipmentId"
                  placeholder="选择设备"
                  filterable
                  @change="onEquipmentChange(row, $index)"
                >
                  <el-option
                    v-for="equipment in availableEquipment"
                    :key="equipment.id"
                    :label="equipment.name"
                    :value="equipment.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            
            <el-table-column label="设备型号" width="150">
              <template #default="{ row }">
                {{ row.equipmentModel || '-' }}
              </template>
            </el-table-column>
            
            <el-table-column label="数量" width="100">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  :max="100"
                  @change="calculateSubtotal(row, $index)"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="单价/天" width="120">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.unitPrice"
                  :precision="2"
                  :min="0"
                  @change="calculateSubtotal(row, $index)"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="小计" width="120">
              <template #default="{ row }">
                <span class="amount">¥{{ row.subtotal.toLocaleString() }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="备注">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="设备备注" />
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeEquipment($index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div v-if="orderForm.items.length === 0" class="empty-equipment">
            <el-empty description="暂未添加设备" />
          </div>
        </el-card>

        <!-- 费用信息 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <span class="card-title">费用信息</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :xs="24" :md="16">
              <el-row :gutter="20">
                <el-col :xs="24" :md="12">
                  <el-form-item label="运输费用" prop="transportFee">
                    <el-input-number
                      v-model="orderForm.transportFee"
                      :precision="2"
                      :min="0"
                      @change="calculateTotal"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="保险费用" prop="insuranceFee">
                    <el-input-number
                      v-model="orderForm.insuranceFee"
                      :precision="2"
                      :min="0"
                      @change="calculateTotal"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="其他费用" prop="otherFee">
                    <el-input-number
                      v-model="orderForm.otherFee"
                      :precision="2"
                      :min="0"
                      @change="calculateTotal"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="优惠金额" prop="discountAmount">
                    <el-input-number
                      v-model="orderForm.discountAmount"
                      :precision="2"
                      :min="0"
                      @change="calculateTotal"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
            <el-col :xs="24" :md="8">
              <div class="cost-summary">
                <div class="summary-item">
                  <span>设备租赁费:</span>
                  <span class="amount">¥{{ rentalAmount.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <span>运输费用:</span>
                  <span class="amount">¥{{ orderForm.transportFee.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <span>保险费用:</span>
                  <span class="amount">¥{{ orderForm.insuranceFee.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <span>其他费用:</span>
                  <span class="amount">¥{{ orderForm.otherFee.toLocaleString() }}</span>
                </div>
                <div class="summary-item discount">
                  <span>优惠金额:</span>
                  <span class="discount-amount">-¥{{ orderForm.discountAmount.toLocaleString() }}</span>
                </div>
                <div class="summary-item total">
                  <span>订单总金额:</span>
                  <span class="total-amount">¥{{ totalAmount.toLocaleString() }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 附加信息 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <span class="card-title">附加信息</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="订单备注">
                <el-input
                  v-model="orderForm.remark"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入订单备注信息"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="附件上传">
                <el-upload
                  v-model:file-list="orderForm.attachments"
                  action="#"
                  :auto-upload="false"
                  multiple
                  :limit="5"
                  :on-exceed="handleExceed"
                >
                  <el-button type="primary">
                    <el-icon><Upload /></el-icon>
                    选择文件
                  </el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持上传jpg/png/pdf文件，且不超过2MB，最多5个文件
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
      </el-form>
    </div>

    <!-- 客户选择对话框 -->
    <el-dialog
      v-model="customerDialogVisible"
      title="选择客户"
      width="800px"
    >
      <el-table
        :data="customerList"
        @row-click="selectCustomerFromList"
        highlight-current-row
      >
        <el-table-column prop="name" label="客户名称" />
        <el-table-column prop="contactPerson" label="联系人" />
        <el-table-column prop="contactPhone" label="联系电话" />
        <el-table-column prop="email" label="邮箱" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Check, 
  Document, 
  Plus, 
  Upload 
} from '@element-plus/icons-vue'
import { OrderType } from '@/types/order'

const route = useRoute()
const router = useRouter()

// 响应式数据
const orderFormRef = ref()
const submitting = ref(false)
const customerDialogVisible = ref(false)

// 是否为编辑模式
const isEdit = computed(() => route.path.includes('edit'))

// 订单表单数据
const orderForm = reactive({
  type: '',
  priority: 'normal',
  startDate: '',
  endDate: '',
  customerName: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  projectAddress: '',
  items: [] as any[],
  transportFee: 0,
  insuranceFee: 0,
  otherFee: 0,
  discountAmount: 0,
  remark: '',
  attachments: [] as any[]
})

// 表单验证规则
const formRules = {
  type: [{ required: true, message: '请选择订单类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  contactEmail: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 订单类型选项
const orderTypeOptions = [
  { label: '短期租赁', value: OrderType.SHORT_TERM },
  { label: '长期租赁', value: OrderType.LONG_TERM },
  { label: '维修服务', value: OrderType.MAINTENANCE },
  { label: '技术支持', value: OrderType.TECHNICAL_SUPPORT }
]

// 可用设备列表
const availableEquipment = ref([
  { id: 'EQ001', name: '挖掘机CAT320D', model: 'CAT320D', unitPrice: 1500 },
  { id: 'EQ002', name: '起重机QTZ63', model: 'QTZ63', unitPrice: 2000 },
  { id: 'EQ003', name: '装载机LG936L', model: 'LG936L', unitPrice: 1200 },
  { id: 'EQ004', name: '推土机SD16', model: 'SD16', unitPrice: 1800 },
  { id: 'EQ005', name: '压路机YZ12', model: 'YZ12', unitPrice: 1000 }
])

// 客户列表
const customerList = ref([
  {
    id: '1',
    name: '张三建设集团',
    contactPerson: '张经理',
    contactPhone: '13800138000',
    email: 'zhang@example.com'
  },
  {
    id: '2',
    name: '李四工程公司',
    contactPerson: '李总',
    contactPhone: '13900139000',
    email: 'li@example.com'
  }
])

// 计算属性
const rentalAmount = computed(() => {
  if (!orderForm.items.length || !orderForm.startDate || !orderForm.endDate) {
    return 0
  }
  
  const days = calculateRentalDays()
  return orderForm.items.reduce((total, item) => {
    return total + (item.quantity * item.unitPrice * days)
  }, 0)
})

const totalAmount = computed(() => {
  return Math.max(0, rentalAmount.value + orderForm.transportFee + orderForm.insuranceFee + orderForm.otherFee - orderForm.discountAmount)
})

// 方法
const calculateRentalDays = () => {
  if (!orderForm.startDate || !orderForm.endDate) return 0
  
  const start = new Date(orderForm.startDate)
  const end = new Date(orderForm.endDate)
  const timeDiff = end.getTime() - start.getTime()
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

const disabledStartDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

const disabledEndDate = (time: Date) => {
  if (!orderForm.startDate) return time.getTime() < Date.now()
  return time.getTime() <= new Date(orderForm.startDate).getTime()
}

const addEquipment = () => {
  orderForm.items.push({
    equipmentId: '',
    equipmentName: '',
    equipmentModel: '',
    quantity: 1,
    unitPrice: 0,
    subtotal: 0,
    remark: ''
  })
}

const removeEquipment = (index: number) => {
  orderForm.items.splice(index, 1)
  calculateTotal()
}

const onEquipmentChange = (row: any, index: number) => {
  const equipment = availableEquipment.value.find(eq => eq.id === row.equipmentId)
  if (equipment) {
    row.equipmentName = equipment.name
    row.equipmentModel = equipment.model
    row.unitPrice = equipment.unitPrice
    calculateSubtotal(row, index)
  }
}

const calculateSubtotal = (row: any, index: number) => {
  const days = calculateRentalDays()
  row.subtotal = row.quantity * row.unitPrice * days
  calculateTotal()
}

const calculateTotal = () => {
  // 触发响应式更新
  orderForm.transportFee = orderForm.transportFee
}

const selectCustomer = () => {
  customerDialogVisible.value = true
}

const selectCustomerFromList = (customer: any) => {
  orderForm.customerName = customer.name
  orderForm.contactPerson = customer.contactPerson
  orderForm.contactPhone = customer.contactPhone
  orderForm.contactEmail = customer.email
  customerDialogVisible.value = false
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传5个文件')
}

const saveDraft = async () => {
  try {
    // TODO: 保存草稿API
    ElMessage.success('草稿保存成功')
  } catch (error) {
    ElMessage.error('保存草稿失败')
  }
}

const submitOrder = async () => {
  if (!orderFormRef.value) return
  
  try {
    await orderFormRef.value.validate()
    
    if (orderForm.items.length === 0) {
      ElMessage.warning('请至少添加一个设备')
      return
    }
    
    submitting.value = true
    
    // 构建提交数据
    const submitData = {
      ...orderForm,
      rentalAmount: rentalAmount.value,
      totalAmount: totalAmount.value
    }
    
    // TODO: 调用创建/更新订单API
    console.log('Submit order:', submitData)
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    ElMessage.success(isEdit.value ? '订单更新成功' : '订单创建成功')
    goBack()
  } catch (error) {
    console.error('Submit order error:', error)
    ElMessage.error(isEdit.value ? '订单更新失败' : '订单创建失败')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/orders')
}

const loadOrderData = async () => {
  if (isEdit.value) {
    const orderId = route.params.id as string
    // TODO: 加载订单数据
    console.log('Loading order:', orderId)
  }
}

// 生命周期
onMounted(() => {
  loadOrderData()
})
</script>

<style lang="scss" scoped>
.order-form-container {
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
    
    .header-right {
      display: flex;
      gap: 10px;
    }
  }
  
  .form-content {
    .form-card {
      margin-bottom: 20px;
      
      .card-title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .amount {
        color: #67C23A;
        font-weight: bold;
      }
      
      .empty-equipment {
        padding: 40px 0;
        text-align: center;
      }
      
      .cost-summary {
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
            font-weight: bold;
            
            .total-amount {
              color: #67C23A;
              font-size: 18px;
            }
          }
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .order-form-container {
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
        justify-content: center;
      }
    }
    
    .form-content {
      .form-card {
        .cost-summary {
          margin-top: 20px;
        }
      }
    }
  }
}
</style>
