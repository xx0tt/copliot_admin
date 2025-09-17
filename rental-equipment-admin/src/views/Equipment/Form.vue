<template>
  <div class="equipment-form-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" type="text">
          <el-icon><ArrowLeft /></el-icon>
          返回设备列表
        </el-button>
        <h2 class="page-title">{{ isEdit ? '编辑设备' : '新增设备' }}</h2>
      </div>
      <div class="header-right">
        <el-button @click="saveDraft" v-if="!isEdit">
          <el-icon><Document /></el-icon>
          保存草稿
        </el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          <el-icon><Check /></el-icon>
          {{ isEdit ? '更新设备' : '添加设备' }}
        </el-button>
      </div>
    </div>

    <!-- 设备表单 -->
    <div class="form-content">
      <el-form
        ref="equipmentFormRef"
        :model="equipmentForm"
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
              <el-form-item label="设备名称" prop="name">
                <el-input v-model="equipmentForm.name" placeholder="请输入设备名称" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="设备型号" prop="model">
                <el-input v-model="equipmentForm.model" placeholder="请输入设备型号" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="设备编号" prop="code">
                <el-input v-model="equipmentForm.code" placeholder="请输入设备编号" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="设备分类" prop="category">
                <el-select v-model="equipmentForm.category" placeholder="请选择设备分类">
                  <el-option 
                    v-for="category in categoryOptions" 
                    :key="category.value"
                    :label="category.label" 
                    :value="category.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="设备状态" prop="status">
                <el-select v-model="equipmentForm.status" placeholder="请选择设备状态">
                  <el-option 
                    v-for="status in statusOptions" 
                    :key="status.value"
                    :label="status.label" 
                    :value="status.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="所在仓库" prop="warehouse">
                <el-select v-model="equipmentForm.warehouse" placeholder="请选择仓库">
                  <el-option 
                    v-for="warehouse in warehouseOptions" 
                    :key="warehouse.value"
                    :label="warehouse.label" 
                    :value="warehouse.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 财务信息 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <span class="card-title">财务信息</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="采购价格" prop="purchasePrice">
                <el-input-number 
                  v-model="equipmentForm.purchasePrice"
                  :precision="2"
                  :min="0"
                  placeholder="请输入采购价格"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="日租金" prop="dailyRate">
                <el-input-number 
                  v-model="equipmentForm.dailyRate"
                  :precision="2"
                  :min="0"
                  placeholder="请输入日租金"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="采购日期" prop="purchaseDate">
                <el-date-picker
                  v-model="equipmentForm.purchaseDate"
                  type="date"
                  placeholder="选择采购日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="保修到期" prop="warrantyExpiry">
                <el-date-picker
                  v-model="equipmentForm.warrantyExpiry"
                  type="date"
                  placeholder="选择保修到期日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-form-item label="供应商" prop="supplier">
                <el-input v-model="equipmentForm.supplier" placeholder="请输入供应商名称" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 技术规格 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">技术规格</span>
              <el-button type="primary" @click="addSpecification">
                <el-icon><Plus /></el-icon>
                添加规格
              </el-button>
            </div>
          </template>
          
          <div class="specifications-list">
            <div 
              v-for="(spec, index) in equipmentForm.specifications" 
              :key="index"
              class="spec-item"
            >
              <el-row :gutter="10">
                <el-col :span="8">
                  <el-input 
                    v-model="spec.name" 
                    placeholder="规格名称"
                  />
                </el-col>
                <el-col :span="12">
                  <el-input 
                    v-model="spec.value" 
                    placeholder="规格值"
                  />
                </el-col>
                <el-col :span="4">
                  <el-button 
                    type="danger" 
                    @click="removeSpecification(index)"
                  >
                    删除
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <div v-if="equipmentForm.specifications.length === 0" class="empty-specs">
              暂无技术规格，点击上方按钮添加
            </div>
          </div>
        </el-card>

        <!-- 设备图片 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <span class="card-title">设备图片</span>
          </template>
          
          <el-upload
            v-model:file-list="equipmentForm.images"
            action="#"
            :auto-upload="false"
            list-type="picture-card"
            :limit="5"
            accept="image/*"
            @exceed="handleImageExceed"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png格式，单张图片不超过2MB，最多5张
              </div>
            </template>
          </el-upload>
        </el-card>

        <!-- 设备描述 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <span class="card-title">设备描述</span>
          </template>
          
          <el-form-item prop="description">
            <el-input
              v-model="equipmentForm.description"
              type="textarea"
              :rows="6"
              placeholder="请输入设备详细描述、用途、特点等信息"
            />
          </el-form-item>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, 
  Check, 
  Document, 
  Plus 
} from '@element-plus/icons-vue'
import { EquipmentCategory, EquipmentStatus } from '@/types/equipment'
import type { Equipment, EquipmentStatusType, EquipmentCategoryType } from '@/types/equipment'

const route = useRoute()
const router = useRouter()

// 响应式数据
const equipmentFormRef = ref()
const submitting = ref(false)

// 是否为编辑模式
const isEdit = computed(() => route.path.includes('edit'))

// 设备表单数据
const equipmentForm = reactive({
  name: '',
  model: '',
  code: '',
  category: '',
  status: EquipmentStatus.AVAILABLE,
  warehouse: '',
  purchasePrice: 0,
  dailyRate: 0,
  purchaseDate: '',
  warrantyExpiry: '',
  supplier: '',
  specifications: [] as Array<{name: string, value: string}>,
  images: [] as any[],
  description: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  code: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  category: [{ required: true, message: '请选择设备分类', trigger: 'change' }],
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择所在仓库', trigger: 'change' }],
  purchasePrice: [{ required: true, message: '请输入采购价格', trigger: 'blur' }],
  dailyRate: [{ required: true, message: '请输入日租金', trigger: 'blur' }],
  purchaseDate: [{ required: true, message: '请选择采购日期', trigger: 'change' }]
}

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
  { label: '北京仓库', value: '北京仓库' },
  { label: '上海仓库', value: '上海仓库' },
  { label: '广州仓库', value: '广州仓库' },
  { label: '成都仓库', value: '成都仓库' }
]

// 方法
const addSpecification = () => {
  equipmentForm.specifications.push({
    name: '',
    value: ''
  })
}

const removeSpecification = (index: number) => {
  equipmentForm.specifications.splice(index, 1)
}

const handleImageExceed = () => {
  ElMessage.warning('最多只能上传5张图片')
}

const saveDraft = async () => {
  try {
    // TODO: 保存草稿API
    ElMessage.success('草稿保存成功')
  } catch (error) {
    ElMessage.error('保存草稿失败')
  }
}

const submitForm = async () => {
  if (!equipmentFormRef.value) return
  
  try {
    await equipmentFormRef.value.validate()
    
    submitting.value = true
    
    // 构建提交数据
    const submitData = {
      ...equipmentForm,
      // 过滤空的规格项
      specifications: equipmentForm.specifications.filter(spec => 
        spec.name.trim() !== '' && spec.value.trim() !== ''
      )
    }
    
    // TODO: 调用创建/更新设备API
    console.log('Submit equipment:', submitData)
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    ElMessage.success(isEdit.value ? '设备更新成功' : '设备添加成功')
    goBack()
  } catch (error) {
    console.error('Submit equipment error:', error)
    ElMessage.error(isEdit.value ? '设备更新失败' : '设备添加失败')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/equipment/list')
}

const loadEquipmentData = async () => {
  if (isEdit.value) {
    const equipmentId = route.params.id as string
    try {
      // TODO: 调用API获取设备详情
      // const response = await getEquipmentDetail(equipmentId)
      // const equipment = response.data
      
      // 模拟从API获取的设备数据（与Detail.vue中的数据保持一致）
      const equipment = {
        id: equipmentId,
        code: 'EQ20240001',
        name: '挖掘机CAT320D',
        model: 'CAT320D',
        category: EquipmentCategory.EXCAVATOR,
        status: EquipmentStatus.AVAILABLE,
        dailyRate: 1500,
        purchasePrice: 980000,
        warehouse: '北京仓库',
        purchaseDate: '2023-01-15',
        warrantyExpiry: '2025-01-15',
        lastMaintenanceDate: '2023-12-01',
        specifications: {
          '发动机功率': '121kW',
          '工作重量': '20.2t',
          '斗容量': '0.93m³',
          '最大挖掘深度': '6.53m',
          '最大挖掘半径': '9.66m',
          '最大卸载高度': '6.68m'
        },
        supplier: '卡特彼勒(中国)',
        description: '大型履带式挖掘机，适用于各种土方作业。配备先进的液压系统和智能控制技术，作业效率高，燃油经济性好。适合大型工程项目使用。'
      }
      
      // 回显数据到表单
      equipmentForm.name = equipment.name
      equipmentForm.model = equipment.model
      equipmentForm.code = equipment.code
      equipmentForm.category = equipment.category
      equipmentForm.status = equipment.status
      equipmentForm.warehouse = equipment.warehouse
      equipmentForm.purchasePrice = equipment.purchasePrice
      equipmentForm.dailyRate = equipment.dailyRate
      equipmentForm.purchaseDate = equipment.purchaseDate
      equipmentForm.warrantyExpiry = equipment.warrantyExpiry
      equipmentForm.supplier = equipment.supplier
      equipmentForm.description = equipment.description
      
      // 转换规格对象为数组格式
      if (equipment.specifications) {
        equipmentForm.specifications = Object.entries(equipment.specifications).map(([name, value]) => ({
          name,
          value
        }))
      }
      
      console.log('Equipment data loaded:', equipment)
    } catch (error) {
      console.error('Load equipment error:', error)
      ElMessage.error('加载设备数据失败')
      goBack()
    }
  }
}

// 生命周期
onMounted(() => {
  // 为新增设备生成编号
  if (!isEdit.value) {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    equipmentForm.code = `EQ${year}${month}${day}${random}`
  }
  
  loadEquipmentData()
})
</script>

<style lang="scss" scoped>
.equipment-form-container {
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
      
      .specifications-list {
        .spec-item {
          margin-bottom: 15px;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
        
        .empty-specs {
          text-align: center;
          color: #999;
          padding: 40px 0;
          font-size: 14px;
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .equipment-form-container {
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
        .specifications-list {
          .spec-item {
            .el-col {
              margin-bottom: 10px;
            }
          }
        }
      }
    }
  }
}
</style>
