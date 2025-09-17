/**
 * 数据缓存工具类
 * 提供内存缓存和本地存储缓存功能
 */

// 缓存项接口
interface CacheItem<T = any> {
  data: T
  timestamp: number
  expires?: number // 过期时间（毫秒）
}

// 缓存配置接口
interface CacheConfig {
  namespace?: string // 命名空间，用于区分不同应用的缓存
  defaultExpires?: number // 默认过期时间（毫秒）
  maxSize?: number // 最大缓存项数量
}

class CacheManager {
  private memory: Map<string, CacheItem> = new Map()
  private config: Required<CacheConfig>

  constructor(config: CacheConfig = {}) {
    this.config = {
      namespace: config.namespace || 'rental_admin',
      defaultExpires: config.defaultExpires || 5 * 60 * 1000, // 默认5分钟
      maxSize: config.maxSize || 100
    }
  }

  /**
   * 生成带命名空间的键名
   */
  private getNamespacedKey(key: string): string {
    return `${this.config.namespace}:${key}`
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem): boolean {
    if (!item.expires) return false
    return Date.now() - item.timestamp > item.expires
  }

  /**
   * 清理过期的内存缓存
   */
  private cleanExpiredMemoryCache(): void {
    const now = Date.now()
    for (const [key, item] of this.memory.entries()) {
      if (this.isExpired(item)) {
        this.memory.delete(key)
      }
    }
  }

  /**
   * 检查内存缓存大小并清理最旧的项
   */
  private checkMemorySize(): void {
    if (this.memory.size >= this.config.maxSize) {
      // 删除最旧的缓存项
      const oldestKey = this.memory.keys().next().value
      if (oldestKey) {
        this.memory.delete(oldestKey)
      }
    }
  }

  /**
   * 设置内存缓存
   */
  setMemory<T>(key: string, data: T, expires?: number): void {
    this.cleanExpiredMemoryCache()
    this.checkMemorySize()
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expires: expires || this.config.defaultExpires
    }
    
    this.memory.set(key, item)
  }

  /**
   * 获取内存缓存
   */
  getMemory<T>(key: string): T | null {
    const item = this.memory.get(key)
    if (!item) return null
    
    if (this.isExpired(item)) {
      this.memory.delete(key)
      return null
    }
    
    return item.data as T
  }

  /**
   * 删除内存缓存
   */
  removeMemory(key: string): void {
    this.memory.delete(key)
  }

  /**
   * 清空所有内存缓存
   */
  clearMemory(): void {
    this.memory.clear()
  }

  /**
   * 设置本地存储缓存
   */
  setLocal<T>(key: string, data: T, expires?: number): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expires: expires || this.config.defaultExpires
      }
      
      const namespacedKey = this.getNamespacedKey(key)
      localStorage.setItem(namespacedKey, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to set localStorage cache:', error)
    }
  }

  /**
   * 获取本地存储缓存
   */
  getLocal<T>(key: string): T | null {
    try {
      const namespacedKey = this.getNamespacedKey(key)
      const itemStr = localStorage.getItem(namespacedKey)
      
      if (!itemStr) return null
      
      const item: CacheItem<T> = JSON.parse(itemStr)
      
      if (this.isExpired(item)) {
        localStorage.removeItem(namespacedKey)
        return null
      }
      
      return item.data
    } catch (error) {
      console.warn('Failed to get localStorage cache:', error)
      return null
    }
  }

  /**
   * 删除本地存储缓存
   */
  removeLocal(key: string): void {
    try {
      const namespacedKey = this.getNamespacedKey(key)
      localStorage.removeItem(namespacedKey)
    } catch (error) {
      console.warn('Failed to remove localStorage cache:', error)
    }
  }

  /**
   * 清空所有本地存储缓存
   */
  clearLocal(): void {
    try {
      const prefix = `${this.config.namespace}:`
      const keysToRemove: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error)
    }
  }

  /**
   * 设置会话存储缓存
   */
  setSession<T>(key: string, data: T, expires?: number): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expires: expires || this.config.defaultExpires
      }
      
      const namespacedKey = this.getNamespacedKey(key)
      sessionStorage.setItem(namespacedKey, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to set sessionStorage cache:', error)
    }
  }

  /**
   * 获取会话存储缓存
   */
  getSession<T>(key: string): T | null {
    try {
      const namespacedKey = this.getNamespacedKey(key)
      const itemStr = sessionStorage.getItem(namespacedKey)
      
      if (!itemStr) return null
      
      const item: CacheItem<T> = JSON.parse(itemStr)
      
      if (this.isExpired(item)) {
        sessionStorage.removeItem(namespacedKey)
        return null
      }
      
      return item.data
    } catch (error) {
      console.warn('Failed to get sessionStorage cache:', error)
      return null
    }
  }

  /**
   * 删除会话存储缓存
   */
  removeSession(key: string): void {
    try {
      const namespacedKey = this.getNamespacedKey(key)
      sessionStorage.removeItem(namespacedKey)
    } catch (error) {
      console.warn('Failed to remove sessionStorage cache:', error)
    }
  }

  /**
   * 清空所有会话存储缓存
   */
  clearSession(): void {
    try {
      const prefix = `${this.config.namespace}:`
      const keysToRemove: string[] = []
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => sessionStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear sessionStorage cache:', error)
    }
  }

  /**
   * 通用设置方法，同时设置内存和本地存储
   */
  set<T>(key: string, data: T, expires?: number): void {
    this.setMemory(key, data, expires)
    this.setLocal(key, data, expires)
  }

  /**
   * 通用获取方法，优先从内存获取，然后从本地存储获取
   */
  get<T>(key: string): T | null {
    // 先尝试从内存获取
    let data = this.getMemory<T>(key)
    if (data !== null) return data
    
    // 从本地存储获取
    data = this.getLocal<T>(key)
    if (data !== null) {
      // 重新设置到内存中以加快后续访问
      this.setMemory(key, data)
      return data
    }
    
    return null
  }

  /**
   * 通用删除方法
   */
  remove(key: string): void {
    this.removeMemory(key)
    this.removeLocal(key)
    this.removeSession(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.clearMemory()
    this.clearLocal()
    this.clearSession()
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    memorySize: number
    localStorageKeys: string[]
    sessionStorageKeys: string[]
  } {
    const prefix = `${this.config.namespace}:`
    const localStorageKeys: string[] = []
    const sessionStorageKeys: string[] = []
    
    try {
      // 统计 localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          localStorageKeys.push(key.replace(prefix, ''))
        }
      }
      
      // 统计 sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(prefix)) {
          sessionStorageKeys.push(key.replace(prefix, ''))
        }
      }
    } catch (error) {
      console.warn('Failed to get cache stats:', error)
    }
    
    return {
      memorySize: this.memory.size,
      localStorageKeys,
      sessionStorageKeys
    }
  }
}

// 创建默认实例
export const cache = new CacheManager()

// 导出类以便创建自定义实例
export { CacheManager }

// 导出类型
export type { CacheItem, CacheConfig }
