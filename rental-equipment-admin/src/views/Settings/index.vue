<template>
  <div class="settings-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
      <p class="page-description">配置和管理系统的各项设置</p>
    </div>

    <el-row :gutter="20">
      <!-- 左侧设置菜单 -->
      <el-col :xs="24" :lg="6">
        <el-card class="settings-menu" shadow="never">
          <el-menu
            v-model="activeSection"
            class="settings-nav"
            @select="handleMenuSelect"
          >
            <el-menu-item index="basic">
              <el-icon><Setting /></el-icon>
              <span>基础设置</span>
            </el-menu-item>
            <el-menu-item index="appearance">
              <el-icon><Picture /></el-icon>
              <span>外观设置</span>
            </el-menu-item>
            <el-menu-item index="notification">
              <el-icon><Bell /></el-icon>
              <span>通知设置</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>安全设置</span>
            </el-menu-item>
            <el-menu-item index="data">
              <el-icon><Folder /></el-icon>
              <span>数据管理</span>
            </el-menu-item>
            <el-menu-item index="system">
              <el-icon><Monitor /></el-icon>
              <span>系统信息</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 右侧设置内容 -->
      <el-col :xs="24" :lg="18">
        <el-card class="settings-content" shadow="never">
          <!-- 基础设置 -->
          <div v-show="activeSection === 'basic'" class="setting-section">
            <h3 class="section-title">基础设置</h3>
            
            <el-form :model="basicSettings" label-width="140px" class="settings-form">
              <el-form-item label="系统名称">
                <el-input v-model="basicSettings.systemName" placeholder="请输入系统名称" />
              </el-form-item>
              
              <el-form-item label="系统描述">
                <el-input
                  v-model="basicSettings.systemDescription"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入系统描述"
                />
              </el-form-item>
              
              <el-form-item label="公司名称">
                <el-input v-model="basicSettings.companyName" placeholder="请输入公司名称" />
              </el-form-item>
              
              <el-form-item label="联系电话">
                <el-input v-model="basicSettings.contactPhone" placeholder="请输入联系电话" />
              </el-form-item>
              
              <el-form-item label="联系邮箱">
                <el-input v-model="basicSettings.contactEmail" placeholder="请输入联系邮箱" />
              </el-form-item>
              
              <el-form-item label="时区设置">
                <el-select v-model="basicSettings.timezone" placeholder="请选择时区">
                  <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                  <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
                  <el-option label="伦敦时间 (UTC+0)" value="Europe/London" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="默认语言">
                <el-select v-model="basicSettings.language" placeholder="请选择语言">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                  <el-option label="繁體中文" value="zh-TW" />
                </el-select>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveBasicSettings" :loading="saving.basic">
                  保存设置
                </el-button>
                <el-button @click="resetBasicSettings">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 外观设置 -->
          <div v-show="activeSection === 'appearance'" class="setting-section">
            <h3 class="section-title">外观设置</h3>
            
            <el-form :model="appearanceSettings" label-width="140px" class="settings-form">
              <el-form-item label="主题模式">
                <el-radio-group v-model="appearanceSettings.theme">
                  <el-radio label="light">浅色模式</el-radio>
                  <el-radio label="dark">深色模式</el-radio>
                  <el-radio label="auto">跟随系统</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="主题色彩">
                <div class="color-picker-group">
                  <el-color-picker
                    v-model="appearanceSettings.primaryColor"
                    :predefine="predefineColors"
                  />
                  <span class="color-label">主色调</span>
                </div>
              </el-form-item>
              
              <el-form-item label="侧边栏样式">
                <el-radio-group v-model="appearanceSettings.sidebarStyle">
                  <el-radio label="dark">深色</el-radio>
                  <el-radio label="light">浅色</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="布局模式">
                <el-radio-group v-model="appearanceSettings.layout">
                  <el-radio label="side">侧边布局</el-radio>
                  <el-radio label="top">顶部布局</el-radio>
                  <el-radio label="mix">混合布局</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="页面动画">
                <el-switch
                  v-model="appearanceSettings.pageAnimation"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
              
              <el-form-item label="面包屑导航">
                <el-switch
                  v-model="appearanceSettings.breadcrumb"
                  active-text="显示"
                  inactive-text="隐藏"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveAppearanceSettings" :loading="saving.appearance">
                  保存设置
                </el-button>
                <el-button @click="resetAppearanceSettings">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 通知设置 -->
          <div v-show="activeSection === 'notification'" class="setting-section">
            <h3 class="section-title">通知设置</h3>
            
            <el-form :model="notificationSettings" label-width="140px" class="settings-form">
              <el-form-item label="邮件通知">
                <el-switch
                  v-model="notificationSettings.emailEnabled"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
              
              <el-form-item label="短信通知">
                <el-switch
                  v-model="notificationSettings.smsEnabled"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
              
              <el-form-item label="浏览器通知">
                <el-switch
                  v-model="notificationSettings.browserEnabled"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
              
              <el-form-item label="订单通知">
                <el-checkbox-group v-model="notificationSettings.orderEvents">
                  <el-checkbox label="order_created">新订单创建</el-checkbox>
                  <el-checkbox label="order_updated">订单状态更新</el-checkbox>
                  <el-checkbox label="order_cancelled">订单取消</el-checkbox>
                  <el-checkbox label="order_completed">订单完成</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              
              <el-form-item label="设备通知">
                <el-checkbox-group v-model="notificationSettings.equipmentEvents">
                  <el-checkbox label="equipment_maintenance">设备维护提醒</el-checkbox>
                  <el-checkbox label="equipment_fault">设备故障报警</el-checkbox>
                  <el-checkbox label="equipment_return">设备归还提醒</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              
              <el-form-item label="通知频率">
                <el-select v-model="notificationSettings.frequency" placeholder="请选择通知频率">
                  <el-option label="实时通知" value="realtime" />
                  <el-option label="每小时汇总" value="hourly" />
                  <el-option label="每日汇总" value="daily" />
                  <el-option label="每周汇总" value="weekly" />
                </el-select>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveNotificationSettings" :loading="saving.notification">
                  保存设置
                </el-button>
                <el-button @click="testNotification">发送测试通知</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 安全设置 -->
          <div v-show="activeSection === 'security'" class="setting-section">
            <h3 class="section-title">安全设置</h3>
            
            <el-form :model="securitySettings" label-width="140px" class="settings-form">
              <el-form-item label="密码策略">
                <div class="security-item">
                  <el-checkbox v-model="securitySettings.passwordPolicy.minLength">
                    最小长度8位
                  </el-checkbox>
                  <el-checkbox v-model="securitySettings.passwordPolicy.requireUppercase">
                    包含大写字母
                  </el-checkbox>
                  <el-checkbox v-model="securitySettings.passwordPolicy.requireNumbers">
                    包含数字
                  </el-checkbox>
                  <el-checkbox v-model="securitySettings.passwordPolicy.requireSpecialChars">
                    包含特殊字符
                  </el-checkbox>
                </div>
              </el-form-item>
              
              <el-form-item label="会话超时">
                <el-select v-model="securitySettings.sessionTimeout" placeholder="请选择会话超时时间">
                  <el-option label="30分钟" :value="30" />
                  <el-option label="1小时" :value="60" />
                  <el-option label="2小时" :value="120" />
                  <el-option label="4小时" :value="240" />
                  <el-option label="8小时" :value="480" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="登录限制">
                <el-input-number
                  v-model="securitySettings.maxLoginAttempts"
                  :min="3"
                  :max="10"
                  controls-position="right"
                />
                <span class="input-suffix">次失败后锁定账户</span>
              </el-form-item>
              
              <el-form-item label="IP白名单">
                <el-switch
                  v-model="securitySettings.ipWhitelistEnabled"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </el-form-item>
              
              <el-form-item label="审计日志">
                <el-switch
                  v-model="securitySettings.auditLogEnabled"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveSecuritySettings" :loading="saving.security">
                  保存设置
                </el-button>
                <el-button @click="resetSecuritySettings">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 数据管理 -->
          <div v-show="activeSection === 'data'" class="setting-section">
            <h3 class="section-title">数据管理</h3>
            
            <div class="data-management">
              <el-row :gutter="20">
                <el-col :xs="24" :md="12">
                  <div class="data-item">
                    <h4>数据备份</h4>
                    <p>定期备份系统数据，确保数据安全</p>
                    <el-button @click="createBackup">创建备份</el-button>
                  </div>
                </el-col>
                
                <el-col :xs="24" :md="12">
                  <div class="data-item">
                    <h4>数据导出</h4>
                    <p>导出系统数据为Excel或CSV格式</p>
                    <el-button @click="exportData">导出数据</el-button>
                  </div>
                </el-col>
                
                <el-col :xs="24" :md="12">
                  <div class="data-item">
                    <h4>数据清理</h4>
                    <p>清理过期和无用的数据</p>
                    <el-button type="warning" @click="cleanData">数据清理</el-button>
                  </div>
                </el-col>
                
                <el-col :xs="24" :md="12">
                  <div class="data-item">
                    <h4>缓存管理</h4>
                    <p>清理系统缓存，提升系统性能</p>
                    <el-button @click="clearCache">清理缓存</el-button>
                  </div>
                </el-col>
              </el-row>
              
              <div class="backup-history">
                <h4>备份历史</h4>
                <el-table :data="backupHistory" stripe>
                  <el-table-column prop="name" label="备份名称" />
                  <el-table-column prop="size" label="文件大小" />
                  <el-table-column prop="createdAt" label="创建时间" />
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button size="small" @click="downloadBackup(row)">下载</el-button>
                      <el-button size="small" type="danger" @click="deleteBackup(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>

          <!-- 系统信息 -->
          <div v-show="activeSection === 'system'" class="setting-section">
            <h3 class="section-title">系统信息</h3>
            
            <div class="system-info">
              <el-row :gutter="20">
                <el-col :xs="24" :md="12">
                  <el-card class="info-card" shadow="never">
                    <template #header>
                      <span>系统版本</span>
                    </template>
                    <div class="info-content">
                      <div class="info-item">
                        <span class="label">应用版本:</span>
                        <span class="value">v1.0.0</span>
                      </div>
                      <div class="info-item">
                        <span class="label">构建时间:</span>
                        <span class="value">2024-01-15 10:30:00</span>
                      </div>
                      <div class="info-item">
                        <span class="label">环境:</span>
                        <span class="value">生产环境</span>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                
                <el-col :xs="24" :md="12">
                  <el-card class="info-card" shadow="never">
                    <template #header>
                      <span>系统状态</span>
                    </template>
                    <div class="info-content">
                      <div class="info-item">
                        <span class="label">运行时间:</span>
                        <span class="value">15天 8小时 30分钟</span>
                      </div>
                      <div class="info-item">
                        <span class="label">CPU使用率:</span>
                        <span class="value">25%</span>
                      </div>
                      <div class="info-item">
                        <span class="label">内存使用:</span>
                        <span class="value">2.1GB / 8GB</span>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                
                <el-col :xs="24">
                  <el-card class="info-card" shadow="never">
                    <template #header>
                      <span>技术栈</span>
                    </template>
                    <div class="tech-stack">
                      <el-tag v-for="tech in techStack" :key="tech.name" class="tech-tag">
                        {{ tech.name }} {{ tech.version }}
                      </el-tag>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
              
              <div class="system-actions">
                <el-button @click="checkUpdate">检查更新</el-button>
                <el-button @click="systemDiagnosis">系统诊断</el-button>
                <el-button type="warning" @click="restartSystem">重启系统</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Picture,
  Bell,
  Lock,
  Folder,
  Monitor
} from '@element-plus/icons-vue'

// 响应式数据
const activeSection = ref('basic')
const saving = reactive({
  basic: false,
  appearance: false,
  notification: false,
  security: false
})

// 基础设置
const basicSettings = reactive({
  systemName: '租赁设备管理系统',
  systemDescription: '专业的设备租赁管理平台',
  companyName: '技术有限公司',
  contactPhone: '400-888-8888',
  contactEmail: 'contact@example.com',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN'
})

// 外观设置
const appearanceSettings = reactive({
  theme: 'light',
  primaryColor: '#409EFF',
  sidebarStyle: 'dark',
  layout: 'side',
  pageAnimation: true,
  breadcrumb: true
})

// 预定义颜色
const predefineColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#c71585',
  '#ff8c00',
  '#ffd700'
]

// 通知设置
const notificationSettings = reactive({
  emailEnabled: true,
  smsEnabled: false,
  browserEnabled: true,
  orderEvents: ['order_created', 'order_updated'],
  equipmentEvents: ['equipment_maintenance', 'equipment_fault'],
  frequency: 'realtime'
})

// 安全设置
const securitySettings = reactive({
  passwordPolicy: {
    minLength: true,
    requireUppercase: false,
    requireNumbers: true,
    requireSpecialChars: false
  },
  sessionTimeout: 120,
  maxLoginAttempts: 5,
  ipWhitelistEnabled: false,
  auditLogEnabled: true
})

// 备份历史
const backupHistory = ref([
  {
    id: 1,
    name: 'backup_2024_01_15.sql',
    size: '15.2MB',
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: 'backup_2024_01_10.sql',
    size: '14.8MB',
    createdAt: '2024-01-10 10:30:00'
  }
])

// 技术栈
const techStack = ref([
  { name: 'Vue', version: '3.4.0' },
  { name: 'TypeScript', version: '5.0.0' },
  { name: 'Element Plus', version: '2.4.0' },
  { name: 'Vite', version: '4.5.0' },
  { name: 'Node.js', version: '18.0.0' }
])

// 方法
const handleMenuSelect = (key: string) => {
  activeSection.value = key
}

const saveBasicSettings = async () => {
  saving.basic = true
  try {
    // TODO: 调用保存基础设置API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('基础设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.basic = false
  }
}

const resetBasicSettings = () => {
  // 重置为默认值
  ElMessage.info('已重置为默认设置')
}

const saveAppearanceSettings = async () => {
  saving.appearance = true
  try {
    // TODO: 调用保存外观设置API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('外观设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.appearance = false
  }
}

const resetAppearanceSettings = () => {
  appearanceSettings.theme = 'light'
  appearanceSettings.primaryColor = '#409EFF'
  appearanceSettings.sidebarStyle = 'dark'
  appearanceSettings.layout = 'side'
  appearanceSettings.pageAnimation = true
  appearanceSettings.breadcrumb = true
  ElMessage.info('已重置为默认设置')
}

const saveNotificationSettings = async () => {
  saving.notification = true
  try {
    // TODO: 调用保存通知设置API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('通知设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.notification = false
  }
}

const testNotification = () => {
  ElMessage.success('这是一条测试通知')
}

const saveSecuritySettings = async () => {
  saving.security = true
  try {
    // TODO: 调用保存安全设置API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('安全设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.security = false
  }
}

const resetSecuritySettings = () => {
  ElMessage.info('已重置为默认设置')
}

const createBackup = async () => {
  try {
    await ElMessageBox.confirm('创建数据备份可能需要一些时间，是否继续？', '确认备份', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    ElMessage.success('备份任务已启动，请稍后查看备份历史')
  } catch (error) {
    // 用户取消
  }
}

const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const cleanData = async () => {
  try {
    await ElMessageBox.confirm(
      '数据清理将删除过期和无用的数据，此操作不可恢复，是否继续？',
      '确认清理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('数据清理完成')
  } catch (error) {
    // 用户取消
  }
}

const clearCache = () => {
  ElMessage.success('缓存清理完成')
}

const downloadBackup = (backup: any) => {
  ElMessage.info(`下载备份: ${backup.name}`)
}

const deleteBackup = async (backup: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除备份 ${backup.name} 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('备份删除成功')
  } catch (error) {
    // 用户取消
  }
}

const checkUpdate = () => {
  ElMessage.info('当前已是最新版本')
}

const systemDiagnosis = () => {
  ElMessage.info('系统运行正常')
}

const restartSystem = async () => {
  try {
    await ElMessageBox.confirm(
      '重启系统将中断所有正在进行的操作，是否继续？',
      '确认重启',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('系统重启指令已发送')
  } catch (error) {
    // 用户取消
  }
}

// 生命周期
onMounted(() => {
  // 初始化设置数据
})
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 20px;
  
  .page-header {
    margin-bottom: 24px;
    
    .page-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
    }
    
    .page-description {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }
  
  .settings-menu {
    .settings-nav {
      border: none;
      
      .el-menu-item {
        border-radius: 8px;
        margin-bottom: 4px;
        
        &:hover {
          background-color: #f5f7fa;
        }
        
        &.is-active {
          background-color: #409eff;
          color: white;
          
          .el-icon {
            color: white;
          }
        }
      }
    }
  }
  
  .settings-content {
    min-height: 600px;
    
    .setting-section {
      .section-title {
        margin: 0 0 24px 0;
        font-size: 18px;
        color: #333;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 12px;
      }
      
      .settings-form {
        max-width: 600px;
        
        .color-picker-group {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .color-label {
            font-size: 14px;
            color: #666;
          }
        }
        
        .security-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .input-suffix {
          margin-left: 8px;
          font-size: 14px;
          color: #666;
        }
      }
      
      .data-management {
        .data-item {
          text-align: center;
          padding: 24px;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          margin-bottom: 20px;
          
          h4 {
            margin: 0 0 12px 0;
            font-size: 16px;
            color: #333;
          }
          
          p {
            margin: 0 0 16px 0;
            font-size: 14px;
            color: #666;
          }
        }
        
        .backup-history {
          margin-top: 40px;
          
          h4 {
            margin-bottom: 16px;
            font-size: 16px;
            color: #333;
          }
        }
      }
      
      .system-info {
        .info-card {
          margin-bottom: 20px;
          
          .info-content {
            .info-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              
              &:last-child {
                margin-bottom: 0;
              }
              
              .label {
                font-size: 14px;
                color: #666;
              }
              
              .value {
                font-size: 14px;
                color: #333;
                font-weight: 500;
              }
            }
          }
          
          .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            
            .tech-tag {
              margin: 0;
            }
          }
        }
        
        .system-actions {
          margin-top: 24px;
          text-align: center;
          
          .el-button {
            margin: 0 8px;
          }
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .settings-container {
    padding: 10px;
    
    .settings-menu {
      margin-bottom: 20px;
    }
    
    .settings-form {
      max-width: 100% !important;
    }
    
    .data-item {
      margin-bottom: 16px !important;
    }
    
    .system-actions {
      .el-button {
        display: block;
        width: 100%;
        margin: 8px 0 !important;
      }
    }
  }
}
</style>
