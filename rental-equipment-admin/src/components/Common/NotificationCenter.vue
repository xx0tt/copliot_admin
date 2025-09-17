<template>
  <div class="notification-center">
    <!-- 通知铃铛图标 -->
    <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
      <el-button
        circle
        :icon="Bell"
        @click="toggleNotificationPanel"
        :class="{ active: panelVisible }"
      />
    </el-badge>

    <!-- 通知面板 -->
    <el-drawer
      v-model="panelVisible"
      title="消息通知"
      direction="rtl"
      size="400px"
      :modal="false"
      :show-close="true"
    >
      <!-- 通知头部 -->
      <div class="notification-header">
        <div class="header-tabs">
          <el-button
            v-for="tab in tabs"
            :key="tab.key"
            :type="activeTab === tab.key ? 'primary' : ''"
            size="small"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
            <el-badge
              v-if="tab.count > 0"
              :value="tab.count"
              :max="99"
              class="tab-badge"
            />
          </el-button>
        </div>
        <div class="header-actions">
          <el-button size="small" @click="markAllAsRead" v-if="unreadCount > 0">
            全部已读
          </el-button>
          <el-button size="small" @click="clearAll">
            清空所有
          </el-button>
        </div>
      </div>

      <!-- 通知列表 -->
      <div class="notification-list" v-loading="loading">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <el-icon :color="getNotificationColor(notification.type)">
              <component :is="getNotificationIcon(notification.type)" />
            </el-icon>
          </div>
          
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTime(notification.createTime) }}</div>
          </div>
          
          <div class="notification-actions" v-if="!notification.read">
            <el-button
              size="small"
              type="primary"
              link
              @click.stop="markAsRead(notification.id)"
            >
              标记已读
            </el-button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <el-icon size="48" color="#c0c4cc">
            <Bell />
          </el-icon>
          <p>暂无{{ getTabLabel(activeTab) }}</p>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore">
        <el-button @click="loadMore" :loading="loadingMore">
          加载更多
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Bell,
  Warning,
  SuccessFilled,
  InfoFilled,
  CircleCloseFilled,
  ChatDotRound,
  Money,
  Tools,
  User
} from '@element-plus/icons-vue'

// 通知类型枚举
enum NotificationType {
  SYSTEM = 'system',
  ORDER = 'order',
  EQUIPMENT = 'equipment',
  FINANCE = 'finance',
  MESSAGE = 'message'
}

// 通知接口
interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createTime: string
  data?: any // 附加数据，用于跳转等
}

// 响应式数据
const panelVisible = ref(false)
const activeTab = ref('all')
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const notifications = ref<Notification[]>([])

// Tab 配置
const tabs = computed(() => [
  {
    key: 'all',
    label: '全部',
    count: notifications.value.length
  },
  {
    key: 'unread',
    label: '未读',
    count: unreadCount.value
  },
  {
    key: NotificationType.SYSTEM,
    label: '系统',
    count: notifications.value.filter(n => n.type === NotificationType.SYSTEM).length
  },
  {
    key: NotificationType.ORDER,
    label: '订单',
    count: notifications.value.filter(n => n.type === NotificationType.ORDER).length
  },
  {
    key: NotificationType.EQUIPMENT,
    label: '设备',
    count: notifications.value.filter(n => n.type === NotificationType.EQUIPMENT).length
  }
])

// 计算属性
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return notifications.value
  } else if (activeTab.value === 'unread') {
    return notifications.value.filter(n => !n.read)
  } else {
    return notifications.value.filter(n => n.type === activeTab.value)
  }
})

// 方法
const toggleNotificationPanel = () => {
  panelVisible.value = !panelVisible.value
  if (panelVisible.value) {
    loadNotifications()
  }
}

const loadNotifications = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟通知数据
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: NotificationType.ORDER,
        title: '新订单提醒',
        message: '您有一个新的租赁订单需要处理',
        read: false,
        createTime: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      },
      {
        id: '2',
        type: NotificationType.EQUIPMENT,
        title: '设备维修提醒',
        message: '挖掘机CAT320D需要进行定期维护',
        read: false,
        createTime: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: '3',
        type: NotificationType.SYSTEM,
        title: '系统更新',
        message: '系统将在今晚12点进行维护更新',
        read: true,
        createTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: '4',
        type: NotificationType.FINANCE,
        title: '付款提醒',
        message: '订单ORD20240101001的款项已到账',
        read: false,
        createTime: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      }
    ]
    
    notifications.value = mockNotifications
  } catch (error) {
    ElMessage.error('加载通知失败')
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  loadingMore.value = true
  try {
    // 模拟加载更多数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 这里应该调用API加载更多通知
    hasMore.value = false // 模拟没有更多数据
  } catch (error) {
    ElMessage.error('加载更多失败')
  } finally {
    loadingMore.value = false
  }
}

const markAsRead = async (notificationId: string) => {
  try {
    // 模拟API调用
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
    ElMessage.success('已标记为已读')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const markAllAsRead = async () => {
  try {
    // 模拟API调用
    notifications.value.forEach(n => {
      n.read = true
    })
    ElMessage.success('已全部标记为已读')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const clearAll = async () => {
  try {
    // 模拟API调用
    notifications.value = []
    ElMessage.success('已清空所有通知')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleNotificationClick = (notification: Notification) => {
  // 标记为已读
  if (!notification.read) {
    markAsRead(notification.id)
  }
  
  // 根据通知类型进行跳转
  switch (notification.type) {
    case NotificationType.ORDER:
      // 跳转到订单页面
      break
    case NotificationType.EQUIPMENT:
      // 跳转到设备页面
      break
    case NotificationType.FINANCE:
      // 跳转到财务页面
      break
  }
}

const getNotificationIcon = (type: NotificationType) => {
  const iconMap = {
    [NotificationType.SYSTEM]: InfoFilled,
    [NotificationType.ORDER]: ChatDotRound,
    [NotificationType.EQUIPMENT]: Tools,
    [NotificationType.FINANCE]: Money,
    [NotificationType.MESSAGE]: User
  }
  return iconMap[type] || InfoFilled
}

const getNotificationColor = (type: NotificationType) => {
  const colorMap = {
    [NotificationType.SYSTEM]: '#409EFF',
    [NotificationType.ORDER]: '#67C23A',
    [NotificationType.EQUIPMENT]: '#E6A23C',
    [NotificationType.FINANCE]: '#F56C6C',
    [NotificationType.MESSAGE]: '#909399'
  }
  return colorMap[type] || '#409EFF'
}

const getTabLabel = (tabKey: string) => {
  const tab = tabs.value.find(t => t.key === tabKey)
  return tab ? tab.label : '通知'
}

const formatTime = (timeStr: string) => {
  const now = new Date()
  const time = new Date(timeStr)
  const diff = now.getTime() - time.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return time.toLocaleDateString('zh-CN')
  }
}

// WebSocket 连接（模拟实时通知）
let websocket: WebSocket | null = null

const initWebSocket = () => {
  // 这里应该连接到实际的WebSocket服务器
  // websocket = new WebSocket('ws://localhost:3001/notifications')
  
  // 模拟定时推送通知
  setInterval(() => {
    if (Math.random() > 0.7) { // 30% 概率收到新通知
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: [NotificationType.ORDER, NotificationType.EQUIPMENT, NotificationType.SYSTEM][Math.floor(Math.random() * 3)],
        title: '新消息',
        message: '您有一条新的通知消息',
        read: false,
        createTime: new Date().toISOString()
      }
      notifications.value.unshift(newNotification)
      
      // 显示桌面通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico'
        })
      }
    }
  }, 30000) // 每30秒检查一次
}

const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

// 生命周期
onMounted(() => {
  requestNotificationPermission()
  initWebSocket()
})

onUnmounted(() => {
  if (websocket) {
    websocket.close()
  }
})
</script>

<style scoped lang="scss">
.notification-center {
  position: relative;

  .el-button {
    &.active {
      background-color: var(--el-color-primary);
      color: white;
    }
  }
}

.notification-header {
  margin-bottom: 20px;

  .header-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;

    .tab-badge {
      margin-left: 4px;
    }
  }

  .header-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}

.notification-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;

  .notification-item {
    display: flex;
    align-items: flex-start;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-light);
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.unread {
      background-color: var(--el-color-primary-light-9);
      border-left: 3px solid var(--el-color-primary);
    }

    &:last-child {
      border-bottom: none;
    }

    .notification-icon {
      margin-right: 12px;
      flex-shrink: 0;
    }

    .notification-content {
      flex: 1;
      min-width: 0;

      .notification-title {
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .notification-message {
        color: var(--el-text-color-regular);
        font-size: 14px;
        margin-bottom: 8px;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .notification-time {
        color: var(--el-text-color-secondary);
        font-size: 12px;
      }
    }

    .notification-actions {
      margin-left: 12px;
      flex-shrink: 0;
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--el-text-color-secondary);

    p {
      margin-top: 16px;
      font-size: 14px;
    }
  }
}

.load-more {
  text-align: center;
  padding: 20px;
  border-top: 1px solid var(--el-border-color-light);
}

// 自定义抽屉样式
:deep(.el-drawer) {
  .el-drawer__header {
    padding: 20px 20px 0;
    margin-bottom: 0;
  }

  .el-drawer__body {
    padding: 20px;
  }
}

// 响应式处理
@media (max-width: 768px) {
  .notification-header {
    .header-tabs {
      .el-button {
        font-size: 12px;
        padding: 4px 8px;
      }
    }
  }

  .notification-list {
    .notification-item {
      padding: 12px;

      .notification-content {
        .notification-title {
          font-size: 14px;
        }

        .notification-message {
          font-size: 13px;
        }
      }
    }
  }
}
</style>
