<template>
  <div class="error-boundary">
    <el-result
      v-if="hasError"
      icon="error"
      title="页面出现错误"
      :sub-title="errorMessage"
    >
      <template #extra>
        <div class="error-actions">
          <el-button type="primary" @click="retry">
            重新加载
          </el-button>
          <el-button @click="goHome">
            返回首页
          </el-button>
          <el-button @click="reportError" v-if="showReportButton">
            报告错误
          </el-button>
        </div>
      </template>
      
      <!-- 错误详情（开发环境显示） -->
      <div v-if="isDev && errorDetail" class="error-detail">
        <el-collapse>
          <el-collapse-item title="错误详情" name="detail">
            <pre class="error-stack">{{ errorDetail }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-result>
    
    <!-- 正常内容 -->
    <slot v-else></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// Props 定义
interface Props {
  showReportButton?: boolean
  onError?: (error: Error, errorInfo: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  showReportButton: true
})

// 事件定义
const emit = defineEmits<{
  'error': [error: Error, errorInfo: any]
  'retry': []
  'report': [error: Error, errorInfo: any]
}>()

// 响应式数据
const hasError = ref(false)
const errorMessage = ref('')
const errorDetail = ref('')
const currentError = ref<Error | null>(null)
const errorInfo = ref<any>(null)

const router = useRouter()

// 计算属性
const isDev = computed(() => {
  return process.env.NODE_ENV === 'development'
})

// 错误捕获
onErrorCaptured((error: Error, instance: any, info: string) => {
  console.error('ErrorBoundary caught an error:', error)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
  
  hasError.value = true
  currentError.value = error
  errorInfo.value = { instance, info }
  
  // 设置用户友好的错误消息
  errorMessage.value = getErrorMessage(error)
  
  // 在开发环境显示详细错误信息
  if (isDev.value) {
    errorDetail.value = `${error.name}: ${error.message}\n\n${error.stack}`
  }
  
  // 调用父组件传入的错误处理函数
  if (props.onError) {
    props.onError(error, { instance, info })
  }
  
  // 发送错误事件
  emit('error', error, { instance, info })
  
  // 阻止错误继续传播
  return false
})

// 方法
const getErrorMessage = (error: Error): string => {
  // 根据错误类型返回用户友好的消息
  if (error.name === 'ChunkLoadError') {
    return '页面资源加载失败，可能是网络问题'
  } else if (error.name === 'TypeError') {
    return '页面运行出现异常'
  } else if (error.message.includes('fetch')) {
    return '网络请求失败，请检查网络连接'
  } else if (error.message.includes('permission')) {
    return '权限不足，请联系管理员'
  } else {
    return '页面运行出现未知错误'
  }
}

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetail.value = ''
  currentError.value = null
  errorInfo.value = null
  
  emit('retry')
  ElMessage.info('正在重新加载...')
}

const goHome = () => {
  router.push('/')
}

const reportError = async () => {
  if (!currentError.value) return
  
  try {
    // 这里应该调用错误报告API
    const errorReport = {
      message: currentError.value.message,
      stack: currentError.value.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorInfo: errorInfo.value
    }
    
    console.log('Error report:', errorReport)
    
    // 模拟发送错误报告
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('report', currentError.value, errorInfo.value)
    ElMessage.success('错误报告已发送')
  } catch (error) {
    console.error('Failed to report error:', error)
    ElMessage.error('发送错误报告失败')
  }
}

// 暴露方法
defineExpose({
  retry,
  hasError: () => hasError.value,
  getError: () => currentError.value
})
</script>

<style scoped lang="scss">
.error-boundary {
  width: 100%;
  height: 100%;
  
  .error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .error-detail {
    margin-top: 20px;
    text-align: left;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    
    .error-stack {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.5;
      color: #d63384;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}

// 响应式处理
@media (max-width: 768px) {
  .error-boundary {
    .error-actions {
      flex-direction: column;
      align-items: center;
      
      .el-button {
        width: 200px;
      }
    }
    
    .error-detail {
      margin: 20px 10px 0;
      
      .error-stack {
        font-size: 11px;
        padding: 12px;
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .error-boundary {
    .error-detail {
      .error-stack {
        background-color: #2d2d2d;
        color: #ff6b6b;
      }
    }
  }
}
</style>
