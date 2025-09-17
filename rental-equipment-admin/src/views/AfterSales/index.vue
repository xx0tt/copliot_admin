<template>
  <div class="after-sales-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">售后管理</h2>
        <el-button type="primary" @click="createTicket">
          <el-icon><Plus /></el-icon>
          新建工单
        </el-button>
      </div>
      
      <!-- 搜索和筛选区域 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索工单号、客户名称"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="searchForm.status" placeholder="工单状态" clearable>
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已完成" value="completed" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="searchForm.type" placeholder="工单类型" clearable>
              <el-option label="设备故障" value="equipment_fault" />
              <el-option label="维修保养" value="maintenance" />
              <el-option label="技术支持" value="technical_support" />
              <el-option label="配件更换" value="parts_replacement" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="searchForm.priority" placeholder="优先级" clearable>
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
              <el-option label="紧急" value="urgent" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="24" :md="6">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" v-for="stat in ticketStats" :key="stat.label">
          <div class="stat-card" :style="{ borderLeftColor: stat.color }">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 工单列表 -->
    <div class="table-section">
      <el-card shadow="never">
        <el-table
          v-loading="loading"
          :data="ticketList"
          stripe
          @sort-change="handleSortChange"
        >
          <el-table-column prop="ticketNumber" label="工单号" width="140" fixed="left">
            <template #default="{ row }">
              <el-button type="text" @click="viewTicketDetail(row.id)">
                {{ row.ticketNumber }}
              </el-button>
            </template>
          </el-table-column>
          
          <el-table-column prop="title" label="工单标题" width="200" show-overflow-tooltip />
          
          <el-table-column prop="type" label="工单类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">
                {{ getTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="priority" label="优先级" width="100">
            <template #default="{ row }">
              <el-tag :type="getPriorityTagType(row.priority)">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="工单状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="customerName" label="客户名称" width="150" />
          
          <el-table-column prop="equipmentName" label="相关设备" width="150" show-overflow-tooltip />
          
          <el-table-column prop="assignedTo" label="处理人员" width="100" />
          
          <el-table-column prop="createTime" label="创建时间" width="160" sortable="custom">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="updateTime" label="更新时间" width="160" sortable="custom">
            <template #default="{ row }">
              {{ formatDateTime(row.updateTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button type="primary" size="small" @click="viewTicketDetail(row.id)">
                  查看
                </el-button>
                <el-button 
                  v-if="canEditTicket(row.status)"
                  type="warning" 
                  size="small" 
                  @click="editTicket(row.id)"
                >
                  编辑
                </el-button>
                <el-dropdown trigger="click" @command="handleTicketAction">
                  <el-button type="info" size="small">
                    更多
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="`assign:${row.id}`">
                        分配工单
                      </el-dropdown-item>
                      <el-dropdown-item :command="`close:${row.id}`">
                        关闭工单
                      </el-dropdown-item>
                      <el-dropdown-item :command="`export:${row.id}`">
                        导出工单
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Search, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const ticketList = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  type: '',
  priority: ''
})

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 工单统计数据
const ticketStats = ref([
  { label: '待处理工单', value: '23', color: '#E6A23C' },
  { label: '处理中工单', value: '15', color: '#409EFF' },
  { label: '本月完成', value: '89', color: '#67C23A' },
  { label: '平均处理时间', value: '2.5天', color: '#909399' }
])

// 方法
const loadTicketList = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取工单列表
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    ticketList.value = [
      {
        id: '1',
        ticketNumber: 'TK20240001',
        title: '挖掘机液压系统故障',
        type: 'equipment_fault',
        priority: 'high',
        status: 'processing',
        customerName: '张三建设集团',
        equipmentName: '挖掘机CAT320D',
        assignedTo: '李师傅',
        createTime: '2024-01-01 09:30:00',
        updateTime: '2024-01-01 14:20:00'
      },
      {
        id: '2',
        ticketNumber: 'TK20240002',
        title: '起重机定期保养',
        type: 'maintenance',
        priority: 'medium',
        status: 'pending',
        customerName: '李四工程公司',
        equipmentName: '起重机QTZ63',
        assignedTo: '王师傅',
        createTime: '2024-01-01 10:15:00',
        updateTime: '2024-01-01 10:15:00'
      }
    ]
    
    pagination.total = 45
  } catch (error) {
    ElMessage.error('加载工单列表失败')
    console.error('Load ticket list error:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadTicketList()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.type = ''
  searchForm.priority = ''
  pagination.currentPage = 1
  loadTicketList()
}

const handleSortChange = ({ column, prop, order }: any) => {
  // TODO: 实现排序逻辑
  console.log('Sort change:', { column, prop, order })
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadTicketList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadTicketList()
}

const createTicket = () => {
  ElMessage.info('新建工单功能开发中')
}

const viewTicketDetail = (ticketId: string) => {
  ElMessage.info(`查看工单详情: ${ticketId}`)
}

const editTicket = (ticketId: string) => {
  ElMessage.info(`编辑工单: ${ticketId}`)
}

const handleTicketAction = (command: string) => {
  const [action, ticketId] = command.split(':')
  
  switch (action) {
    case 'assign':
      ElMessage.info(`分配工单: ${ticketId}`)
      break
    case 'close':
      ElMessage.info(`关闭工单: ${ticketId}`)
      break
    case 'export':
      ElMessage.info(`导出工单: ${ticketId}`)
      break
  }
}

const canEditTicket = (status: string) => {
  return status === 'pending' || status === 'processing'
}

const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'equipment_fault': '设备故障',
    'maintenance': '维修保养',
    'technical_support': '技术支持',
    'parts_replacement': '配件更换',
    'other': '其他'
  }
  return typeMap[type] || '未知'
}

const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    'equipment_fault': 'danger',
    'maintenance': 'warning',
    'technical_support': 'info',
    'parts_replacement': 'primary',
    'other': ''
  }
  return typeMap[type] || 'info'
}

const getPriorityText = (priority: string) => {
  const priorityMap: Record<string, string> = {
    'low': '低',
    'medium': '中',
    'high': '高',
    'urgent': '紧急'
  }
  return priorityMap[priority] || '未知'
}

const getPriorityTagType = (priority: string) => {
  const typeMap: Record<string, string> = {
    'low': 'info',
    'medium': '',
    'high': 'warning',
    'urgent': 'danger'
  }
  return typeMap[priority] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    'closed': '已关闭'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    'pending': 'warning',
    'processing': 'primary',
    'completed': 'success',
    'closed': 'info'
  }
  return typeMap[status] || 'info'
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadTicketList()
})
</script>

<style lang="scss" scoped>
.after-sales-container {
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
  
  .stats-section {
    margin-bottom: 20px;
    
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-left: 4px solid;
      text-align: center;
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 8px;
      }
      
      .stat-label {
        font-size: 14px;
        color: #666;
      }
    }
  }
  
  .table-section {
    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .after-sales-container {
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
    
    .stats-section {
      .el-col {
        margin-bottom: 15px;
      }
    }
  }
}
</style>
