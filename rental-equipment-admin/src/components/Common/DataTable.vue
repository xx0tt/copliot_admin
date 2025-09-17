<template>
  <div class="data-table">
    <!-- 表格工具栏 -->
    <div class="table-toolbar" v-if="showToolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <el-button 
            v-if="showAddButton" 
            type="primary" 
            @click="$emit('add')"
          >
            <el-icon><Plus /></el-icon>
            {{ addButtonText }}
          </el-button>
        </slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right">
          <!-- 刷新按钮 -->
          <el-button 
            circle 
            @click="$emit('refresh')"
            :loading="loading"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
          <!-- 列设置 -->
          <el-popover 
            placement="bottom-end" 
            :width="200" 
            trigger="click"
          >
            <template #reference>
              <el-button circle>
                <el-icon><Setting /></el-icon>
              </el-button>
            </template>
            <div class="column-settings">
              <el-checkbox-group v-model="visibleColumns">
                <div 
                  v-for="column in columnOptions" 
                  :key="column.prop"
                  class="column-item"
                >
                  <el-checkbox :label="column.prop">
                    {{ column.label }}
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
          </el-popover>
        </slot>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      ref="tableRef"
      :data="data"
      :loading="loading"
      v-bind="tableProps"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 选择列 -->
      <el-table-column 
        v-if="selectable"
        type="selection" 
        width="55"
        :selectable="selectableFunction"
      />
      
      <!-- 序号列 -->
      <el-table-column 
        v-if="showIndex"
        type="index" 
        label="序号" 
        width="60"
        :index="indexMethod"
      />
      
      <!-- 动态列 -->
      <template v-for="column in filteredColumns" :key="column.prop">
        <el-table-column
          v-if="visibleColumns.includes(column.prop)"
          v-bind="column"
        >
          <template #default="scope" v-if="column.slot">
            <slot 
              :name="column.slot" 
              :row="scope.row" 
              :column="scope.column"
              :$index="scope.$index"
            />
          </template>
        </el-table-column>
      </template>
      
      <!-- 操作列 -->
      <el-table-column 
        v-if="showActions"
        label="操作" 
        :width="actionWidth"
        :fixed="actionFixed"
      >
        <template #default="scope">
          <slot 
            name="actions" 
            :row="scope.row" 
            :index="scope.$index"
          >
            <el-button 
              type="primary" 
              text 
              @click="$emit('view', scope.row)"
            >
              查看
            </el-button>
            <el-button 
              type="success" 
              text 
              @click="$emit('edit', scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              text 
              @click="$emit('delete', scope.row)"
            >
              删除
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="table-pagination" v-if="showPagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Plus, Refresh, Setting } from '@element-plus/icons-vue'
import type { ElTable } from 'element-plus'

// 定义接口
interface Column {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  slot?: string
  [key: string]: any
}

interface Props {
  // 表格数据
  data: any[]
  // 表格列配置
  columns: Column[]
  // 加载状态
  loading?: boolean
  // 是否显示工具栏
  showToolbar?: boolean
  // 是否显示添加按钮
  showAddButton?: boolean
  // 添加按钮文本
  addButtonText?: string
  // 是否可选择
  selectable?: boolean
  // 选择函数
  selectableFunction?: (row: any, index: number) => boolean
  // 是否显示序号
  showIndex?: boolean
  // 序号计算方法
  indexMethod?: (index: number) => number
  // 是否显示操作列
  showActions?: boolean
  // 操作列宽度
  actionWidth?: number | string
  // 操作列固定
  actionFixed?: boolean | 'left' | 'right'
  // 是否显示分页
  showPagination?: boolean
  // 当前页码
  currentPage?: number
  // 每页数量
  pageSize?: number
  // 总数量
  total?: number
  // 分页大小选项
  pageSizes?: number[]
  // 分页布局
  paginationLayout?: string
  // 表格其他属性
  tableProps?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  showToolbar: true,
  showAddButton: true,
  addButtonText: '新增',
  selectable: false,
  selectableFunction: () => true,
  showIndex: false,
  indexMethod: (index: number) => index + 1,
  showActions: true,
  actionWidth: 180,
  actionFixed: 'right',
  showPagination: true,
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  tableProps: () => ({})
})

// 定义事件
const emit = defineEmits<{
  add: []
  view: [row: any]
  edit: [row: any]
  delete: [row: any]
  refresh: []
  selectionChange: [selection: any[]]
  sortChange: [sort: { column: any, prop: string, order: string | null }]
  sizeChange: [size: number]
  currentChange: [current: number]
}>()

// 表格引用
const tableRef = ref<InstanceType<typeof ElTable>>()

// 当前页码和每页数量
const currentPage = ref(props.currentPage)
const pageSize = ref(props.pageSize)

// 可见列
const visibleColumns = ref<string[]>([])

// 列选项
const columnOptions = computed(() => {
  return props.columns.map(column => ({
    prop: column.prop,
    label: column.label
  }))
})

// 过滤后的列
const filteredColumns = computed(() => {
  return props.columns.filter(column => 
    visibleColumns.value.includes(column.prop)
  )
})

// 初始化可见列
watch(() => props.columns, (newColumns) => {
  if (newColumns.length > 0 && visibleColumns.value.length === 0) {
    visibleColumns.value = newColumns.map(column => column.prop)
  }
}, { immediate: true })

// 监听外部页码变化
watch(() => props.currentPage, (newPage) => {
  currentPage.value = newPage
})

watch(() => props.pageSize, (newSize) => {
  pageSize.value = newSize
})

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  emit('selectionChange', selection)
}

// 处理排序变化
const handleSortChange = (sort: { column: any, prop: string, order: string | null }) => {
  emit('sortChange', sort)
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  emit('sizeChange', size)
}

// 处理当前页变化
const handleCurrentChange = (current: number) => {
  currentPage.value = current
  emit('currentChange', current)
}

// 清空选择
const clearSelection = () => {
  tableRef.value?.clearSelection()
}

// 设置行选中
const toggleRowSelection = (row: any, selected?: boolean) => {
  tableRef.value?.toggleRowSelection(row, selected)
}

// 暴露方法
defineExpose({
  clearSelection,
  toggleRowSelection,
  tableRef
})
</script>

<style lang="scss" scoped>
.data-table {
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  
  .column-settings {
    .column-item {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .table-pagination {
    margin-top: 16px;
    text-align: right;
  }
}
</style>
