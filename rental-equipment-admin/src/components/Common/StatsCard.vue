<template>
  <el-card class="stats-card" :class="cardClass" shadow="hover">
    <div class="stats-content">
      <!-- 图标区域 -->
      <div class="stats-icon" :style="iconStyle">
        <el-icon :size="iconSize">
          <component :is="icon" />
        </el-icon>
      </div>

      <!-- 内容区域 -->
      <div class="stats-info">
        <div class="stats-value">
          <span class="value-text" :style="valueStyle">
            {{ prefix }}{{ formattedValue }}{{ suffix }}
          </span>
          <div class="value-trend" v-if="showTrend && trend">
            <el-icon 
              :class="trendClass" 
              :style="trendStyle"
              size="14"
            >
              <ArrowUp v-if="trend.type === 'up'" />
              <ArrowDown v-if="trend.type === 'down'" />
              <Minus v-if="trend.type === 'equal'" />
            </el-icon>
            <span class="trend-text" :style="trendStyle">
              {{ trend.value }}{{ trend.unit || '%' }}
            </span>
          </div>
        </div>

        <div class="stats-label">
          {{ title }}
        </div>

        <div class="stats-desc" v-if="description">
          {{ description }}
        </div>
      </div>

      <!-- 操作区域 -->
      <div class="stats-action" v-if="$slots.action">
        <slot name="action"></slot>
      </div>
    </div>

    <!-- 底部额外信息 -->
    <div class="stats-footer" v-if="$slots.footer">
      <el-divider />
      <slot name="footer"></slot>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'

// 趋势类型定义
interface Trend {
  type: 'up' | 'down' | 'equal'
  value: string | number
  unit?: string
}

// Props 定义
interface Props {
  title: string
  value: string | number
  icon?: any
  description?: string
  prefix?: string
  suffix?: string
  color?: string
  trend?: Trend
  showTrend?: boolean
  iconSize?: number
  loading?: boolean
  animated?: boolean
  theme?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  prefix: '',
  suffix: '',
  color: '#409eff',
  showTrend: true,
  iconSize: 24,
  loading: false,
  animated: false,
  theme: 'default',
  size: 'default'
})

// 计算属性
const formattedValue = computed(() => {
  if (props.loading) return '--'
  
  const value = props.value
  if (typeof value === 'number') {
    // 格式化数字，添加千分位分隔符
    return value.toLocaleString()
  }
  return value
})

const cardClass = computed(() => {
  return [
    `stats-card--${props.theme}`,
    `stats-card--${props.size}`,
    {
      'stats-card--animated': props.animated,
      'stats-card--loading': props.loading
    }
  ]
})

const iconStyle = computed(() => ({
  backgroundColor: props.color + '20',
  color: props.color
}))

const valueStyle = computed(() => ({
  color: props.theme === 'default' ? props.color : undefined
}))

const trendClass = computed(() => {
  if (!props.trend) return ''
  
  return {
    'trend-up': props.trend.type === 'up',
    'trend-down': props.trend.type === 'down',
    'trend-equal': props.trend.type === 'equal'
  }
})

const trendStyle = computed(() => {
  if (!props.trend) return {}
  
  const colors = {
    up: '#67c23a',
    down: '#f56c6c',
    equal: '#909399'
  }
  
  return {
    color: colors[props.trend.type]
  }
})
</script>

<style scoped lang="scss">
.stats-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  &.stats-card--animated {
    .value-text {
      animation: countUp 1.5s ease-out;
    }
  }

  &.stats-card--loading {
    .stats-content {
      opacity: 0.6;
    }
  }

  // 主题样式
  &.stats-card--primary {
    border-left: 4px solid var(--el-color-primary);
  }

  &.stats-card--success {
    border-left: 4px solid var(--el-color-success);
  }

  &.stats-card--warning {
    border-left: 4px solid var(--el-color-warning);
  }

  &.stats-card--danger {
    border-left: 4px solid var(--el-color-danger);
  }

  &.stats-card--info {
    border-left: 4px solid var(--el-color-info);
  }

  // 尺寸样式
  &.stats-card--small {
    .stats-content {
      padding: 16px;
    }

    .stats-icon {
      width: 40px;
      height: 40px;
    }

    .value-text {
      font-size: 20px;
    }
  }

  &.stats-card--large {
    .stats-content {
      padding: 24px;
    }

    .stats-icon {
      width: 60px;
      height: 60px;
    }

    .value-text {
      font-size: 32px;
    }
  }

  .stats-content {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }

  .stats-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .stats-info {
    flex: 1;
    min-width: 0;
  }

  .stats-value {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 4px;

    .value-text {
      font-size: 28px;
      font-weight: 600;
      line-height: 1;
      color: var(--el-text-color-primary);
    }

    .value-trend {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;

      .trend-text {
        font-weight: 500;
      }
    }
  }

  .stats-label {
    font-size: 14px;
    color: var(--el-text-color-regular);
    margin-bottom: 4px;
    font-weight: 500;
  }

  .stats-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }

  .stats-action {
    display: flex;
    align-items: flex-start;
    flex-shrink: 0;
  }

  .stats-footer {
    padding: 0 20px 20px;

    :deep(.el-divider) {
      margin: 0 0 16px 0;
    }
  }
}

// 趋势图标样式
.trend-up {
  transform: rotate(0deg);
}

.trend-down {
  transform: rotate(0deg);
}

.trend-equal {
  transform: rotate(0deg);
}

// 数字动画
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .stats-card {
    .stats-content {
      padding: 16px;
      flex-direction: column;
      gap: 12px;
    }

    .stats-icon {
      align-self: center;
    }

    .stats-info {
      text-align: center;
    }

    .stats-value {
      justify-content: center;
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .stats-card {
    .stats-icon {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
