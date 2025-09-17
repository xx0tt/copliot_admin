import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由元信息接口定义
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    transition?: string
    level?: number
  }
}

// 定义路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/Test.vue'),
    meta: {
      title: '测试页面',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/Layout/index.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: {
          title: '首页看板',
          icon: 'DataBoard',
          transition: 'slide-right',
          level: 1
        }
      },
      {
        path: '/orders',
        name: 'Orders',
        redirect: '/orders/list',
        meta: {
          title: '订单管理',
          icon: 'Document',
          transition: 'slide-right',
          level: 2
        },
        children: [
          {
            path: '/orders/list',
            name: 'OrdersList',
            component: () => import('@/views/Orders/index.vue'),
            meta: {
              title: '订单列表',
              transition: 'slide-right',
              level: 2
            }
          },
          {
            path: '/orders/create',
            name: 'OrderCreate',
            component: () => import('@/views/Orders/Form.vue'),
            meta: {
              title: '新建订单',
              transition: 'slide-up',
              level: 3
            }
          },
          {
            path: '/orders/edit/:id',
            name: 'OrderEdit',
            component: () => import('@/views/Orders/Form.vue'),
            meta: {
              title: '编辑订单',
              transition: 'slide-up',
              level: 3
            }
          },
          {
            path: '/orders/:id',
            name: 'OrderDetail',
            component: () => import('@/views/Orders/Detail.vue'),
            meta: {
              title: '订单详情',
              transition: 'scale',
              level: 3
            }
          }
        ]
      },
      {
        path: '/after-sales',
        name: 'AfterSales',
        component: () => import('@/views/AfterSales/index.vue'),
        meta: {
          title: '售后管理',
          icon: 'Tools',
          transition: 'slide-right',
          level: 2
        }
      },
      {
        path: '/equipment',
        name: 'Equipment',
        redirect: '/equipment/list',
        meta: {
          title: '设备管理',
          icon: 'Monitor',
          transition: 'slide-right',
          level: 2
        },
        children: [
          {
            path: '/equipment/list',
            name: 'EquipmentList',
            component: () => import('@/views/Equipment/index.vue'),
            meta: {
              title: '设备列表',
              transition: 'slide-right',
              level: 3
            }
          },
          {
            path: '/equipment/create',
            name: 'EquipmentCreate',
            component: () => import('@/views/Equipment/Form.vue'),
            meta: {
              title: '新增设备',
              transition: 'slide-up',
              level: 4
            }
          },
          {
            path: '/equipment/edit/:id',
            name: 'EquipmentEdit',
            component: () => import('@/views/Equipment/Form.vue'),
            meta: {
              title: '编辑设备',
              transition: 'slide-up',
              level: 4
            }
          },
          {
            path: '/equipment/:id',
            name: 'EquipmentDetail',
            component: () => import('@/views/Equipment/Detail.vue'),
            meta: {
              title: '设备详情',
              transition: 'scale',
              level: 4
            }
          },
          {
            path: '/equipment/:id/maintenance',
            name: 'EquipmentMaintenance',
            component: () => import('@/views/Equipment/Maintenance.vue'),
            meta: {
              title: '维护记录',
              transition: 'slide-up',
              level: 5
            }
          }
        ]
      },
      {
        path: '/warehouse',
        name: 'Warehouse',
        component: () => import('@/views/Warehouse/index.vue'),
        meta: {
          title: '仓储管理',
          icon: 'Box',
          transition: 'slide-right',
          level: 2
        }
      },
      {
        path: '/customer-service',
        name: 'CustomerService',
        component: () => import('@/views/CustomerService/index.vue'),
        meta: {
          title: '客服管理',
          icon: 'Service',
          transition: 'slide-right',
          level: 2
        }
      },
      {
        path: '/employee',
        name: 'Employee',
        component: () => import('@/views/Employee/index.vue'),
        meta: {
          title: '员工管理',
          icon: 'User',
          transition: 'slide-right',
          level: 2
        }
      },
      {
        path: '/financial',
        name: 'Financial',
        component: () => import('@/views/Financial/index.vue'),
        meta: {
          title: '财务报表',
          icon: 'Money',
          transition: 'slide-right',
          level: 2
        }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile/index.vue'),
        meta: {
          title: '个人中心',
          icon: 'User',
          transition: 'slide-right',
          level: 2
        }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/Settings/index.vue'),
        meta: {
          title: '系统设置',
          icon: 'Setting',
          transition: 'slide-right',
          level: 2
        }
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 检查用户认证状态
router.beforeEach(async (to, from, next) => {
  console.log('路由守卫触发:', { to: to.path, from: from.path })
  
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 租赁设备管理系统`
  }
  
  // 如果是登录页面，直接通过
  if (to.path === '/login') {
    console.log('访问登录页，直接通过')
    next()
    return
  }
  
  // 检查是否需要认证，默认需要认证
  const requiresAuth = to.meta?.requiresAuth !== false
  
  if (requiresAuth) {
    try {
      const authStore = useAuthStore()
      
      // 如果没有token，重定向到登录页
      if (!authStore.isAuthenticated) {
        console.log('用户未认证，重定向到登录页')
        next('/login')
        return
      }
      
      console.log('用户已认证，继续访问')
      next()
    } catch (error) {
      console.error('认证检查失败:', error)
      next('/login')
    }
  } else {
    console.log('无需认证，直接通过')
    next()
  }
})

export default router
