<template>
  <div class="upload-component">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="uploadUrl"
      :multiple="multiple"
      :limit="limit"
      :accept="accept"
      :size="size"
      :show-file-list="showFileList"
      :drag="drag"
      :auto-upload="autoUpload"
      :headers="headers"
      :data="data"
      :before-upload="handleBeforeUpload"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :on-change="handleChange"
      :on-exceed="handleExceed"
      :list-type="listType"
      class="upload-container"
    >
      <!-- 拖拽上传区域 -->
      <template v-if="drag">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          {{ dragText || '将文件拖到此处，或' }}
          <em>点击上传</em>
        </div>
        <template v-if="tip">
          <div class="el-upload__tip">{{ tip }}</div>
        </template>
      </template>

      <!-- 按钮上传 -->
      <template v-else-if="listType === 'text'">
        <el-button type="primary" :icon="Upload">
          {{ buttonText || '选择文件' }}
        </el-button>
        <template v-if="tip">
          <div class="el-upload__tip">{{ tip }}</div>
        </template>
      </template>

      <!-- 照片墙上传 -->
      <template v-else-if="listType === 'picture-card'">
        <el-icon><Plus /></el-icon>
        <template v-if="tip">
          <div class="el-upload__tip">{{ tip }}</div>
        </template>
      </template>

      <!-- 图片上传 -->
      <template v-else>
        <img v-if="imageUrl" :src="imageUrl" class="avatar" />
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        <template v-if="tip">
          <div class="el-upload__tip">{{ tip }}</div>
        </template>
      </template>
    </el-upload>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" width="800px" align-center>
      <img w-full :src="previewImageUrl" alt="预览图片" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Plus, UploadFilled } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, UploadFile, UploadRawFile } from 'element-plus'

// Props 定义
interface Props {
  modelValue?: string | string[] | UploadUserFile[]
  uploadUrl?: string
  multiple?: boolean
  limit?: number
  accept?: string
  size?: number // MB
  showFileList?: boolean
  drag?: boolean
  autoUpload?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  headers?: Record<string, any>
  data?: Record<string, any>
  tip?: string
  buttonText?: string
  dragText?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  uploadUrl: '/api/upload',
  multiple: false,
  limit: 1,
  accept: '',
  size: 5,
  showFileList: true,
  drag: false,
  autoUpload: true,
  listType: 'text',
  disabled: false
})

// 事件定义
const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | UploadUserFile[]]
  'success': [response: any, file: UploadFile, fileList: UploadFile[]]
  'error': [error: any, file: UploadFile, fileList: UploadFile[]]
  'progress': [event: any, file: UploadFile, fileList: UploadFile[]]
  'change': [file: UploadFile, fileList: UploadFile[]]
  'remove': [file: UploadFile, fileList: UploadFile[]]
  'preview': [file: UploadFile]
  'exceed': [files: File[], fileList: UploadUserFile[]]
}>()

// 响应式数据
const uploadRef = ref()
const fileList = ref<UploadUserFile[]>([])
const previewVisible = ref(false)
const previewImageUrl = ref('')

// 计算属性
const imageUrl = computed(() => {
  if (props.listType === 'picture' && typeof props.modelValue === 'string') {
    return props.modelValue
  }
  return ''
})

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (Array.isArray(newValue)) {
      fileList.value = newValue
    } else if (typeof newValue === 'string' && newValue) {
      if (props.listType === 'picture-card' || props.listType === 'text') {
        fileList.value = [
          {
            name: newValue.split('/').pop() || '',
            url: newValue
          }
        ]
      }
    } else {
      fileList.value = []
    }
  },
  { immediate: true, deep: true }
)

// 文件上传前的钩子
const handleBeforeUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  // 文件类型检查
  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(type => type.trim())
    const fileType = rawFile.type
    const fileName = rawFile.name
    const fileExtension = '.' + fileName.split('.').pop()?.toLowerCase()

    const isValidType = acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase()
      } else {
        return fileType.startsWith(type.replace('*', ''))
      }
    })

    if (!isValidType) {
      ElMessage.error(`文件格式不正确，请选择 ${props.accept} 格式的文件`)
      return false
    }
  }

  // 文件大小检查
  if (props.size && rawFile.size / 1024 / 1024 > props.size) {
    ElMessage.error(`文件大小不能超过 ${props.size}MB`)
    return false
  }

  return true
}

// 文件上传成功回调
const handleSuccess: UploadProps['onSuccess'] = (response, file, fileList) => {
  // 假设后端返回的数据格式为 { code: 200, data: { url: 'xxx' } }
  if (response.code === 200) {
    const url = response.data.url
    
    if (props.multiple) {
      const urls = fileList.map(item => item.response?.data?.url || item.url).filter(Boolean)
      emit('update:modelValue', urls)
    } else {
      emit('update:modelValue', url)
    }
    
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
  
  emit('success', response, file, fileList)
}

// 文件上传失败回调
const handleError: UploadProps['onError'] = (error, file, fileList) => {
  ElMessage.error('上传失败，请重试')
  emit('error', error, file, fileList)
}

// 文件上传进度回调
const handleProgress: UploadProps['onProgress'] = (event, file, fileList) => {
  emit('progress', event, file, fileList)
}

// 文件状态改变回调
const handleChange: UploadProps['onChange'] = (file, fileList) => {
  emit('change', file, fileList)
}

// 文件删除回调
const handleRemove: UploadProps['onRemove'] = (file, fileList) => {
  if (props.multiple) {
    const urls = fileList.map(item => item.response?.data?.url || item.url).filter(Boolean)
    emit('update:modelValue', urls)
  } else {
    emit('update:modelValue', '')
  }
  
  emit('remove', file, fileList)
}

// 文件预览回调
const handlePreview: UploadProps['onPreview'] = (file) => {
  if (file.url) {
    previewImageUrl.value = file.url
    previewVisible.value = true
  }
  emit('preview', file)
}

// 文件超出限制回调
const handleExceed: UploadProps['onExceed'] = (files, fileList) => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
  emit('exceed', files, fileList)
}

// 暴露方法
defineExpose({
  uploadRef,
  clearFiles: () => uploadRef.value?.clearFiles(),
  abort: () => uploadRef.value?.abort(),
  submit: () => uploadRef.value?.submit()
})
</script>

<style scoped lang="scss">
.upload-component {
  .upload-container {
    width: 100%;
  }

  // 头像上传样式
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
    object-fit: cover;
    border-radius: 6px;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    text-align: center;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  // 拖拽上传样式优化
  :deep(.el-upload-dragger) {
    padding: 40px;
  }

  // 提示文字样式
  .el-upload__tip {
    font-size: 12px;
    color: var(--el-text-color-regular);
    margin-top: 7px;
  }

  // 照片墙样式优化
  :deep(.el-upload--picture-card) {
    .el-upload {
      width: 148px;
      height: 148px;
    }
  }
}

// 响应式处理
@media (max-width: 768px) {
  .upload-component {
    .avatar,
    .avatar-uploader-icon {
      width: 120px;
      height: 120px;
    }

    :deep(.el-upload--picture-card) {
      .el-upload {
        width: 100px;
        height: 100px;
      }
    }
  }
}
</style>
