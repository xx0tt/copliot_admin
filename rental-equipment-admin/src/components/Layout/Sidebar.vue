<!-- 侧边栏组件 -->
<template>
  <div class="sidebar-container">
    <!-- Logo区域 -->
    <div class="logo-container">
      <img src="/vite.svg" alt="Logo" class="logo-img" v-if="!collapsed">
      <span class="logo-text" v-if="!collapsed">设备租赁系统</span>
      <img src="/vite.svg" alt="Logo" class="logo-img-mini" v-else>
    </div>
    
    <!-- 菜单列表 -->
    <el-menu
      :default-active="$route.path"
      class="sidebar-menu"
      :collapse="collapsed"
      :unique-opened="true"
      router
      text-color="#bfcbd9"
      active-text-color="#409eff"
      background-color="#304156"
    >
      <!-- 首页看板 -->
      <el-menu-item index="/dashboard">
        <el-icon><DataBoard /></el-icon>
        <span>首页看板</span>
      </el-menu-item>
      
      <!-- 订单管理 -->
      <el-menu-item index="/orders">
        <el-icon><Document /></el-icon>
        <span>订单管理</span>
      </el-menu-item>
      
      <!-- 售后管理 -->
      <el-menu-item index="/after-sales">
        <el-icon><Tools /></el-icon>
        <span>售后管理</span>
      </el-menu-item>
      
      <!-- 设备管理 -->
      <el-sub-menu index="/equipment">
        <template #title>
          <el-icon><Monitor /></el-icon>
          <span>设备管理</span>
        </template>
        <el-menu-item index="/equipment/list">设备列表</el-menu-item>
        <el-menu-item index="/equipment/maintenance">维护记录</el-menu-item>
      </el-sub-menu>
      
      <!-- 仓储管理 -->
      <el-menu-item index="/warehouse">
        <el-icon><Box /></el-icon>
        <span>仓储管理</span>
      </el-menu-item>
      
      <!-- 客服管理 -->
      <el-menu-item index="/customer-service">
        <el-icon><Service /></el-icon>
        <span>客服管理</span>
      </el-menu-item>
      
      <!-- 员工管理 -->
      <el-menu-item index="/employee">
        <el-icon><User /></el-icon>
        <span>员工管理</span>
      </el-menu-item>
      
      <!-- 财务报表 -->
      <el-menu-item index="/financial">
        <el-icon><Money /></el-icon>
        <span>财务报表</span>
      </el-menu-item>
      
      <!-- 个人中心 -->
      <el-menu-item index="/profile">
        <el-icon><Avatar /></el-icon>
        <span>个人中心</span>
      </el-menu-item>
      
      <!-- 系统设置 -->
      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <span>系统设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
interface Props {
  collapsed: boolean // 是否折叠
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  
  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #434a50;
    
    .logo-img, .logo-img-mini {
      width: 32px;
      height: 32px;
    }
    
    .logo-img {
      margin-right: 8px;
    }
    
    .logo-text {
      color: #ffffff;
      font-size: 16px;
      font-weight: bold;
    }
  }
  
  .sidebar-menu {
    border: none;
    height: calc(100vh - 60px);
    overflow-y: auto;
    
    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: #434a50;
      border-radius: 3px;
    }
    
    // 菜单项悬停效果
    .el-menu-item:hover {
      background-color: #263445 !important;
    }
    
    // 子菜单样式
    .el-sub-menu__title:hover {
      background-color: #263445 !important;
    }
  }
}
</style>
