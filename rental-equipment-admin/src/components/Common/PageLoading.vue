<!-- 页面加载指示器组件 -->
<template>
  <transition name="loading" appear>
    <div v-if="loading" class="page-loading">
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">{{ text }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface Props {
  // 是否显示加载状态
  loading?: boolean
  // 加载文本
  text?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  text: '加载中...'
})
</script>

<style lang="scss" scoped>
.page-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  
  &:nth-child(2) {
    animation-delay: -0.4s;
    border-top-color: #67c23a;
    width: 75%;
    height: 75%;
    top: 12.5%;
    left: 12.5%;
  }
  
  &:nth-child(3) {
    animation-delay: -0.8s;
    border-top-color: #e6a23c;
    width: 50%;
    height: 50%;
    top: 25%;
    left: 25%;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin: 0;
  color: #666;
  font-size: 14px;
  font-weight: 400;
}

// 加载动画
.loading-enter-active,
.loading-leave-active {
  transition: all 0.3s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
