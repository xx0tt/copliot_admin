<!-- 开发者工具面板 -->
<template>
  <div v-if="isDev" class="dev-tools">
    <button 
      class="dev-toggle"
      @click="togglePanel"
      :class="{ active: showPanel }"
    >
      🛠️
    </button>
    
    <transition name="slide-up">
      <div v-if="showPanel" class="dev-panel">
        <div class="dev-header">
          <h3>开发者工具</h3>
          <button @click="togglePanel" class="close-btn">×</button>
        </div>
        
        <div class="dev-content">
          <!-- 路由信息 -->
          <div class="dev-section">
            <h4>当前路由</h4>
            <div class="route-info">
              <p><strong>路径:</strong> {{ currentRoute.path }}</p>
              <p><strong>名称:</strong> {{ currentRoute.name }}</p>
              <p><strong>层级:</strong> {{ currentRoute.meta?.level || 0 }}</p>
              <p><strong>动画:</strong> {{ currentRoute.meta?.transition || 'auto' }}</p>
            </div>
          </div>
          
          <!-- 性能统计 -->
          <div class="dev-section" v-if="performanceStats">
            <h4>路由性能</h4>
            <div class="performance-stats">
              <p><strong>总切换次数:</strong> {{ performanceStats.total }}</p>
              <p><strong>平均耗时:</strong> {{ performanceStats.averageDuration.toFixed(2) }}ms</p>
              <p><strong>最大耗时:</strong> {{ performanceStats.maxDuration.toFixed(2) }}ms</p>
              <p><strong>最小耗时:</strong> {{ performanceStats.minDuration.toFixed(2) }}ms</p>
            </div>
            <button @click="clearPerformanceData" class="clear-btn">
              清除性能数据
            </button>
          </div>
          
          <!-- 动画测试 -->
          <div class="dev-section">
            <h4>动画测试</h4>
            <div class="animation-controls">
              <select v-model="testTransition" class="transition-select">
                <option value="fade">淡入淡出</option>
                <option value="slide-left">左滑</option>
                <option value="slide-right">右滑</option>
                <option value="slide-up">上滑</option>
                <option value="slide-down">下滑</option>
                <option value="scale">缩放</option>
                <option value="rotate">旋转</option>
              </select>
              <button @click="testAnimation" class="test-btn">
                测试动画
              </button>
            </div>
          </div>
          
          <!-- 性能问题 -->
          <div class="dev-section" v-if="performanceIssues.length > 0">
            <h4>性能问题</h4>
            <ul class="issues-list">
              <li v-for="issue in performanceIssues" :key="issue" class="issue">
                ⚠️ {{ issue }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { routePerformanceMonitor } from '@/utils/performance'

// 只在开发环境显示
const isDev = import.meta.env.DEV

const showPanel = ref(false)
const currentRoute = useRoute()
const testTransition = ref('fade')

// 性能统计
const performanceStats = ref(routePerformanceMonitor.getPerformanceStats())
const performanceIssues = ref(routePerformanceMonitor.checkPerformanceIssues())

// 定时更新性能数据
let updateTimer: number | null = null

const togglePanel = () => {
  showPanel.value = !showPanel.value
}

const clearPerformanceData = () => {
  routePerformanceMonitor.clearPerformances()
  performanceStats.value = null
  performanceIssues.value = []
}

const testAnimation = () => {
  // 触发测试动画
  const event = new CustomEvent('test-transition', {
    detail: { transitionType: testTransition.value }
  })
  window.dispatchEvent(event)
}

const updatePerformanceData = () => {
  performanceStats.value = routePerformanceMonitor.getPerformanceStats()
  performanceIssues.value = routePerformanceMonitor.checkPerformanceIssues()
}

onMounted(() => {
  if (isDev) {
    // 每5秒更新一次性能数据
    updateTimer = window.setInterval(updatePerformanceData, 5000)
    
    // 监听键盘快捷键
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl + Shift + D 切换开发者工具
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        togglePanel()
      }
    }
    
    window.addEventListener('keydown', handleKeydown)
    
    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
  }
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style lang="scss" scoped>
.dev-tools {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  font-family: 'Courier New', monospace;
}

.dev-toggle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: #409eff;
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
  }
  
  &.active {
    background: #67c23a;
  }
}

.dev-panel {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 320px;
  max-height: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.dev-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  
  h3 {
    margin: 0;
    font-size: 14px;
    color: #303133;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #909399;
    
    &:hover {
      color: #f56c6c;
    }
  }
}

.dev-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
}

.dev-section {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: #606266;
    font-weight: 600;
  }
}

.route-info,
.performance-stats {
  font-size: 12px;
  line-height: 1.5;
  
  p {
    margin: 4px 0;
    color: #606266;
  }
  
  strong {
    color: #303133;
  }
}

.animation-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.transition-select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
}

.test-btn,
.clear-btn {
  padding: 4px 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #66b1ff;
  }
}

.clear-btn {
  background: #e6a23c;
  
  &:hover {
    background: #ebb563;
  }
}

.issues-list {
  margin: 0;
  padding: 0;
  list-style: none;
  
  .issue {
    padding: 4px 0;
    font-size: 12px;
    color: #e6a23c;
  }
}

// 面板滑入动画
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
