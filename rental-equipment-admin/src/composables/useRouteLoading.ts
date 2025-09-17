/**
 * 路由加载状态管理
 */

import { ref, nextTick, readonly } from 'vue'
import { useRouter } from 'vue-router'

export function useRouteLoading() {
  const router = useRouter()
  const isLoading = ref(false)
  const loadingText = ref('加载中...')

  // 开始加载
  const startLoading = (text = '加载中...') => {
    isLoading.value = true
    loadingText.value = text
  }

  // 结束加载
  const stopLoading = () => {
    // 延迟一下停止加载，确保动画流畅
    setTimeout(() => {
      isLoading.value = false
    }, 100)
  }

  // 路由导航带加载状态
  const navigateWithLoading = async (to: string, text = '正在跳转...') => {
    startLoading(text)
    try {
      await router.push(to)
      await nextTick()
    } finally {
      stopLoading()
    }
  }

  // 监听路由变化自动管理加载状态
  const setupAutoLoading = () => {
    router.beforeEach((to, from, next) => {
      // 只在真正的路由切换时显示加载
      if (to.path !== from.path) {
        startLoading('正在加载页面...')
      }
      next()
    })

    router.afterEach(() => {
      stopLoading()
    })
  }

  return {
    isLoading: readonly(isLoading),
    loadingText: readonly(loadingText),
    startLoading,
    stopLoading,
    navigateWithLoading,
    setupAutoLoading
  }
}
