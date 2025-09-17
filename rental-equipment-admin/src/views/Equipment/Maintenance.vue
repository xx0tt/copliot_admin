<template>
  <div class="maintenance-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" type="text">
          <el-icon><ArrowLeft /></el-icon>
          返回设备详情
        </el-button>
        <h2 class="page-title">维护记录</h2>
        <span class="equipment-info" v-if="equipmentInfo">
          {{ equipmentInfo.name }} ({{ equipmentInfo.code }})
        </span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="addMaintenanceRecord">
          <el-icon><Plus /></el-icon>
          新增维护记录
        </el-button>
      </div>
    </div>

    <!-- 维护统计 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ maintenanceStats.total }}</div>
            <div class="stat-label">总维护次数</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ maintenanceStats.thisYear }}</div>
            <div class="stat-label">本年维护次数</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">¥{{ maintenanceStats.totalCost.toLocaleString() }}</div>
            <div class="stat-label">累计维护费用</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card">
            <div class="stat-value">{{ maintenanceStats.daysSinceLastMaintenance }}</div>
            <div class="stat-label">距上次维护天数</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-section">
      <el-card shadow="never">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-select v-model="searchForm.type" placeholder="维护类型" clearable>
              <el-option label="定期保养" value="定期保养" />
              <el-option label="故障维修" value="故障维修" />
              <el-option label="预防性维护" value="预防性维护" />
              <el-option label="大修" value="大修" />
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
          <el-col :xs="24" :sm="12" :md="4">
            <el-input v-model="searchForm.technician" placeholder="维护人员" clearable />
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
            <el-button @click="exportRecords">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 维护记录列表 -->
    <div class="table-section">
      <el-card shadow="never">
        <el-table
          v-loading="loading"
          :data="maintenanceRecords"
          stripe
          @sort-change="handleSortChange"
        >
          <el-table-column prop="date" label="维护日期" width="120" sortable="custom">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="type" label="维护类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getMaintenanceTypeTagType(row.type)">
                {{ row.type }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="description" label="维护内容" show-overflow-tooltip />
          
          <el-table-column prop="cost" label="维护费用" width="120" sortable="custom">
            <template #default="{ row }">
              <span class="cost">¥{{ row.cost.toLocaleString() }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="technician" label="维护人员" width="100" />
          
          <el-table-column prop="duration" label="维护时长" width="100">
            <template #default="{ row }">
              {{ row.duration }}小时
            </template>
          </el-table-column>
          
          <el-table-column prop="nextMaintenanceDate" label="下次维护日期" width="140">
            <template #default="{ row }">
              <span :class="{ 'text-warning': isMaintenanceDue(row.nextMaintenanceDate) }">
                {{ formatDate(row.nextMaintenanceDate) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewDetail(row)">
                查看
              </el-button>
              <el-button type="warning" size="small" @click="editRecord(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="deleteRecord(row)">
                删除
              </el-button>
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

    <!-- 维护记录详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="维护记录详情"
      width="600px"
    >
      <div v-if="selectedRecord" class="record-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="维护日期">
            {{ formatDate(selectedRecord.date) }}
          </el-descriptions-item>
          <el-descriptions-item label="维护类型">
            <el-tag :type="getMaintenanceTypeTagType(selectedRecord.type)">
              {{ selectedRecord.type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="维护人员">
            {{ selectedRecord.technician }}
          </el-descriptions-item>
          <el-descriptions-item label="维护时长">
            {{ selectedRecord.duration }}小时
          </el-descriptions-item>
          <el-descriptions-item label="维护费用">
            <span class="cost">¥{{ selectedRecord.cost.toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="下次维护日期">
            {{ formatDate(selectedRecord.nextMaintenanceDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="维护内容" :span="2">
            {{ selectedRecord.description }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ selectedRecord.remark || '无' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="selectedRecord.attachments?.length" class="attachments-section">
          <h4>相关附件</h4>
          <div class="attachments-list">
            <div 
              v-for="file in selectedRecord.attachments"
              :key="file.id"
              class="file-item"
              @click="downloadFile(file)"
            >
              <el-icon><Document /></el-icon>
              <span>{{ file.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 新增/编辑维护记录对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEdit ? '编辑维护记录' : '新增维护记录'"
      width="600px"
    >
      <el-form
        ref="maintenanceFormRef"
        :model="maintenanceForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="维护日期" prop="date">
          <el-date-picker
            v-model="maintenanceForm.date"
            type="date"
            placeholder="选择维护日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="维护类型" prop="type">
          <el-select v-model="maintenanceForm.type" placeholder="请选择维护类型">
            <el-option label="定期保养" value="定期保养" />
            <el-option label="故障维修" value="故障维修" />
            <el-option label="预防性维护" value="预防性维护" />
            <el-option label="大修" value="大修" />
          </el-select>
        </el-form-item>
        <el-form-item label="维护人员" prop="technician">
          <el-input v-model="maintenanceForm.technician" placeholder="请输入维护人员" />
        </el-form-item>
        <el-form-item label="维护时长" prop="duration">
          <el-input-number
            v-model="maintenanceForm.duration"
            :min="0.5"
            :step="0.5"
            placeholder="维护时长(小时)"
          />
        </el-form-item>
        <el-form-item label="维护费用" prop="cost">
          <el-input-number
            v-model="maintenanceForm.cost"
            :precision="2"
            :min="0"
            placeholder="维护费用"
          />
        </el-form-item>
        <el-form-item label="下次维护" prop="nextMaintenanceDate">
          <el-date-picker
            v-model="maintenanceForm.nextMaintenanceDate"
            type="date"
            placeholder="选择下次维护日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="维护内容" prop="description">
          <el-input
            v-model="maintenanceForm.description"
            type="textarea"
            :rows="3"
            placeholder="请详细描述维护内容"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="maintenanceForm.remark"
            type="textarea"
            :rows="2"
            placeholder="备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ isEdit ? '更新' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Download, 
  Document 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const detailDialogVisible = ref(false)
const formDialogVisible = ref(false)
const isEdit = ref(false)
const maintenanceFormRef = ref()

// 设备信息
const equipmentInfo = ref({
  id: '',
  name: '挖掘机CAT320D',
  code: 'EQ20240001'
})

// 维护统计
const maintenanceStats = ref({
  total: 24,
  thisYear: 8,
  totalCost: 58600,
  daysSinceLastMaintenance: 45
})

// 搜索表单
const searchForm = reactive({
  type: '',
  dateRange: [] as string[],
  technician: ''
})

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 维护记录列表
const maintenanceRecords = ref([
  {
    id: '1',
    date: '2023-12-01',
    type: '定期保养',
    description: '更换机油、滤芯，检查液压系统，清洁散热器',
    cost: 2800,
    technician: '张师傅',
    duration: 4,
    nextMaintenanceDate: '2024-03-01',
    remark: '设备运行正常，建议下次保养时更换液压油',
    attachments: [
      { id: '1', name: '保养记录表.pdf', url: '/files/maintenance1.pdf' }
    ]
  },
  {
    id: '2',
    date: '2023-10-15',
    type: '故障维修',
    description: '修复液压泵故障，更换密封件，调整工作参数',
    cost: 5200,
    technician: '李师傅',
    duration: 8,
    nextMaintenanceDate: '2024-01-15',
    remark: '故障已排除，设备恢复正常运行',
    attachments: []
  }
])

// 选中的记录
const selectedRecord = ref<any>(null)

// 维护记录表单
const maintenanceForm = reactive({
  date: '',
  type: '',
  description: '',
  cost: 0,
  technician: '',
  duration: 0,
  nextMaintenanceDate: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  date: [{ required: true, message: '请选择维护日期', trigger: 'change' }],
  type: [{ required: true, message: '请选择维护类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入维护内容', trigger: 'blur' }],
  cost: [{ required: true, message: '请输入维护费用', trigger: 'blur' }],
  technician: [{ required: true, message: '请输入维护人员', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入维护时长', trigger: 'blur' }]
}

// 方法
const loadMaintenanceRecords = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取维护记录
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = maintenanceRecords.value.length
  } catch (error) {
    ElMessage.error('加载维护记录失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadMaintenanceRecords()
}

const resetSearch = () => {
  searchForm.type = ''
  searchForm.dateRange = []
  searchForm.technician = ''
  pagination.currentPage = 1
  loadMaintenanceRecords()
}

const handleSortChange = ({ column, prop, order }: any) => {
  // TODO: 实现排序逻辑
  console.log('Sort change:', { column, prop, order })
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadMaintenanceRecords()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadMaintenanceRecords()
}

const addMaintenanceRecord = () => {
  isEdit.value = false
  resetForm()
  formDialogVisible.value = true
}

const viewDetail = (record: any) => {
  selectedRecord.value = record
  detailDialogVisible.value = true
}

const editRecord = (record: any) => {
  isEdit.value = true
  Object.assign(maintenanceForm, record)
  formDialogVisible.value = true
}

const deleteRecord = async (record: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条维护记录吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用删除API
    ElMessage.success('删除成功')
    loadMaintenanceRecords()
  } catch (error) {
    // 用户取消操作
  }
}

const submitForm = async () => {
  if (!maintenanceFormRef.value) return
  
  try {
    await maintenanceFormRef.value.validate()
    
    submitting.value = true
    
    // TODO: 调用创建/更新API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
    formDialogVisible.value = false
    loadMaintenanceRecords()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.keys(maintenanceForm).forEach(key => {
    maintenanceForm[key as keyof typeof maintenanceForm] = 
      typeof maintenanceForm[key as keyof typeof maintenanceForm] === 'number' ? 0 : ''
  })
}

const exportRecords = () => {
  ElMessage.info('导出功能开发中')
}

const downloadFile = (file: any) => {
  ElMessage.info(`下载文件: ${file.name}`)
}

const goBack = () => {
  const equipmentId = route.params.id as string
  router.push(`/equipment/${equipmentId}`)
}

const getMaintenanceTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    '定期保养': 'success',
    '故障维修': 'warning',
    '预防性维护': 'info',
    '大修': 'danger'
  }
  return typeMap[type] || 'info'
}

const isMaintenanceDue = (date: string) => {
  const dueDate = new Date(date)
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  equipmentInfo.value.id = route.params.id as string
  loadMaintenanceRecords()
})
</script>

<style lang="scss" scoped>
.maintenance-container {
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
      
      .equipment-info {
        color: #666;
        font-size: 14px;
      }
    }
  }
  
  .stats-section {
    margin-bottom: 20px;
    
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: center;
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #409EFF;
        margin-bottom: 8px;
      }
      
      .stat-label {
        font-size: 14px;
        color: #666;
      }
    }
  }
  
  .search-section {
    margin-bottom: 20px;
  }
  
  .table-section {
    .cost {
      color: #E6A23C;
      font-weight: bold;
    }
    
    .text-warning {
      color: #E6A23C;
      font-weight: bold;
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
  
  .record-detail {
    .attachments-section {
      margin-top: 20px;
      
      h4 {
        margin-bottom: 10px;
        color: #333;
      }
      
      .attachments-list {
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
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .maintenance-container {
    padding: 10px;
    
    .page-header {
      flex-direction: column;
      align-items: stretch;
      gap: 15px;
      
      .header-left {
        justify-content: space-between;
        flex-wrap: wrap;
        
        .page-title {
          font-size: 20px;
        }
      }
    }
    
    .stats-section {
      .el-col {
        margin-bottom: 15px;
      }
    }
    
    .search-section {
      .el-col {
        margin-bottom: 15px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
