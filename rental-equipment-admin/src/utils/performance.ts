/**
 * 路由性能监控工具
 */

import type { RouteLocationNormalized } from 'vue-router'

interface RoutePerformance {
  from: string
  to: string
  startTime: number
  endTime?: number
  duration?: number
  transitionType?: string
}

class RoutePerformanceMonitor {
  private performances: RoutePerformance[] = []
  private currentPerformance: RoutePerformance | null = null
  
  // 开始监控路由切换
  startRouteChange(from: RouteLocationNormalized, to: RouteLocationNormalized, transitionType?: string) {
    this.currentPerformance = {
      from: from.path,
      to: to.path,
      startTime: performance.now(),
      transitionType
    }
  }
  
  // 结束监控路由切换
  endRouteChange() {
    if (this.currentPerformance) {
      const endTime = performance.now()
      this.currentPerformance.endTime = endTime
      this.currentPerformance.duration = endTime - this.currentPerformance.startTime
      
      this.performances.push({ ...this.currentPerformance })
      
      // 保留最近100条记录
      if (this.performances.length > 100) {
        this.performances.shift()
      }
      
      // 在开发环境下输出性能信息
      if (import.meta.env.DEV) {
        console.log('Route Performance:', {
          route: `${this.currentPerformance.from} → ${this.currentPerformance.to}`,
          duration: `${this.currentPerformance.duration?.toFixed(2)}ms`,
          transition: this.currentPerformance.transitionType
        })
      }
      
      this.currentPerformance = null
    }
  }
  
  // 获取性能统计
  getPerformanceStats() {
    if (this.performances.length === 0) {
      return null
    }
    
    const durations = this.performances
      .map(p => p.duration)
      .filter(d => d !== undefined) as number[]
    
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const max = Math.max(...durations)
    const min = Math.min(...durations)
    
    return {
      total: this.performances.length,
      averageDuration: avg,
      maxDuration: max,
      minDuration: min,
      recentPerformances: this.performances.slice(-10)
    }
  }
  
  // 清除性能记录
  clearPerformances() {
    this.performances = []
    this.currentPerformance = null
  }
  
  // 检查是否有性能问题
  checkPerformanceIssues() {
    const stats = this.getPerformanceStats()
    if (!stats) return []
    
    const issues: string[] = []
    
    if (stats.averageDuration > 1000) {
      issues.push('平均路由切换时间过长')
    }
    
    if (stats.maxDuration > 2000) {
      issues.push('存在极慢的路由切换')
    }
    
    return issues
  }
}

// 导出单例实例
export const routePerformanceMonitor = new RoutePerformanceMonitor()

// 导出类型
export type { RoutePerformance }
