/**
 * 动画配置管理
 */

import { ref, readonly } from 'vue'

// 动画配置接口
export interface AnimationConfig {
  // 是否启用动画
  enabled: boolean
  // 动画持续时间（毫秒）
  duration: number
  // 缓动函数
  easing: string
  // 是否启用减弱动画（辅助功能）
  reduceMotion: boolean
  // 移动端动画优化
  mobileOptimized: boolean
}

// 默认动画配置
const defaultConfig: AnimationConfig = {
  enabled: true,
  duration: 300,
  easing: 'cubic-bezier(0.55, 0, 0.1, 1)',
  reduceMotion: false,
  mobileOptimized: true
}

// 动画配置管理类
class AnimationConfigManager {
  private config: AnimationConfig
  private storageKey = 'rental-admin-animation-config'

  constructor() {
    this.config = this.loadConfig()
    this.detectMotionPreference()
    this.setupMediaQueryListener()
  }

  // 加载配置
  private loadConfig(): AnimationConfig {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return { ...defaultConfig, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.warn('Failed to load animation config:', error)
    }
    return { ...defaultConfig }
  }

  // 保存配置
  private saveConfig(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config))
    } catch (error) {
      console.warn('Failed to save animation config:', error)
    }
  }

  // 检测用户的动画偏好
  private detectMotionPreference(): void {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.config.reduceMotion = true
      this.config.duration = Math.min(this.config.duration, 150)
    }
  }

  // 监听媒体查询变化
  private setupMediaQueryListener(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      mediaQuery.addEventListener('change', () => {
        this.detectMotionPreference()
        this.saveConfig()
      })
    }
  }

  // 获取当前配置
  getConfig(): AnimationConfig {
    return { ...this.config }
  }

  // 更新配置
  updateConfig(newConfig: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.saveConfig()
  }

  // 获取适用于当前环境的动画持续时间
  getDuration(): number {
    if (!this.config.enabled || this.config.reduceMotion) {
      return 0
    }
    
    // 移动端优化：缩短动画时间
    if (this.config.mobileOptimized && this.isMobile()) {
      return Math.max(this.config.duration * 0.7, 150)
    }
    
    return this.config.duration
  }

  // 获取缓动函数
  getEasing(): string {
    if (this.config.reduceMotion) {
      return 'ease-out'
    }
    return this.config.easing
  }

  // 检查是否应该启用动画
  shouldAnimate(): boolean {
    return this.config.enabled && !this.config.reduceMotion
  }

  // 检测是否为移动设备
  private isMobile(): boolean {
    return window.innerWidth <= 768
  }

  // 重置为默认配置
  reset(): void {
    this.config = { ...defaultConfig }
    this.detectMotionPreference()
    this.saveConfig()
  }

  // 获取CSS动画属性
  getCSSProperties(): Record<string, string> {
    return {
      '--animation-duration': `${this.getDuration()}ms`,
      '--animation-easing': this.getEasing(),
      '--animation-enabled': this.shouldAnimate() ? '1' : '0'
    }
  }
}

// 导出单例实例
export const animationConfig = new AnimationConfigManager()

// 响应式动画配置 hook
export function useAnimationConfig() {
  const config = ref(animationConfig.getConfig())
  
  const updateConfig = (newConfig: Partial<AnimationConfig>) => {
    animationConfig.updateConfig(newConfig)
    config.value = animationConfig.getConfig()
  }

  const getDuration = () => animationConfig.getDuration()
  const getEasing = () => animationConfig.getEasing()
  const shouldAnimate = () => animationConfig.shouldAnimate()
  const getCSSProperties = () => animationConfig.getCSSProperties()

  return {
    config: readonly(config),
    updateConfig,
    getDuration,
    getEasing,
    shouldAnimate,
    getCSSProperties,
    reset: () => {
      animationConfig.reset()
      config.value = animationConfig.getConfig()
    }
  }
}
