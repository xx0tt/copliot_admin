<template>
  <div class="equipment-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">设备管理</h2>
        <div class="header-actions">
          <el-button type="primary" @click="addEquipment">
            <el-icon><Plus /></el-icon>
            新增设备
          </el-button>
          <el-button @click="exportEquipment">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
      
      <!-- 搜索和筛选区域 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索设备名称、型号、编号"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="searchForm.category" placeholder="设备分类" clearable>
              <el-option 
                v-for="category in categoryOptions" 
                :key="category.value"
                :label="category.label" 
                :value="category.value"
              />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="searchForm.status" placeholder="设备状态" clearable>
              <el-option 
                v-for="status in statusOptions" 
                :key="status.value"
                :label="status.label" 
                :value="status.value"
              />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="searchForm.warehouse" placeholder="所在仓库" clearable>
              <el-option 
                v-for="warehouse in warehouseOptions" 
                :key="warehouse.value"
                :label="warehouse.label" 
                :value="warehouse.value"
              />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="24" :md="6">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
            <el-button type="text" @click="toggleAdvancedSearch">
              {{ showAdvancedSearch ? '收起' : '高级搜索' }}
            </el-button>
          </el-col>
        </el-row>
        
        <!-- 高级搜索 -->
        <div v-show="showAdvancedSearch" class="advanced-search">
          <el-row :gutter="20">
            <el-col :xs="24" :md="6">
              <el-date-picker
                v-model="searchForm.purchaseDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="采购开始日期"
                end-placeholder="采购结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-col>
            <el-col :xs="24" :md="6">
              <el-input-number
                v-model="searchForm.minPrice"
                placeholder="最低价格"
                :min="0"
                controls-position="right"
              />
            </el-col>
            <el-col :xs="24" :md="6">
              <el-input-number
                v-model="searchForm.maxPrice"
                placeholder="最高价格"
                :min="0"
                controls-position="right"
              />
            </el-col>
            <el-col :xs="24" :md="6">
              <el-input v-model="searchForm.supplier" placeholder="供应商" clearable />
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" v-for="stat in equipmentStats" :key="stat.label">
          <div class="stat-card" :style="{ borderLeftColor: stat.color }">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 设备列表 -->
    <div class="table-section">
      <el-card shadow="never">
        <div class="table-header">
          <div class="view-controls">
            <el-radio-group v-model="viewMode" @change="handleViewModeChange">
              <el-radio-button label="table">
                <el-icon><Grid /></el-icon>
                表格视图
              </el-radio-button>
              <el-radio-button label="card">
                <el-icon><Files /></el-icon>
                卡片视图
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="table-tools">
            <el-checkbox v-model="showImages">显示图片</el-checkbox>
            <el-dropdown @command="handleBatchAction">
              <el-button>
                批量操作
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="maintenance">批量维护</el-dropdown-item>
                  <el-dropdown-item command="status">批量修改状态</el-dropdown-item>
                  <el-dropdown-item command="export">批量导出</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>批量删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 表格视图 -->
        <el-table
          v-if="viewMode === 'table'"
          v-loading="loading"
          :data="equipmentList"
          stripe
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column v-if="showImages" label="图片" width="80">
            <template #default="{ row }">
              <el-image
                :src="row.image"
                :preview-src-list="[row.image]"
                fit="cover"
                style="width: 50px; height: 50px; border-radius: 4px;"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </template>
          </el-table-column>
          
          <el-table-column prop="code" label="设备编号" width="120" fixed="left">
            <template #default="{ row }">
              <el-button type="text" @click="viewEquipmentDetail(row.id)">
                {{ row.code }}
              </el-button>
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="设备名称" width="180" show-overflow-tooltip />
          
          <el-table-column prop="model" label="设备型号" width="120" />
          
          <el-table-column prop="category" label="设备分类" width="100">
            <template #default="{ row }">
              <el-tag :type="getCategoryTagType(row.category)">
                {{ getCategoryText(row.category) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="设备状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="dailyRate" label="日租金" width="100" sortable="custom">
            <template #default="{ row }">
              <span class="price">¥{{ row.dailyRate.toLocaleString() }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="warehouse" label="所在仓库" width="120" />
          
          <el-table-column prop="purchaseDate" label="采购日期" width="120" sortable="custom">
            <template #default="{ row }">
              {{ formatDate(row.purchaseDate) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="lastMaintenanceDate" label="上次维护" width="120" sortable="custom">
            <template #default="{ row }">
              {{ formatDate(row.lastMaintenanceDate) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button type="primary" size="small" @click="viewEquipmentDetail(row.id)">
                  查看
                </el-button>
                <el-button type="warning" size="small" @click="editEquipment(row.id)">
                  编辑
                </el-button>
                <el-dropdown trigger="click" @command="handleAction">
                  <el-button type="info" size="small">
                    更多
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="`maintenance:${row.id}`">
                        维护记录
                      </el-dropdown-item>
                      <el-dropdown-item :command="`qrcode:${row.id}`">
                        生成二维码
                      </el-dropdown-item>
                      <el-dropdown-item :command="`clone:${row.id}`">
                        复制设备
                      </el-dropdown-item>
                      <el-dropdown-item :command="`delete:${row.id}`" divided>
                        删除设备
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 卡片视图 -->
        <div v-else class="card-view">
          <el-row :gutter="20">
            <el-col 
              :xs="24" :sm="12" :md="8" :lg="6" 
              v-for="equipment in equipmentList" 
              :key="equipment.id"
              class="equipment-card-col"
            >
              <div class="equipment-card" @click="viewEquipmentDetail(equipment.id)">
                <div class="card-image">
                  <el-image
                    :src="equipment.image"
                    fit="cover"
                    style="width: 100%; height: 150px;"
                  >
                    <template #error>
                      <div class="image-placeholder">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="card-status">
                    <el-tag :type="getStatusTagType(equipment.status)" size="small">
                      {{ getStatusText(equipment.status) }}
                    </el-tag>
                  </div>
                </div>
                <div class="card-content">
                  <h4 class="equipment-name">{{ equipment.name }}</h4>
                  <p class="equipment-model">{{ equipment.model }}</p>
                  <div class="equipment-info">
                    <div class="info-item">
                      <span class="label">编号:</span>
                      <span class="value">{{ equipment.code }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">日租金:</span>
                      <span class="value price">¥{{ equipment.dailyRate.toLocaleString() }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">仓库:</span>
                      <span class="value">{{ equipment.warehouse }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button size="small" @click.stop="editEquipment(equipment.id)">
                    编辑
                  </el-button>
                  <el-button size="small" @click.stop="viewMaintenanceRecords(equipment.id)">
                    维护
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[12, 24, 48, 96]"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Download, 
  Search, 
  Grid, 
  Files, 
  ArrowDown, 
  Picture 
} from '@element-plus/icons-vue'
import { EquipmentStatus, EquipmentCategory } from '@/types/equipment'
import type { Equipment, EquipmentStatusType, EquipmentCategoryType } from '@/types/equipment'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const equipmentList = ref<Equipment[]>([])
const selectedEquipment = ref<Equipment[]>([])
const viewMode = ref('table')
const showImages = ref(true)
const showAdvancedSearch = ref(false)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  status: '',
  warehouse: '',
  purchaseDateRange: [] as string[],
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  supplier: ''
})

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 24,
  total: 0
})

// 设备统计数据
const equipmentStats = ref([
  { label: '总设备数', value: '234', color: '#409EFF' },
  { label: '可用设备', value: '189', color: '#67C23A' },
  { label: '租出设备', value: '32', color: '#E6A23C' },
  { label: '维修设备', value: '13', color: '#F56C6C' }
])

// 选项数据
const categoryOptions = [
  { label: '挖掘机械', value: EquipmentCategory.EXCAVATOR },
  { label: '起重机械', value: EquipmentCategory.CRANE },
  { label: '铲土运输', value: EquipmentCategory.EARTHMOVING },
  { label: '压实机械', value: EquipmentCategory.COMPACTOR },
  { label: '混凝土机械', value: EquipmentCategory.CONCRETE },
  { label: '桩工机械', value: EquipmentCategory.PILING },
  { label: '其他设备', value: EquipmentCategory.OTHER }
]

const statusOptions = [
  { label: '可用', value: EquipmentStatus.AVAILABLE },
  { label: '租出', value: EquipmentStatus.RENTED },
  { label: '维修中', value: EquipmentStatus.MAINTENANCE },
  { label: '停用', value: EquipmentStatus.OUT_OF_SERVICE }
]

const warehouseOptions = [
  { label: '北京仓库', value: 'BJ001' },
  { label: '上海仓库', value: 'SH001' },
  { label: '广州仓库', value: 'GZ001' },
  { label: '成都仓库', value: 'CD001' }
]

// 方法
const loadEquipmentList = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取设备列表
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    equipmentList.value = [
      {
        id: '1',
        code: 'EQ20240001',
        name: '挖掘机CAT320D',
        model: 'CAT320D',
        category: EquipmentCategory.EXCAVATOR,
        status: EquipmentStatus.AVAILABLE,
        dailyRate: 1500,
        purchasePrice: 980000,
        warehouse: '北京仓库',
        purchaseDate: '2023-01-15',
        lastMaintenanceDate: '2023-12-01',
        image: '/images/equipment/cat320d.jpg',
        specifications: {},
        supplier: '卡特彼勒(中国)',
        warrantyExpiry: '2025-01-15',
        description: '大型履带式挖掘机，适用于各种土方作业'
      },
      // 更多模拟数据...
    ]
    
    pagination.total = 234
  } catch (error) {
    ElMessage.error('加载设备列表失败')
    console.error('Load equipment list error:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadEquipmentList()
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    const value = searchForm[key as keyof typeof searchForm]
    if (Array.isArray(value)) {
      searchForm[key as keyof typeof searchForm] = [] as any
    } else {
      searchForm[key as keyof typeof searchForm] = '' as any
    }
  })
  pagination.currentPage = 1
  loadEquipmentList()
}

const toggleAdvancedSearch = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
}

const handleViewModeChange = () => {
  if (viewMode.value === 'card') {
    pagination.pageSize = 24
  } else {
    pagination.pageSize = 20
  }
  loadEquipmentList()
}

const handleSelectionChange = (selection: Equipment[]) => {
  selectedEquipment.value = selection
}

const handleSortChange = ({ column, prop, order }: any) => {
  // TODO: 实现排序逻辑
  console.log('Sort change:', { column, prop, order })
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadEquipmentList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadEquipmentList()
}

const addEquipment = () => {
  router.push('/equipment/create')
}

const viewEquipmentDetail = (equipmentId: string) => {
  router.push(`/equipment/${equipmentId}`)
}

const editEquipment = (equipmentId: string) => {
  router.push(`/equipment/edit/${equipmentId}`)
}

const viewMaintenanceRecords = (equipmentId: string) => {
  router.push(`/equipment/${equipmentId}/maintenance`)
}

const exportEquipment = () => {
  ElMessage.info('导出功能开发中')
}

const handleBatchAction = (command: string) => {
  if (selectedEquipment.value.length === 0) {
    ElMessage.warning('请选择要操作的设备')
    return
  }
  
  switch (command) {
    case 'maintenance':
      ElMessage.info('批量维护功能开发中')
      break
    case 'status':
      ElMessage.info('批量修改状态功能开发中')
      break
    case 'export':
      ElMessage.info('批量导出功能开发中')
      break
    case 'delete':
      handleBatchDelete()
      break
  }
}

const handleAction = (command: string) => {
  const [action, equipmentId] = command.split(':')
  
  switch (action) {
    case 'maintenance':
      viewMaintenanceRecords(equipmentId)
      break
    case 'qrcode':
      ElMessage.info('生成二维码功能开发中')
      break
    case 'clone':
      ElMessage.info('复制设备功能开发中')
      break
    case 'delete':
      handleDelete(equipmentId)
      break
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedEquipment.value.length} 个设备吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用批量删除API
    ElMessage.success('批量删除成功')
    selectedEquipment.value = []
    loadEquipmentList()
  } catch (error) {
    // 用户取消操作
  }
}

const handleDelete = async (equipmentId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该设备吗？删除后不可恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用删除API
    ElMessage.success('删除成功')
    loadEquipmentList()
  } catch (error) {
    // 用户取消操作
  }
}

const getCategoryText = (category: EquipmentCategoryType) => {
  const categoryMap = {
    [EquipmentCategory.EXCAVATOR]: '挖掘机械',
    [EquipmentCategory.CRANE]: '起重机械',
    [EquipmentCategory.EARTHMOVING]: '铲土运输',
    [EquipmentCategory.COMPACTOR]: '压实机械',
    [EquipmentCategory.CONCRETE]: '混凝土机械',
    [EquipmentCategory.PILING]: '桩工机械',
    [EquipmentCategory.OTHER]: '其他设备'
  }
  return categoryMap[category] || '未知'
}

const getCategoryTagType = (category: EquipmentCategoryType) => {
  const typeMap = {
    [EquipmentCategory.EXCAVATOR]: 'primary',
    [EquipmentCategory.CRANE]: 'success',
    [EquipmentCategory.EARTHMOVING]: 'warning',
    [EquipmentCategory.COMPACTOR]: 'info',
    [EquipmentCategory.CONCRETE]: 'danger',
    [EquipmentCategory.PILING]: '',
    [EquipmentCategory.OTHER]: 'info'
  }
  return typeMap[category] || 'info'
}

const getStatusText = (status: EquipmentStatus) => {
  const statusMap = {
    [EquipmentStatus.AVAILABLE]: '可用',
    [EquipmentStatus.RENTED]: '租出',
    [EquipmentStatus.MAINTENANCE]: '维修中',
    [EquipmentStatus.OUT_OF_SERVICE]: '停用'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status: EquipmentStatus) => {
  const typeMap = {
    [EquipmentStatus.AVAILABLE]: 'success',
    [EquipmentStatus.RENTED]: 'warning',
    [EquipmentStatus.MAINTENANCE]: 'danger',
    [EquipmentStatus.OUT_OF_SERVICE]: 'info'
  }
  return typeMap[status] || 'info'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadEquipmentList()
})
</script>

<style lang="scss" scoped>
.equipment-container {
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
      
      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    .search-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      .advanced-search {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e4e7ed;
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
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .table-tools {
        display: flex;
        align-items: center;
        gap: 15px;
      }
    }
    
    .price {
      color: #67C23A;
      font-weight: bold;
    }
    
    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background: #f5f7fa;
      color: #999;
    }
    
    .card-view {
      .equipment-card-col {
        margin-bottom: 20px;
        
        .equipment-card {
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s;
          cursor: pointer;
          
          &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }
          
          .card-image {
            position: relative;
            
            .image-placeholder {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 150px;
              background: #f5f7fa;
              color: #999;
              font-size: 24px;
            }
            
            .card-status {
              position: absolute;
              top: 8px;
              right: 8px;
            }
          }
          
          .card-content {
            padding: 15px;
            
            .equipment-name {
              margin: 0 0 8px 0;
              font-size: 16px;
              color: #333;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .equipment-model {
              margin: 0 0 15px 0;
              font-size: 14px;
              color: #666;
            }
            
            .equipment-info {
              .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                
                &:last-child {
                  margin-bottom: 0;
                }
                
                .label {
                  font-size: 12px;
                  color: #999;
                }
                
                .value {
                  font-size: 12px;
                  color: #333;
                  
                  &.price {
                    color: #67C23A;
                    font-weight: bold;
                  }
                }
              }
            }
          }
          
          .card-actions {
            padding: 10px 15px;
            border-top: 1px solid #e4e7ed;
            display: flex;
            justify-content: space-between;
          }
        }
      }
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .equipment-container {
    padding: 10px;
    
    .page-header {
      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
        
        .page-title {
          font-size: 20px;
        }
        
        .header-actions {
          justify-content: center;
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
    
    .table-section {
      .table-header {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
      }
    }
  }
}
</style>
