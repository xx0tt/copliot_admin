<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    :modal="modal"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="handleBeforeClose"
    :destroy-on-close="destroyOnClose"
    :draggable="draggable"
    :align-center="alignCenter"
    class="custom-dialog"
    @open="handleOpen"
    @opened="handleOpened"
    @close="handleClose"
    @closed="handleClosed"
  >
    <!-- 对话框头部插槽 -->
    <template #header="{ close, titleId, titleClass }" v-if="$slots.header">
      <slot name="header" :close="close" :titleId="titleId" :titleClass="titleClass"></slot>
    </template>

    <!-- 对话框内容 -->
    <div class="dialog-content" v-loading="loading">
      <slot></slot>
    </div>

    <!-- 对话框底部操作区 -->
    <template #footer v-if="showFooter">
      <slot name="footer">
        <div class="dialog-footer">
          <el-button @click="handleCancel" :disabled="loading">
            {{ cancelText }}
          </el-button>
          <el-button
            type="primary"
            @click="handleConfirm"
            :loading="loading"
            v-if="showConfirm"
          >
            {{ confirmText }}
          </el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

// Props 定义
interface Props {
  modelValue: boolean
  title?: string
  width?: string | number
  fullscreen?: boolean
  modal?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  destroyOnClose?: boolean
  draggable?: boolean
  alignCenter?: boolean
  loading?: boolean
  showFooter?: boolean
  showConfirm?: boolean
  confirmText?: string
  cancelText?: string
  beforeClose?: (done: () => void) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  width: '50%',
  fullscreen: false,
  modal: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  showClose: true,
  destroyOnClose: false,
  draggable: false,
  alignCenter: false,
  loading: false,
  showFooter: true,
  showConfirm: true,
  confirmText: '确定',
  cancelText: '取消'
})

// 事件定义
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'open': []
  'opened': []
  'close': []
  'closed': []
  'confirm': []
  'cancel': []
}>()

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

// 事件处理
const handleOpen = () => {
  emit('open')
}

const handleOpened = () => {
  emit('opened')
}

const handleClose = () => {
  emit('close')
}

const handleClosed = () => {
  emit('closed')
}

const handleBeforeClose = (done: () => void) => {
  if (props.beforeClose) {
    props.beforeClose(done)
  } else {
    done()
  }
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  visible.value = false
}
</script>

<style scoped lang="scss">
.custom-dialog {
  .dialog-content {
    min-height: 100px;
    padding: 20px 0;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

// 全屏模式下的特殊样式
:deep(.el-dialog__wrapper) {
  .el-dialog.is-fullscreen {
    .el-dialog__body {
      padding: 20px 30px 30px;
    }
  }
}

// 对话框动画优化
:deep(.el-dialog) {
  .el-dialog__header {
    border-bottom: 1px solid var(--el-border-color-light);
    padding: 20px 20px 15px;
    margin: 0;
  }

  .el-dialog__body {
    padding: 0 20px;
  }

  .el-dialog__footer {
    border-top: 1px solid var(--el-border-color-light);
    padding: 15px 20px 20px;
    margin: 0;
  }
}

// 响应式处理
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto !important;

    .el-dialog__header,
    .el-dialog__body,
    .el-dialog__footer {
      padding-left: 15px;
      padding-right: 15px;
    }
  }
}
</style>
