<template>
  <el-card class="search-form-card">
    <el-form
      ref="formRef"
      :model="formData"
      :inline="inline"
      :label-width="labelWidth"
      class="search-form"
    >
      <template v-for="field in fields" :key="field.prop">
        <el-form-item :label="field.label" v-if="!field.hidden">
          <!-- 输入框 -->
          <el-input
            v-if="field.type === 'input'"
            v-model="formData[field.prop]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            :clearable="field.clearable !== false"
            v-bind="field.props"
          />
          
          <!-- 选择器 -->
          <el-select
            v-else-if="field.type === 'select'"
            v-model="formData[field.prop]"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :clearable="field.clearable !== false"
            :filterable="field.filterable"
            v-bind="field.props"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
              :disabled="option.disabled"
            />
          </el-select>
          
          <!-- 日期选择器 -->
          <el-date-picker
            v-else-if="field.type === 'date'"
            v-model="formData[field.prop]"
            :type="field.dateType || 'date'"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :clearable="field.clearable !== false"
            v-bind="field.props"
          />
          
          <!-- 日期范围选择器 -->
          <el-date-picker
            v-else-if="field.type === 'daterange'"
            v-model="formData[field.prop]"
            type="daterange"
            range-separator="至"
            :start-placeholder="field.startPlaceholder || '开始日期'"
            :end-placeholder="field.endPlaceholder || '结束日期'"
            :clearable="field.clearable !== false"
            v-bind="field.props"
          />
          
          <!-- 数字输入框 -->
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="formData[field.prop]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            v-bind="field.props"
          />
          
          <!-- 级联选择器 -->
          <el-cascader
            v-else-if="field.type === 'cascader'"
            v-model="formData[field.prop]"
            :options="field.options"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :clearable="field.clearable !== false"
            v-bind="field.props"
          />
          
          <!-- 树形选择器 -->
          <el-tree-select
            v-else-if="field.type === 'tree-select'"
            v-model="formData[field.prop]"
            :data="field.options"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :clearable="field.clearable !== false"
            v-bind="field.props"
          />
          
          <!-- 自定义插槽 -->
          <slot
            v-else-if="field.type === 'slot'"
            :name="field.slot"
            :field="field"
            :value="formData[field.prop]"
            :setValue="(value: any) => formData[field.prop] = value"
          />
        </el-form-item>
      </template>
      
      <!-- 操作按钮 -->
      <el-form-item class="search-buttons">
        <el-button type="primary" @click="handleSearch" :loading="loading">
          <el-icon><Search /></el-icon>
          {{ searchText }}
        </el-button>
        <el-button @click="handleReset">
          {{ resetText }}
        </el-button>
        <el-button 
          v-if="expandable && fields.length > collapseFields"
          type="text" 
          @click="toggleExpanded"
        >
          {{ expanded ? '收起' : '展开' }}
          <el-icon class="expand-icon" :class="{ expanded }">
            <ArrowDown />
          </el-icon>
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

// 字段配置接口
interface FieldOption {
  label: string
  value: any
  disabled?: boolean
}

interface Field {
  prop: string
  label: string
  type: 'input' | 'select' | 'date' | 'daterange' | 'number' | 'cascader' | 'tree-select' | 'slot'
  placeholder?: string
  startPlaceholder?: string
  endPlaceholder?: string
  clearable?: boolean
  filterable?: boolean
  dateType?: string
  options?: FieldOption[] | any[]
  slot?: string
  hidden?: boolean
  props?: Record<string, any>
}

interface Props {
  // 表单字段配置
  fields: Field[]
  // 表单数据
  modelValue?: Record<string, any>
  // 是否内联
  inline?: boolean
  // 标签宽度
  labelWidth?: string | number
  // 搜索按钮文本
  searchText?: string
  // 重置按钮文本
  resetText?: string
  // 是否支持展开收起
  expandable?: boolean
  // 收起时显示的字段数量
  collapseFields?: number
  // 加载状态
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fields: () => [],
  modelValue: () => ({}),
  inline: true,
  labelWidth: 'auto',
  searchText: '搜索',
  resetText: '重置',
  expandable: false,
  collapseFields: 3,
  loading: false
})

// 定义事件
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  search: [value: Record<string, any>]
  reset: []
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 是否展开
const expanded = ref(false)

// 表单数据
const formData = reactive<Record<string, any>>({})

// 初始化表单数据
const initFormData = () => {
  props.fields.forEach(field => {
    if (!(field.prop in formData)) {
      formData[field.prop] = props.modelValue[field.prop] || getDefaultValue(field.type)
    }
  })
}

// 获取默认值
const getDefaultValue = (type: string) => {
  switch (type) {
    case 'input':
    case 'select':
    case 'date':
      return ''
    case 'daterange':
      return []
    case 'number':
      return null
    case 'cascader':
    case 'tree-select':
      return []
    default:
      return ''
  }
}

// 计算显示的字段
const visibleFields = computed(() => {
  if (!props.expandable) {
    return props.fields
  }
  
  if (expanded.value) {
    return props.fields
  } else {
    return props.fields.slice(0, props.collapseFields)
  }
})

// 监听外部数据变化
watch(() => props.modelValue, (newValue) => {
  Object.assign(formData, newValue)
}, { deep: true })

// 监听内部数据变化
watch(formData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

// 初始化
initFormData()

// 处理搜索
const handleSearch = () => {
  emit('search', { ...formData })
}

// 处理重置
const handleReset = () => {
  formRef.value?.resetFields()
  
  // 重置表单数据
  props.fields.forEach(field => {
    formData[field.prop] = getDefaultValue(field.type)
  })
  
  emit('reset')
}

// 切换展开收起
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

// 暴露方法
defineExpose({
  formRef,
  formData,
  handleSearch,
  handleReset
})
</script>

<style lang="scss" scoped>
.search-form-card {
  margin-bottom: 16px;
  
  .search-form {
    margin: 0;
    
    .search-buttons {
      margin-left: auto;
      
      .expand-icon {
        margin-left: 4px;
        transition: transform 0.3s;
        
        &.expanded {
          transform: rotate(180deg);
        }
      }
    }
  }
}
</style>
