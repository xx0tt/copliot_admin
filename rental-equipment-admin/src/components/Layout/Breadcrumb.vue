<!-- 面包屑导航组件 -->
<template>
  <el-breadcrumb separator="/" class="breadcrumb-container">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbList"
      :key="index"
      :to="index === breadcrumbList.length - 1 ? undefined : item.path"
    >
      <el-icon v-if="item.icon" class="breadcrumb-icon">
        <component :is="item.icon" />
      </el-icon>
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 面包屑数据接口
interface BreadcrumbItem {
  title: string
  path: string
  icon?: string
}

// 路由标题映射
const routeTitleMap: Record<string, { title: string; icon?: string }> = {
  '/dashboard': { title: '首页看板', icon: 'DataBoard' },
  '/orders': { title: '订单管理', icon: 'Document' },
  '/after-sales': { title: '售后管理', icon: 'Tools' },
  '/equipment': { title: '设备管理', icon: 'Monitor' },
  '/equipment/list': { title: '设备列表' },
  '/equipment/maintenance': { title: '维护记录' },
  '/warehouse': { title: '仓储管理', icon: 'Box' },
  '/customer': { title: '客服管理', icon: 'Service' },
  '/employee': { title: '员工管理', icon: 'User' },
  '/finance': { title: '财务报表', icon: 'Money' }
}

// 生成面包屑数据
const breadcrumbList = computed(() => {
  const pathArray = route.path.split('/').filter(path => path)
  const breadcrumbs: BreadcrumbItem[] = []
  
  // 添加首页
  breadcrumbs.push({
    title: '首页',
    path: '/dashboard',
    icon: 'House'
  })
  
  // 构建路径面包屑
  let currentPath = ''
  pathArray.forEach((path, index) => {
    currentPath += `/${path}`
    const routeInfo = routeTitleMap[currentPath]
    
    if (routeInfo) {
      breadcrumbs.push({
        title: routeInfo.title,
        path: currentPath,
        icon: routeInfo.icon
      })
    }
  })
  
  return breadcrumbs
})
</script>

<style lang="scss" scoped>
.breadcrumb-container {
  .breadcrumb-icon {
    margin-right: 4px;
    font-size: 14px;
  }
  
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      display: flex;
      align-items: center;
      font-weight: normal;
      
      &.is-link:hover {
        color: #409eff;
      }
    }
    
    &:last-child .el-breadcrumb__inner {
      color: #606266;
      font-weight: 500;
    }
  }
}
</style>
