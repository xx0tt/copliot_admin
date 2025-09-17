<template>
  <div class="customer-service-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>客户服务</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddCustomer = true">
          <el-icon><UserFilled /></el-icon>
          新增客户
        </el-button>
        <el-button @click="showAddTicket = true">
          <el-icon><Document /></el-icon>
          创建工单
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalCustomers }}</div>
          <div class="stat-label">总客户数</div>
        </div>
        <el-icon class="stat-icon customers"><UserFilled /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.newCustomersThisMonth }}</div>
          <div class="stat-label">本月新增</div>
        </div>
        <el-icon class="stat-icon new-customers"><Plus /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.pendingTickets }}</div>
          <div class="stat-label">待处理工单</div>
        </div>
        <el-icon class="stat-icon pending"><DocumentCopy /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.avgResponseTime }}h</div>
          <div class="stat-label">平均响应时间</div>
        </div>
        <el-icon class="stat-icon response-time"><Timer /></el-icon>
      </el-card>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="main-tabs">
      <!-- 客户管理 -->
      <el-tab-pane label="客户管理" name="customers">
        <div class="tab-content">
          <!-- 搜索筛选 -->
          <el-card class="search-card">
            <el-form :inline="true" :model="customerSearch" class="search-form">
              <el-form-item label="客户名称">
                <el-input
                  v-model="customerSearch.name"
                  placeholder="请输入客户名称"
                  clearable
                />
              </el-form-item>
              <el-form-item label="联系电话">
                <el-input
                  v-model="customerSearch.phone"
                  placeholder="请输入联系电话"
                  clearable
                />
              </el-form-item>
              <el-form-item label="客户类型">
                <el-select v-model="customerSearch.customerType" placeholder="请选择类型" clearable>
                  <el-option label="个人" value="individual" />
                  <el-option label="企业" value="company" />
                  <el-option label="政府" value="government" />
                </el-select>
              </el-form-item>
              <el-form-item label="客户等级">
                <el-select v-model="customerSearch.level" placeholder="请选择等级" clearable>
                  <el-option label="铜牌" value="bronze" />
                  <el-option label="银牌" value="silver" />
                  <el-option label="金牌" value="gold" />
                  <el-option label="白金" value="platinum" />
                  <el-option label="VIP" value="vip" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="customerSearch.status" placeholder="请选择状态" clearable>
                  <el-option label="正常" value="active" />
                  <el-option label="停用" value="inactive" />
                  <el-option label="黑名单" value="blacklist" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadCustomers">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="resetCustomerSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 客户列表 -->
          <el-card>
            <template #header>
              <span>客户列表</span>
            </template>
            
            <el-table
              :data="customers"
              :loading="customerLoading"
              row-key="id"
              stripe
            >
              <el-table-column prop="name" label="客户名称" min-width="120">
                <template #default="{ row }">
                  <div class="customer-info">
                    <div class="name">{{ row.name }}</div>
                    <div class="company" v-if="row.company">{{ row.company }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="phone" label="联系电话" width="130" />
              <el-table-column prop="email" label="邮箱" min-width="160" />
              <el-table-column prop="customerType" label="类型" width="80">
                <template #default="{ row }">
                  <el-tag :type="getCustomerTypeColor(row.customerType)" size="small">
                    {{ getCustomerTypeText(row.customerType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="level" label="等级" width="80">
                <template #default="{ row }">
                  <el-tag :type="getCustomerLevelColor(row.level)" size="small">
                    {{ getCustomerLevelText(row.level) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="订单统计" width="120">
                <template #default="{ row }">
                  <div class="order-stats">
                    <div>{{ row.totalOrders }}笔</div>
                    <div class="amount">¥{{ row.totalAmount.toLocaleString() }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="lastOrderDate" label="最近订单" width="120" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="getCustomerStatusColor(row.status)" size="small">
                    {{ getCustomerStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" text @click="viewCustomer(row)">
                    详情
                  </el-button>
                  <el-button type="success" text @click="editCustomer(row)">
                    编辑
                  </el-button>
                  <el-button type="warning" text @click="createTicketForCustomer(row)">
                    工单
                  </el-button>
                  <el-button type="danger" text @click="deleteCustomer(row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="customerPagination.page"
                v-model:page-size="customerPagination.size"
                :total="customerPagination.total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="loadCustomers"
                @current-change="loadCustomers"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 工单管理 -->
      <el-tab-pane label="工单管理" name="tickets">
        <div class="tab-content">
          <!-- 工单筛选 -->
          <el-card class="search-card">
            <el-form :inline="true" :model="ticketSearch" class="search-form">
              <el-form-item label="工单类型">
                <el-select v-model="ticketSearch.type" placeholder="请选择类型" clearable>
                  <el-option label="咨询" value="consultation" />
                  <el-option label="投诉" value="complaint" />
                  <el-option label="技术支持" value="technical_support" />
                  <el-option label="退货申请" value="return_request" />
                  <el-option label="维修" value="maintenance" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
              <el-form-item label="优先级">
                <el-select v-model="ticketSearch.priority" placeholder="请选择优先级" clearable>
                  <el-option label="低" value="low" />
                  <el-option label="中" value="medium" />
                  <el-option label="高" value="high" />
                  <el-option label="紧急" value="urgent" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="ticketSearch.status" placeholder="请选择状态" clearable>
                  <el-option label="待处理" value="open" />
                  <el-option label="处理中" value="in_progress" />
                  <el-option label="等待客户" value="pending_customer" />
                  <el-option label="已解决" value="resolved" />
                  <el-option label="已关闭" value="closed" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadTickets">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="resetTicketSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 工单列表 -->
          <el-card>
            <template #header>
              <span>工单列表</span>
            </template>
            
            <el-table
              :data="tickets"
              :loading="ticketLoading"
              row-key="id"
              stripe
            >
              <el-table-column prop="id" label="工单号" width="120">
                <template #default="{ row }">
                  <el-link type="primary" @click="viewTicket(row)">
                    #{{ row.id.slice(-8) }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
              <el-table-column prop="customerName" label="客户" width="120" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getTicketTypeColor(row.type)" size="small">
                    {{ getTicketTypeText(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="80">
                <template #default="{ row }">
                  <el-tag :type="getTicketPriorityColor(row.priority)" size="small">
                    {{ getTicketPriorityText(row.priority) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getTicketStatusColor(row.status)" size="small">
                    {{ getTicketStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="assigneeName" label="处理人" width="100" />
              <el-table-column prop="createdAt" label="创建时间" width="160" />
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" text @click="viewTicket(row)">
                    查看
                  </el-button>
                  <el-button 
                    v-if="row.status === 'open'"
                    type="success" 
                    text 
                    @click="assignTicketDialog(row)"
                  >
                    分配
                  </el-button>
                  <el-button 
                    v-if="row.status !== 'closed'"
                    type="warning" 
                    text 
                    @click="closeTicketConfirm(row)"
                  >
                    关闭
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="ticketPagination.page"
                v-model:page-size="ticketPagination.size"
                :total="ticketPagination.total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="loadTickets"
                @current-change="loadTickets"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑客户对话框 -->
    <el-dialog
      v-model="showAddCustomer"
      :title="editingCustomer ? '编辑客户' : '新增客户'"
      width="600px"
    >
      <el-form
        ref="customerFormRef"
        :model="customerForm"
        :rules="customerRules"
        label-width="100px"
      >
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="customerForm.name" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="customerForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="customerForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="客户类型" prop="customerType">
          <el-radio-group v-model="customerForm.customerType">
            <el-radio label="individual">个人</el-radio>
            <el-radio label="company">企业</el-radio>
            <el-radio label="government">政府</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="公司名称" v-if="customerForm.customerType === 'company'">
          <el-input v-model="customerForm.company" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="联系人" v-if="customerForm.customerType === 'company'">
          <el-input v-model="customerForm.contactPerson" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="customerForm.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="客户等级">
          <el-select v-model="customerForm.level" placeholder="请选择客户等级">
            <el-option label="铜牌" value="bronze" />
            <el-option label="银牌" value="silver" />
            <el-option label="金牌" value="gold" />
            <el-option label="白金" value="platinum" />
            <el-option label="VIP" value="vip" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="customerForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddCustomer = false">取消</el-button>
        <el-button type="primary" @click="saveCustomer" :loading="saving">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 创建工单对话框 -->
    <el-dialog
      v-model="showAddTicket"
      title="创建工单"
      width="600px"
    >
      <el-form
        ref="ticketFormRef"
        :model="ticketForm"
        :rules="ticketRules"
        label-width="100px"
      >
        <el-form-item label="客户" prop="customerId">
          <el-select
            v-model="ticketForm.customerId"
            placeholder="请选择客户"
            filterable
            remote
            :remote-method="searchCustomers"
            style="width: 100%"
          >
            <el-option
              v-for="customer in customerOptions"
              :key="customer.id"
              :label="`${customer.name} (${customer.phone})`"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工单标题" prop="title">
          <el-input v-model="ticketForm.title" placeholder="请输入工单标题" />
        </el-form-item>
        <el-form-item label="工单类型" prop="type">
          <el-select v-model="ticketForm.type" placeholder="请选择工单类型">
            <el-option label="咨询" value="consultation" />
            <el-option label="投诉" value="complaint" />
            <el-option label="技术支持" value="technical_support" />
            <el-option label="退货申请" value="return_request" />
            <el-option label="维修" value="maintenance" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="ticketForm.priority">
            <el-radio label="low">低</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="high">高</el-radio>
            <el-radio label="urgent">紧急</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="相关订单">
          <el-input v-model="ticketForm.orderId" placeholder="请输入订单号（可选）" />
        </el-form-item>
        <el-form-item label="相关设备">
          <el-input v-model="ticketForm.equipmentId" placeholder="请输入设备ID（可选）" />
        </el-form-item>
        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="ticketForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述问题"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddTicket = false">取消</el-button>
        <el-button type="primary" @click="saveTicket" :loading="saving">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  UserFilled, Document, Plus, Search, DocumentCopy, Timer
} from '@element-plus/icons-vue'
import { 
  getCustomers, createCustomer, updateCustomer, deleteCustomer as deleteCustomerApi,
  getServiceTickets, createServiceTicket, getCustomerStats
} from '@/api/customer'
import type { 
  Customer, ServiceTicket, CustomerStats, CustomerType, CustomerLevel, 
  CustomerStatus, TicketType, TicketPriority, TicketStatus
} from '@/types/customer'

// 响应式数据
const activeTab = ref('customers')
const customerLoading = ref(false)
const ticketLoading = ref(false)
const saving = ref(false)

// 数据列表
const customers = ref<Customer[]>([])
const tickets = ref<ServiceTicket[]>([])
const customerOptions = ref<Customer[]>([])

// 对话框显示状态
const showAddCustomer = ref(false)
const showAddTicket = ref(false)

// 编辑状态
const editingCustomer = ref<Customer | null>(null)

// 统计数据
const stats = reactive<CustomerStats>({
  totalCustomers: 0,
  newCustomersThisMonth: 0,
  activeCustomers: 0,
  vipCustomers: 0,
  totalTickets: 0,
  pendingTickets: 0,
  resolvedTickets: 0,
  avgResponseTime: 0
})

// 搜索表单
const customerSearch = reactive({
  name: '',
  phone: '',
  customerType: '',
  level: '',
  status: ''
})

const ticketSearch = reactive({
  type: '',
  priority: '',
  status: ''
})

// 分页数据
const customerPagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const ticketPagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 表单数据
const customerForm = reactive({
  name: '',
  phone: '',
  email: '',
  company: '',
  contactPerson: '',
  customerType: 'individual' as CustomerType,
  level: 'bronze' as CustomerLevel,
  address: '',
  remarks: ''
})

const ticketForm = reactive({
  customerId: '',
  title: '',
  description: '',
  type: 'consultation' as TicketType,
  priority: 'medium' as TicketPriority,
  orderId: '',
  equipmentId: ''
})

// 表单引用和验证规则
const customerFormRef = ref<FormInstance>()
const ticketFormRef = ref<FormInstance>()

const customerRules: FormRules = {
  name: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ]
}

const ticketRules: FormRules = {
  customerId: [
    { required: true, message: '请选择客户', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入工单标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入问题描述', trigger: 'blur' }
  ]
}

// 初始化数据
onMounted(() => {
  loadCustomers()
  loadTickets()
  loadStats()
})

// 加载客户列表
const loadCustomers = async () => {
  try {
    customerLoading.value = true
    const params = {
      page: customerPagination.page,
      size: customerPagination.size,
      ...customerSearch
    }
    const response = await getCustomers(params)
    customers.value = response.data.list
    customerPagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载客户列表失败')
  } finally {
    customerLoading.value = false
  }
}

// 加载工单列表
const loadTickets = async () => {
  try {
    ticketLoading.value = true
    const params = {
      page: ticketPagination.page,
      size: ticketPagination.size,
      ...ticketSearch
    }
    const response = await getServiceTickets(params)
    tickets.value = response.data.list
    ticketPagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载工单列表失败')
  } finally {
    ticketLoading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await getCustomerStats()
    Object.assign(stats, response.data)
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

// 搜索客户
const searchCustomers = async (query: string) => {
  if (query) {
    try {
      const response = await getCustomers({ name: query, size: 20 })
      customerOptions.value = response.data.list
    } catch (error) {
      ElMessage.error('搜索客户失败')
    }
  }
}

// 重置客户搜索
const resetCustomerSearch = () => {
  Object.assign(customerSearch, {
    name: '',
    phone: '',
    customerType: '',
    level: '',
    status: ''
  })
  loadCustomers()
}

// 重置工单搜索
const resetTicketSearch = () => {
  Object.assign(ticketSearch, {
    type: '',
    priority: '',
    status: ''
  })
  loadTickets()
}

// 查看客户详情
const viewCustomer = (customer: Customer) => {
  // 跳转到客户详情页面
  console.log('查看客户详情:', customer)
}

// 编辑客户
const editCustomer = (customer: Customer) => {
  editingCustomer.value = customer
  Object.assign(customerForm, customer)
  showAddCustomer.value = true
}

// 为客户创建工单
const createTicketForCustomer = (customer: Customer) => {
  ticketForm.customerId = customer.id
  showAddTicket.value = true
}

// 查看工单详情
const viewTicket = (ticket: ServiceTicket) => {
  // 跳转到工单详情页面
  console.log('查看工单详情:', ticket)
}

// 保存客户
const saveCustomer = async () => {
  if (!customerFormRef.value) return
  
  try {
    await customerFormRef.value.validate()
    saving.value = true
    
    if (editingCustomer.value) {
      await updateCustomer(editingCustomer.value.id, customerForm)
      ElMessage.success('更新客户成功')
    } else {
      await createCustomer(customerForm)
      ElMessage.success('创建客户成功')
    }
    
    showAddCustomer.value = false
    resetCustomerForm()
    loadCustomers()
  } catch (error) {
    ElMessage.error('保存客户失败')
  } finally {
    saving.value = false
  }
}

// 保存工单
const saveTicket = async () => {
  if (!ticketFormRef.value) return
  
  try {
    await ticketFormRef.value.validate()
    saving.value = true
    
    await createServiceTicket(ticketForm)
    ElMessage.success('创建工单成功')
    
    showAddTicket.value = false
    resetTicketForm()
    loadTickets()
  } catch (error) {
    ElMessage.error('创建工单失败')
  } finally {
    saving.value = false
  }
}

// 删除客户
const deleteCustomer = async (customer: Customer) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除客户"${customer.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteCustomerApi(customer.id)
    ElMessage.success('删除客户成功')
    loadCustomers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除客户失败')
    }
  }
}

// 重置客户表单
const resetCustomerForm = () => {
  Object.assign(customerForm, {
    name: '',
    phone: '',
    email: '',
    company: '',
    contactPerson: '',
    customerType: 'individual',
    level: 'bronze',
    address: '',
    remarks: ''
  })
  editingCustomer.value = null
  customerFormRef.value?.resetFields()
}

// 重置工单表单
const resetTicketForm = () => {
  Object.assign(ticketForm, {
    customerId: '',
    title: '',
    description: '',
    type: 'consultation',
    priority: 'medium',
    orderId: '',
    equipmentId: ''
  })
  ticketFormRef.value?.resetFields()
}

// 获取客户类型颜色
const getCustomerTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    individual: '',
    company: 'success',
    government: 'warning'
  }
  return colors[type] || ''
}

// 获取客户类型文本
const getCustomerTypeText = (type: string) => {
  const texts: Record<string, string> = {
    individual: '个人',
    company: '企业',
    government: '政府'
  }
  return texts[type] || '未知'
}

// 获取客户等级颜色
const getCustomerLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    bronze: 'info',
    silver: '',
    gold: 'warning',
    platinum: 'success',
    vip: 'danger'
  }
  return colors[level] || 'info'
}

// 获取客户等级文本
const getCustomerLevelText = (level: string) => {
  const texts: Record<string, string> = {
    bronze: '铜牌',
    silver: '银牌',
    gold: '金牌',
    platinum: '白金',
    vip: 'VIP'
  }
  return texts[level] || '未知'
}

// 获取客户状态颜色
const getCustomerStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    blacklist: 'danger'
  }
  return colors[status] || 'info'
}

// 获取客户状态文本
const getCustomerStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '正常',
    inactive: '停用',
    blacklist: '黑名单'
  }
  return texts[status] || '未知'
}

// 获取工单类型颜色
const getTicketTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    consultation: 'success',
    complaint: 'danger',
    technical_support: 'warning',
    return_request: 'info',
    maintenance: 'warning',
    other: ''
  }
  return colors[type] || ''
}

// 获取工单类型文本
const getTicketTypeText = (type: string) => {
  const texts: Record<string, string> = {
    consultation: '咨询',
    complaint: '投诉',
    technical_support: '技术支持',
    return_request: '退货申请',
    maintenance: '维修',
    other: '其他'
  }
  return texts[type] || '未知'
}

// 获取工单优先级颜色
const getTicketPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: 'info',
    medium: '',
    high: 'warning',
    urgent: 'danger'
  }
  return colors[priority] || ''
}

// 获取工单优先级文本
const getTicketPriorityText = (priority: string) => {
  const texts: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return texts[priority] || '未知'
}

// 获取工单状态颜色
const getTicketStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    open: 'danger',
    in_progress: 'warning',
    pending_customer: 'info',
    resolved: 'success',
    closed: ''
  }
  return colors[status] || ''
}

// 获取工单状态文本
const getTicketStatusText = (status: string) => {
  const texts: Record<string, string> = {
    open: '待处理',
    in_progress: '处理中',
    pending_customer: '等待客户',
    resolved: '已解决',
    closed: '已关闭'
  }
  return texts[status] || '未知'
}

// 分配工单对话框
const assignTicketDialog = (ticket: ServiceTicket) => {
  console.log('分配工单:', ticket)
}

// 关闭工单确认
const closeTicketConfirm = (ticket: ServiceTicket) => {
  console.log('关闭工单:', ticket)
}
</script>

<style lang="scss" scoped>
.customer-service-page {
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
        display: flex;
        flex-direction: column;
        align-items: center;

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #409eff;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }

      .stat-icon {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 40px;
        opacity: 0.3;

        &.customers {
          color: #409eff;
        }

        &.new-customers {
          color: #67c23a;
        }

        &.pending {
          color: #e6a23c;
        }

        &.response-time {
          color: #f56c6c;
        }
      }
    }
  }

  .main-tabs {
    .tab-content {
      .search-card {
        margin-bottom: 20px;

        .search-form {
          margin: 0;
        }
      }

      .customer-info {
        .company {
          font-size: 12px;
          color: #909399;
          margin-top: 2px;
        }
      }

      .order-stats {
        .amount {
          font-size: 12px;
          color: #909399;
          margin-top: 2px;
        }
      }

      .pagination {
        margin-top: 20px;
        text-align: right;
      }
    }
  }
}
</style>
