<template>
  <div class="warehouse-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>仓库管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddWarehouse = true">
          <el-icon><Plus /></el-icon>
          新增仓库
        </el-button>
        <el-button @click="showInventoryDialog = true">
          <el-icon><Box /></el-icon>
          库存管理
        </el-button>
        <el-button @click="showStockMovements = true">
          <el-icon><Operation /></el-icon>
          出入库记录
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalWarehouses }}</div>
          <div class="stat-label">总仓库数</div>
        </div>
        <el-icon class="stat-icon warehouse"><House /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalCapacity }}</div>
          <div class="stat-label">总容量 (m²)</div>
        </div>
        <el-icon class="stat-icon capacity"><Grid /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalStock }}</div>
          <div class="stat-label">总库存</div>
        </div>
        <el-icon class="stat-icon stock"><Box /></el-icon>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.alertCount }}</div>
          <div class="stat-label">库存预警</div>
        </div>
        <el-icon class="stat-icon alert"><Warning /></el-icon>
      </el-card>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="仓库名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入仓库名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="管理员">
          <el-input
            v-model="searchForm.manager"
            placeholder="请输入管理员姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="active" />
            <el-option label="停用" value="inactive" />
            <el-option label="维护中" value="maintenance" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadWarehouses">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 仓库列表 -->
    <el-card>
      <template #header>
        <span>仓库列表</span>
      </template>
      
      <el-table
        :data="warehouses"
        :loading="loading"
        row-key="id"
        stripe
      >
        <el-table-column prop="name" label="仓库名称" min-width="120">
          <template #default="{ row }">
            <el-link type="primary" @click="viewWarehouse(row)">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="manager" label="管理员" width="100" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column label="容量/库存" width="120">
          <template #default="{ row }">
            <div class="capacity-info">
              <div>{{ row.area }}m²</div>
              <div class="stock-ratio">
                {{ row.currentStock }}/{{ row.capacity }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="使用率" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.currentStock / row.capacity) * 100)"
              :color="getProgressColor(row.currentStock / row.capacity)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text @click="editWarehouse(row)">
              编辑
            </el-button>
            <el-button type="success" text @click="viewInventory(row)">
              库存
            </el-button>
            <el-button type="danger" text @click="deleteWarehouse(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadWarehouses"
          @current-change="loadWarehouses"
        />
      </div>
    </el-card>

    <!-- 新增/编辑仓库对话框 -->
    <el-dialog
      v-model="showAddWarehouse"
      :title="editingWarehouse ? '编辑仓库' : '新增仓库'"
      width="600px"
    >
      <el-form
        ref="warehouseFormRef"
        :model="warehouseForm"
        :rules="warehouseRules"
        label-width="100px"
      >
        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="warehouseForm.name" placeholder="请输入仓库名称" />
        </el-form-item>
        <el-form-item label="仓库地址" prop="address">
          <el-input v-model="warehouseForm.address" placeholder="请输入仓库地址" />
        </el-form-item>
        <el-form-item label="管理员" prop="manager">
          <el-input v-model="warehouseForm.manager" placeholder="请输入管理员姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="warehouseForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="仓库面积" prop="area">
          <el-input-number
            v-model="warehouseForm.area"
            :min="1"
            :step="1"
            placeholder="请输入仓库面积"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最大容量" prop="capacity">
          <el-input-number
            v-model="warehouseForm.capacity"
            :min="1"
            :step="1"
            placeholder="请输入最大容量"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="warehouseForm.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="inactive">停用</el-radio>
            <el-radio label="maintenance">维护中</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="warehouseForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入仓库描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddWarehouse = false">取消</el-button>
        <el-button type="primary" @click="saveWarehouse" :loading="saving">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 库存管理对话框 -->
    <el-dialog
      v-model="showInventoryDialog"
      title="库存管理"
      width="80%"
      top="5vh"
    >
      <div class="inventory-content">
        <!-- 库存搜索 -->
        <el-form :inline="true" :model="inventorySearch" class="inventory-search">
          <el-form-item label="仓库">
            <el-select v-model="inventorySearch.warehouseId" placeholder="请选择仓库" clearable>
              <el-option
                v-for="warehouse in warehouses"
                :key="warehouse.id"
                :label="warehouse.name"
                :value="warehouse.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input
              v-model="inventorySearch.equipmentName"
              placeholder="请输入设备名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="inventorySearch.status" placeholder="请选择状态" clearable>
              <el-option label="正常" value="normal" />
              <el-option label="库存不足" value="low_stock" />
              <el-option label="缺货" value="out_of_stock" />
              <el-option label="库存过多" value="excess" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadInventory">搜索</el-button>
            <el-button @click="showStockMovementDialog = true">出入库</el-button>
            <el-button @click="showTransferDialog = true">库存转移</el-button>
          </el-form-item>
        </el-form>

        <!-- 库存列表 -->
        <el-table :data="inventory" :loading="inventoryLoading">
          <el-table-column prop="equipmentName" label="设备名称" min-width="120" />
          <el-table-column prop="equipmentModel" label="型号" width="120" />
          <el-table-column prop="warehouseName" label="仓库" width="120" />
          <el-table-column prop="location" label="位置" width="100" />
          <el-table-column label="库存数量" width="120">
            <template #default="{ row }">
              <div class="quantity-info">
                <div>总数: {{ row.quantity }}</div>
                <div class="sub-quantity">
                  可用: {{ row.availableQuantity }} |
                  租出: {{ row.rentedQuantity }} |
                  维修: {{ row.maintenanceQuantity }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getInventoryStatusType(row.status)">
                {{ getInventoryStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastCheckDate" label="最后盘点" width="120" />
        </el-table>
      </div>
    </el-dialog>

    <!-- 出入库记录对话框 -->
    <el-dialog
      v-model="showStockMovements"
      title="出入库记录"
      width="80%"
      top="5vh"
    >
      <el-table :data="stockMovements" :loading="movementLoading">
        <el-table-column prop="createdAt" label="时间" width="160" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="120" />
        <el-table-column prop="warehouseName" label="仓库" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getMovementType(row.type)">
              {{ getMovementText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数量变化" width="150">
          <template #default="{ row }">
            <span>{{ row.beforeQuantity }} → {{ row.afterQuantity }}</span>
            <span :class="row.quantity > 0 ? 'text-success' : 'text-danger'">
              ({{ row.quantity > 0 ? '+' : '' }}{{ row.quantity }})
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="120" />
        <el-table-column prop="operator" label="操作人" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus, Box, Operation, Search, House, Grid, Warning
} from '@element-plus/icons-vue'
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse as deleteWarehouseApi, getInventory, getStockMovements } from '@/api/warehouse'
import type { Warehouse, InventoryItem, StockMovement, WarehouseStatus, InventoryStatus, MovementType } from '@/types/warehouse'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const inventoryLoading = ref(false)
const movementLoading = ref(false)

// 仓库列表
const warehouses = ref<Warehouse[]>([])
const inventory = ref<InventoryItem[]>([])
const stockMovements = ref<StockMovement[]>([])

// 对话框显示状态
const showAddWarehouse = ref(false)
const showInventoryDialog = ref(false)
const showStockMovements = ref(false)
const showStockMovementDialog = ref(false)
const showTransferDialog = ref(false)

// 编辑状态
const editingWarehouse = ref<Warehouse | null>(null)

// 统计数据
const stats = reactive({
  totalWarehouses: 0,
  totalCapacity: 0,
  totalStock: 0,
  alertCount: 0
})

// 搜索表单
const searchForm = reactive({
  name: '',
  manager: '',
  status: ''
})

// 库存搜索表单
const inventorySearch = reactive({
  warehouseId: '',
  equipmentName: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 仓库表单
const warehouseForm = reactive({
  name: '',
  address: '',
  manager: '',
  phone: '',
  area: 0,
  capacity: 0,
  status: 'active' as WarehouseStatus,
  description: ''
})

// 表单引用和验证规则
const warehouseFormRef = ref<FormInstance>()
const warehouseRules: FormRules = {
  name: [
    { required: true, message: '请输入仓库名称', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入仓库地址', trigger: 'blur' }
  ],
  manager: [
    { required: true, message: '请输入管理员姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请输入仓库面积', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: '请输入最大容量', trigger: 'blur' }
  ]
}

// 初始化数据
onMounted(() => {
  loadWarehouses()
  loadStats()
})

// 加载仓库列表
const loadWarehouses = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    }
    const response = await getWarehouses(params)
    warehouses.value = response.data.list
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载仓库列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = () => {
  // 模拟统计数据
  stats.totalWarehouses = 8
  stats.totalCapacity = 15000
  stats.totalStock = 1245
  stats.alertCount = 5
}

// 加载库存数据
const loadInventory = async () => {
  try {
    inventoryLoading.value = true
    const response = await getInventory(inventorySearch)
    inventory.value = response.data.list
  } catch (error) {
    ElMessage.error('加载库存数据失败')
  } finally {
    inventoryLoading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    manager: '',
    status: ''
  })
  loadWarehouses()
}

// 查看仓库详情
const viewWarehouse = (warehouse: Warehouse) => {
  // 跳转到仓库详情页面
  console.log('查看仓库详情:', warehouse)
}

// 编辑仓库
const editWarehouse = (warehouse: Warehouse) => {
  editingWarehouse.value = warehouse
  Object.assign(warehouseForm, warehouse)
  showAddWarehouse.value = true
}

// 查看库存
const viewInventory = (warehouse: Warehouse) => {
  inventorySearch.warehouseId = warehouse.id
  showInventoryDialog.value = true
  loadInventory()
}

// 保存仓库
const saveWarehouse = async () => {
  if (!warehouseFormRef.value) return
  
  try {
    await warehouseFormRef.value.validate()
    saving.value = true
    
    if (editingWarehouse.value) {
      await updateWarehouse(editingWarehouse.value.id, warehouseForm)
      ElMessage.success('更新仓库成功')
    } else {
      await createWarehouse(warehouseForm)
      ElMessage.success('创建仓库成功')
    }
    
    showAddWarehouse.value = false
    resetWarehouseForm()
    loadWarehouses()
  } catch (error) {
    ElMessage.error('保存仓库失败')
  } finally {
    saving.value = false
  }
}

// 删除仓库
const deleteWarehouse = async (warehouse: Warehouse) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除仓库"${warehouse.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteWarehouseApi(warehouse.id)
    ElMessage.success('删除仓库成功')
    loadWarehouses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除仓库失败')
    }
  }
}

// 重置仓库表单
const resetWarehouseForm = () => {
  Object.assign(warehouseForm, {
    name: '',
    address: '',
    manager: '',
    phone: '',
    area: 0,
    capacity: 0,
    status: 'active',
    description: ''
  })
  editingWarehouse.value = null
  warehouseFormRef.value?.resetFields()
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    maintenance: 'warning'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '正常',
    inactive: '停用',
    maintenance: '维护中'
  }
  return texts[status] || '未知'
}

// 获取进度条颜色
const getProgressColor = (ratio: number) => {
  if (ratio >= 0.9) return '#f56c6c'
  if (ratio >= 0.7) return '#e6a23c'
  return '#67c23a'
}

// 获取库存状态类型
const getInventoryStatusType = (status: string) => {
  const types: Record<string, string> = {
    normal: 'success',
    low_stock: 'warning',
    out_of_stock: 'danger',
    excess: 'info'
  }
  return types[status] || 'info'
}

// 获取库存状态文本
const getInventoryStatusText = (status: string) => {
  const texts: Record<string, string> = {
    normal: '正常',
    low_stock: '库存不足',
    out_of_stock: '缺货',
    excess: '库存过多'
  }
  return texts[status] || '未知'
}

// 获取移动类型
const getMovementType = (type: string) => {
  const types: Record<string, string> = {
    in: 'success',
    out: 'danger',
    transfer: 'warning',
    adjustment: 'info',
    maintenance: 'warning',
    return: 'success'
  }
  return types[type] || 'info'
}

// 获取移动文本
const getMovementText = (type: string) => {
  const texts: Record<string, string> = {
    in: '入库',
    out: '出库',
    transfer: '转移',
    adjustment: '调整',
    maintenance: '维修',
    return: '归还'
  }
  return texts[type] || '未知'
}
</script>

<style lang="scss" scoped>
.warehouse-page {
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

        &.warehouse {
          color: #409eff;
        }

        &.capacity {
          color: #67c23a;
        }

        &.stock {
          color: #e6a23c;
        }

        &.alert {
          color: #f56c6c;
        }
      }
    }
  }

  .search-card {
    margin-bottom: 20px;

    .search-form {
      margin: 0;
    }
  }

  .capacity-info {
    .stock-ratio {
      font-size: 12px;
      color: #909399;
    }
  }

  .quantity-info {
    .sub-quantity {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }

  .pagination {
    margin-top: 20px;
    text-align: right;
  }

  .inventory-content {
    .inventory-search {
      margin-bottom: 20px;
    }
  }

  .text-success {
    color: #67c23a;
  }

  .text-danger {
    color: #f56c6c;
  }
}
</style>
