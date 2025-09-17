<!-- 顶部导航栏组件 -->
<template>
  <div class="header-container">
    <!-- 左侧区域 -->
    <div class="header-left">
      <!-- 菜单折叠按钮 -->
      <el-button
        type="text"
        @click="handleToggleSidebar"
        class="toggle-btn"
      >
        <el-icon size="20">
          <Fold v-if="!collapsed" />
          <Expand v-else />
        </el-icon>
      </el-button>
    </div>
    
    <!-- 右侧区域 -->
    <div class="header-right">
      <!-- 全屏按钮 -->
      <el-tooltip content="全屏" placement="bottom">
        <el-button type="text" @click="toggleFullscreen" class="header-btn">
          <el-icon size="18">
            <FullScreen />
          </el-icon>
        </el-button>
      </el-tooltip>
      
      <!-- 通知中心 -->
      <NotificationCenter />
      
      <!-- 用户信息下拉菜单 -->
      <el-dropdown class="user-dropdown">
        <div class="user-info">
          <el-avatar :size="32" :src="userInfo?.avatar">
            {{ userInfo?.username?.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="username">{{ userInfo?.username || '管理员' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleProfile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item @click="handleSettings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { NotificationCenter } from '@/components/Common'

interface Props {
  collapsed: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()

// 获取用户信息
const userInfo = computed(() => authStore.userInfo)

// 通知数量（模拟数据）
const notificationCount = ref(5)

// 切换侧边栏
const handleToggleSidebar = () => {
  emit('toggle-sidebar')
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 个人中心
const handleProfile = () => {
  router.push('/profile')
}

// 系统设置
const handleSettings = () => {
  router.push('/settings')
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 执行登出
    authStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.header-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .toggle-btn {
      padding: 0;
      margin-right: 20px;
      color: #606266;
      
      &:hover {
        color: #409eff;
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .header-btn {
      padding: 8px;
      color: #606266;
      
      &:hover {
        color: #409eff;
        background-color: #f5f7fa;
      }
    }
    
    .notification-dropdown {
      .notification-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 200px;
        padding: 4px 0;
      }
    }
    
    .user-dropdown {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.3s;
        
        &:hover {
          background-color: #f5f7fa;
        }
        
        .username {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
