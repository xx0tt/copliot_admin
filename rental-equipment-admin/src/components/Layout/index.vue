<!-- 主布局组件 -->
<template>
  <!-- 主布局容器 -->
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarCollapsed ? '64px' : '250px'" class="sidebar">
      <Sidebar :collapsed="sidebarCollapsed" />
    </el-aside>
    
    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header height="60px" class="header">
        <Header @toggle-sidebar="toggleSidebar" :collapsed="sidebarCollapsed" />
      </el-header>
      
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <Breadcrumb />
      </div>
      
      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import Breadcrumb from './Breadcrumb.vue'

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  
  .sidebar {
    background-color: #304156;
    transition: width 0.3s ease;
    overflow: hidden;
  }
  
  .main-container {
    background-color: #f0f2f5;
  }
  
  .header {
    background-color: #ffffff;
    border-bottom: 1px solid #e8eaec;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  }
  
  .breadcrumb-container {
    padding: 12px 20px;
    background-color: #ffffff;
    border-bottom: 1px solid #e8eaec;
  }
  
  .main-content {
    background-color: #f0f2f5;
    min-height: calc(100vh - 113px);
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    
    .page-component {
      width: 100%;
      min-height: 100%;
    }
  }
}

// 页面过渡动画
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
