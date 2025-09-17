/**
 * 路由过渡动画工具
 */

import type { RouteLocationNormalized } from 'vue-router'
import { routePerformanceMonitor } from './performance'

// 动画类型常量
export const TransitionType = {
  FADE: 'fade',
  SLIDE_LEFT: 'slide-left',
  SLIDE_RIGHT: 'slide-right',
  SLIDE_UP: 'slide-up',
  SLIDE_DOWN: 'slide-down',
  SCALE: 'scale',
  ROTATE: 'rotate'
} as const

export type TransitionTypeValues = typeof TransitionType[keyof typeof TransitionType]

// 根据路由层级和导航方向确定动画类型
export function getTransitionName(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
): string {
  // 开始性能监控
  const transitionName = determineTransition(to, from)
  routePerformanceMonitor.startRouteChange(from, to, transitionName)
  
  return transitionName
}

// 确定过渡动画类型
function determineTransition(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
): string {
  // 如果路由定义了特定的动画，优先使用
  if (to.meta?.transition) {
    return to.meta.transition as string
  }

  // 获取路由层级
  const toLevel = to.meta?.level || 0
  const fromLevel = from.meta?.level || 0

  // 根据层级关系确定动画方向
  if (toLevel > fromLevel) {
    // 进入更深层级，使用向上滑动
    return TransitionType.SLIDE_UP
  } else if (toLevel < fromLevel) {
    // 返回上级，使用向下滑动
    return TransitionType.SLIDE_DOWN
  } else {
    // 同级切换，使用左右滑动
    const toIndex = getRouteIndex(to.path)
    const fromIndex = getRouteIndex(from.path)
    
    if (toIndex > fromIndex) {
      return TransitionType.SLIDE_LEFT
    } else if (toIndex < fromIndex) {
      return TransitionType.SLIDE_RIGHT
    } else {
      return TransitionType.FADE
    }
  }
}

// 获取路由在同级菜单中的索引
function getRouteIndex(path: string): number {
  const routeOrder = [
    '/dashboard',
    '/orders',
    '/after-sales',
    '/equipment', 
    '/warehouse',
    '/customer-service',
    '/employee',
    '/financial'
  ]
  
  const mainPath = '/' + path.split('/')[1]
  const index = routeOrder.indexOf(mainPath)
  return index >= 0 ? index : 0
}

// 预设的动画配置
export const transitionConfig = {
  // 默认动画持续时间
  duration: 300,
  
  // 动画缓动函数
  easing: 'cubic-bezier(0.55, 0, 0.1, 1)',
  
  // 是否在首次加载时显示动画
  appear: true,
  
  // 动画模式
  mode: 'out-in' as const
}

// 动画完成回调
export function onTransitionComplete() {
  routePerformanceMonitor.endRouteChange()
}
