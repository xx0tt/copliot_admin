<template>
  <div class="export-component">
    <el-dropdown @command="handleExportCommand" trigger="click">
      <el-button type="primary" :loading="exporting">
        <el-icon><Download /></el-icon>
        {{ buttonText }}
        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item 
            v-for="option in exportOptions" 
            :key="option.value"
            :command="option.value"
            :disabled="option.disabled"
          >
            <el-icon class="mr-2">
              <component :is="option.icon" />
            </el-icon>
            {{ option.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 导出配置对话框 -->
    <el-dialog
      v-model="configVisible"
      title="导出配置"
      width="600px"
      @close="resetConfig"
    >
      <el-form :model="exportConfig" label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportConfig.format">
            <el-radio label="excel">Excel (.xlsx)</el-radio>
            <el-radio label="csv">CSV (.csv)</el-radio>
            <el-radio label="pdf" v-if="supportPdf">PDF (.pdf)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="导出范围">
          <el-radio-group v-model="exportConfig.range">
            <el-radio label="current">当前页数据</el-radio>
            <el-radio label="all">全部数据</el-radio>
            <el-radio label="selected" v-if="hasSelected">已选择数据</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="导出字段" v-if="columns.length">
          <el-checkbox-group v-model="exportConfig.fields">
            <el-checkbox 
              v-for="column in columns" 
              :key="column.prop"
              :label="column.prop"
              :disabled="column.required"
            >
              {{ column.label }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="field-actions">
            <el-button size="small" @click="selectAllFields">全选</el-button>
            <el-button size="small" @click="clearAllFields">清空</el-button>
            <el-button size="small" @click="selectRequiredFields">必选项</el-button>
          </div>
        </el-form-item>

        <el-form-item label="文件名称">
          <el-input 
            v-model="exportConfig.filename" 
            placeholder="请输入文件名称"
            maxlength="50"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="configVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExport" :loading="exporting">
            确认导出
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Download, 
  ArrowDown, 
  Document, 
  Tickets, 
  Files 
} from '@element-plus/icons-vue'

// 类型定义
interface Column {
  prop: string
  label: string
  required?: boolean
}

interface ExportOption {
  value: string
  label: string
  icon: any
  disabled?: boolean
}

interface ExportConfig {
  format: 'excel' | 'csv' | 'pdf'
  range: 'current' | 'all' | 'selected'
  fields: string[]
  filename: string
}

// Props 定义
interface Props {
  data?: any[]
  columns?: Column[]
  selectedData?: any[]
  filename?: string
  buttonText?: string
  supportPdf?: boolean
  exportUrl?: string
  onExport?: (config: ExportConfig) => Promise<void> | void
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  selectedData: () => [],
  filename: '导出数据',
  buttonText: '导出数据',
  supportPdf: false,
  exportUrl: '/api/export'
})

// 事件定义
const emit = defineEmits<{
  'export-start': [config: ExportConfig]
  'export-success': [data: any]
  'export-error': [error: any]
}>()

// 响应式数据
const exporting = ref(false)
const configVisible = ref(false)
const currentExportType = ref('')

const exportConfig = ref<ExportConfig>({
  format: 'excel',
  range: 'current',
  fields: [],
  filename: props.filename
})

// 计算属性
const hasSelected = computed(() => props.selectedData && props.selectedData.length > 0)

const exportOptions = computed<ExportOption[]>(() => [
  {
    value: 'quick-excel',
    label: '快速导出Excel',
    icon: Document
  },
  {
    value: 'quick-csv',
    label: '快速导出CSV',
    icon: Tickets
  },
  {
    value: 'config',
    label: '自定义导出',
    icon: Files
  }
])

// 导出命令处理
const handleExportCommand = (command: string) => {
  currentExportType.value = command
  
  switch (command) {
    case 'quick-excel':
      quickExport('excel')
      break
    case 'quick-csv':
      quickExport('csv')
      break
    case 'config':
      showExportConfig()
      break
  }
}

// 快速导出
const quickExport = async (format: 'excel' | 'csv') => {
  const config: ExportConfig = {
    format,
    range: 'current',
    fields: props.columns.map(col => col.prop),
    filename: `${props.filename}_${new Date().toISOString().split('T')[0]}`
  }
  
  await executeExport(config)
}

// 显示导出配置对话框
const showExportConfig = () => {
  // 初始化配置
  exportConfig.value = {
    format: 'excel',
    range: 'current',
    fields: props.columns.filter(col => col.required || !col.hasOwnProperty('required')).map(col => col.prop),
    filename: `${props.filename}_${new Date().toISOString().split('T')[0]}`
  }
  
  configVisible.value = true
}

// 字段选择操作
const selectAllFields = () => {
  exportConfig.value.fields = props.columns.map(col => col.prop)
}

const clearAllFields = () => {
  exportConfig.value.fields = props.columns.filter(col => col.required).map(col => col.prop)
}

const selectRequiredFields = () => {
  exportConfig.value.fields = props.columns.filter(col => col.required).map(col => col.prop)
}

// 确认导出
const confirmExport = async () => {
  if (exportConfig.value.fields.length === 0) {
    ElMessage.warning('请至少选择一个导出字段')
    return
  }
  
  configVisible.value = false
  await executeExport(exportConfig.value)
}

// 执行导出
const executeExport = async (config: ExportConfig) => {
  try {
    exporting.value = true
    emit('export-start', config)

    // 如果提供了自定义导出函数
    if (props.onExport) {
      await props.onExport(config)
      emit('export-success', null)
      ElMessage.success('导出成功')
      return
    }

    // 准备导出数据
    let exportData = []
    switch (config.range) {
      case 'current':
        exportData = props.data
        break
      case 'all':
        exportData = await fetchAllData()
        break
      case 'selected':
        exportData = props.selectedData || []
        break
    }

    // 过滤字段
    const filteredData = exportData.map(item => {
      const filtered: any = {}
      config.fields.forEach(field => {
        if (item.hasOwnProperty(field)) {
          filtered[field] = item[field]
        }
      })
      return filtered
    })

    // 根据格式导出
    switch (config.format) {
      case 'excel':
        await exportToExcel(filteredData, config)
        break
      case 'csv':
        await exportToCSV(filteredData, config)
        break
      case 'pdf':
        await exportToPDF(filteredData, config)
        break
    }

    emit('export-success', filteredData)
    ElMessage.success('导出成功')
    
  } catch (error) {
    console.error('导出失败:', error)
    emit('export-error', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 获取全部数据
const fetchAllData = async (): Promise<any[]> => {
  // 这里应该调用API获取全部数据
  // 暂时返回当前数据
  return props.data
}

// 导出为Excel
const exportToExcel = async (data: any[], config: ExportConfig) => {
  // 这里使用第三方库如 xlsx 来生成Excel文件
  // 或者发送请求到后端生成
  const { utils, writeFile } = await import('xlsx')
  
  // 创建工作表
  const worksheet = utils.json_to_sheet(data)
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  
  // 下载文件
  writeFile(workbook, `${config.filename}.xlsx`)
}

// 导出为CSV
const exportToCSV = async (data: any[], config: ExportConfig) => {
  if (data.length === 0) return
  
  // 生成CSV内容
  const headers = config.fields
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || ''
        // 处理包含逗号的值
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      }).join(',')
    )
  ].join('\n')
  
  // 下载文件
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${config.filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 导出为PDF
const exportToPDF = async (data: any[], config: ExportConfig) => {
  // 这里可以使用 jsPDF 等库生成PDF
  // 或者发送请求到后端生成
  ElMessage.info('PDF导出功能开发中...')
}

// 重置配置
const resetConfig = () => {
  exportConfig.value = {
    format: 'excel',
    range: 'current',
    fields: [],
    filename: props.filename
  }
}

// 暴露方法
defineExpose({
  quickExport,
  showExportConfig,
  executeExport
})
</script>

<style scoped lang="scss">
.export-component {
  display: inline-block;

  .field-actions {
    margin-top: 10px;
    display: flex;
    gap: 8px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .mr-2 {
    margin-right: 8px;
  }
}

// 下拉菜单样式优化
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  
  .el-icon {
    margin-right: 8px;
  }
}

// 复选框组样式
:deep(.el-checkbox-group) {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 10px;
  
  .el-checkbox {
    display: block;
    margin-bottom: 8px;
    margin-right: 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
