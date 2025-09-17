<template>
  <div class="profile-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">个人中心</h2>
      <p class="page-description">管理您的个人信息和账户设置</p>
    </div>

    <el-row :gutter="20">
      <!-- 左侧个人信息 -->
      <el-col :xs="24" :lg="8">
        <el-card class="profile-card" shadow="never">
          <div class="profile-info">
            <div class="avatar-section">
              <el-avatar :size="100" :src="userInfo?.avatar" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <el-button type="text" @click="changeAvatar" class="change-avatar-btn">
                更换头像
              </el-button>
            </div>
            
            <div class="user-details">
              <h3 class="username">{{ userInfo?.username || '未知用户' }}</h3>
              <p class="user-role">{{ getRoleText(userInfo?.role) }}</p>
              <p class="user-email">{{ userInfo?.email || '未设置邮箱' }}</p>
              
              <div class="user-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ userStats.loginCount }}</div>
                  <div class="stat-label">登录次数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ userStats.lastLoginDays }}</div>
                  <div class="stat-label">最近登录</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ userStats.operationCount }}</div>
                  <div class="stat-label">操作次数</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 快捷操作 -->
        <el-card class="quick-actions-card" shadow="never">
          <template #header>
            <span class="card-title">快捷操作</span>
          </template>
          
          <div class="quick-actions">
            <el-button type="primary" @click="changePassword" class="action-btn">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-button>
            <el-button @click="exportData" class="action-btn">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button @click="clearCache" class="action-btn">
              <el-icon><Refresh /></el-icon>
              清除缓存
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧详细信息 -->
      <el-col :xs="24" :lg="16">
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-form
              ref="basicFormRef"
              :model="basicForm"
              :rules="basicRules"
              label-width="120px"
              class="profile-form"
            >
              <el-row :gutter="20">
                <el-col :xs="24" :md="12">
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="basicForm.username" disabled />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="真实姓名" prop="realName">
                    <el-input v-model="basicForm.realName" placeholder="请输入真实姓名" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="邮箱地址" prop="email">
                    <el-input v-model="basicForm.email" placeholder="请输入邮箱地址" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="手机号码" prop="phone">
                    <el-input v-model="basicForm.phone" placeholder="请输入手机号码" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="部门" prop="department">
                    <el-select v-model="basicForm.department" placeholder="请选择部门">
                      <el-option label="管理部" value="management" />
                      <el-option label="技术部" value="technology" />
                      <el-option label="销售部" value="sales" />
                      <el-option label="客服部" value="service" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="职位" prop="position">
                    <el-input v-model="basicForm.position" placeholder="请输入职位" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24">
                  <el-form-item label="个人简介">
                    <el-input
                      v-model="basicForm.bio"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入个人简介"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <div class="form-actions">
                <el-button type="primary" @click="saveBasicInfo" :loading="saving">
                  保存信息
                </el-button>
                <el-button @click="resetBasicForm">重置</el-button>
              </div>
            </el-form>
          </el-tab-pane>

          <!-- 安全设置 -->
          <el-tab-pane label="安全设置" name="security">
            <div class="security-section">
              <div class="security-item">
                <div class="security-info">
                  <h4>登录密码</h4>
                  <p>定期更换密码可以提高账户安全性</p>
                </div>
                <el-button @click="changePassword">修改密码</el-button>
              </div>
              
              <div class="security-item">
                <div class="security-info">
                  <h4>双因子认证</h4>
                  <p>启用双因子认证后，登录时需要额外的验证码</p>
                </div>
                <el-switch
                  v-model="securitySettings.twoFactorAuth"
                  @change="toggleTwoFactorAuth"
                />
              </div>
              
              <div class="security-item">
                <div class="security-info">
                  <h4>登录通知</h4>
                  <p>账户登录时将发送邮件通知</p>
                </div>
                <el-switch
                  v-model="securitySettings.loginNotification"
                  @change="updateSecuritySettings"
                />
              </div>
              
              <div class="security-item">
                <div class="security-info">
                  <h4>会话管理</h4>
                  <p>管理当前登录的设备和会话</p>
                </div>
                <el-button @click="viewSessions">查看会话</el-button>
              </div>
            </div>
          </el-tab-pane>

          <!-- 操作日志 -->
          <el-tab-pane label="操作日志" name="logs">
            <div class="logs-section">
              <div class="logs-filter">
                <el-row :gutter="20">
                  <el-col :xs="24" :md="8">
                    <el-select v-model="logFilter.type" placeholder="选择操作类型">
                      <el-option label="全部" value="" />
                      <el-option label="登录" value="login" />
                      <el-option label="创建" value="create" />
                      <el-option label="编辑" value="edit" />
                      <el-option label="删除" value="delete" />
                    </el-select>
                  </el-col>
                  <el-col :xs="24" :md="12">
                    <el-date-picker
                      v-model="logFilter.dateRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                    />
                  </el-col>
                  <el-col :xs="24" :md="4">
                    <el-button type="primary" @click="loadLogs">查询</el-button>
                  </el-col>
                </el-row>
              </div>

              <el-table :data="operationLogs" stripe>
                <el-table-column prop="type" label="操作类型" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getLogTypeTag(row.type)">{{ getLogTypeText(row.type) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="操作描述" />
                <el-table-column prop="ip" label="IP地址" width="130" />
                <el-table-column prop="userAgent" label="设备信息" width="150" />
                <el-table-column prop="createdAt" label="操作时间" width="160">
                  <template #default="{ row }">
                    {{ formatDate(row.createdAt) }}
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="logPagination.page"
                  v-model:page-size="logPagination.size"
                  :total="logPagination.total"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="loadLogs"
                  @current-change="loadLogs"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordChange" :loading="passwordChanging">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Lock,
  Download,
  Refresh
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('basic')
const saving = ref(false)
const passwordDialogVisible = ref(false)
const passwordChanging = ref(false)

// 基本信息表单
const basicFormRef = ref()
const basicForm = reactive({
  username: '',
  realName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  bio: ''
})

// 密码修改表单
const passwordFormRef = ref()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 安全设置
const securitySettings = reactive({
  twoFactorAuth: false,
  loginNotification: true
})

// 用户统计信息
const userStats = reactive({
  loginCount: 156,
  lastLoginDays: '2天前',
  operationCount: 1234
})

// 操作日志
const operationLogs = ref([
  {
    id: 1,
    type: 'login',
    description: '用户登录系统',
    ip: '192.168.1.100',
    userAgent: 'Chrome 120.0',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    type: 'create',
    description: '创建订单 #ORD2024001',
    ip: '192.168.1.100',
    userAgent: 'Chrome 120.0',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
])

// 日志筛选
const logFilter = reactive({
  type: '',
  dateRange: null
})

// 日志分页
const logPagination = reactive({
  page: 1,
  size: 10,
  total: 100
})

// 计算属性
const userInfo = computed(() => authStore.userInfo)

// 表单验证规则
const basicRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const getRoleText = (role?: string) => {
  const roleMap = {
    admin: '管理员',
    user: '普通用户',
    operator: '操作员'
  }
  return roleMap[role as keyof typeof roleMap] || '未知角色'
}

const changeAvatar = () => {
  ElMessage.info('头像更换功能开发中...')
}

const saveBasicInfo = async () => {
  if (!basicFormRef.value) return
  
  try {
    await basicFormRef.value.validate()
    saving.value = true
    
    // TODO: 调用保存用户信息API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('个人信息保存成功')
  } catch (error) {
    console.error('Save basic info error:', error)
  } finally {
    saving.value = false
  }
}

const resetBasicForm = () => {
  if (basicFormRef.value) {
    basicFormRef.value.resetFields()
  }
  loadUserInfo()
}

const changePassword = () => {
  passwordDialogVisible.value = true
  // 重置表单
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

const submitPasswordChange = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordChanging.value = true
    
    // TODO: 调用修改密码API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('密码修改成功')
    passwordDialogVisible.value = false
  } catch (error) {
    console.error('Change password error:', error)
    ElMessage.error('密码修改失败')
  } finally {
    passwordChanging.value = false
  }
}

const toggleTwoFactorAuth = (value: boolean) => {
  if (value) {
    ElMessageBox.confirm(
      '启用双因子认证后，每次登录都需要额外的验证码，是否继续？',
      '确认启用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      updateSecuritySettings()
    }).catch(() => {
      securitySettings.twoFactorAuth = false
    })
  } else {
    updateSecuritySettings()
  }
}

const updateSecuritySettings = async () => {
  try {
    // TODO: 调用更新安全设置API
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('安全设置更新成功')
  } catch (error) {
    console.error('Update security settings error:', error)
    ElMessage.error('安全设置更新失败')
  }
}

const viewSessions = () => {
  ElMessage.info('会话管理功能开发中...')
}

const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const clearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '清除缓存后需要重新登录，是否继续？',
      '确认清除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 清除本地缓存
    localStorage.clear()
    sessionStorage.clear()
    
    ElMessage.success('缓存清除成功')
  } catch (error) {
    // 用户取消
  }
}

const loadLogs = async () => {
  try {
    // TODO: 调用获取操作日志API
    console.log('Loading logs with filter:', logFilter)
  } catch (error) {
    console.error('Load logs error:', error)
  }
}

const getLogTypeTag = (type: string) => {
  const tagMap = {
    login: 'success',
    create: 'primary',
    edit: 'warning',
    delete: 'danger'
  }
  return tagMap[type as keyof typeof tagMap] || ''
}

const getLogTypeText = (type: string) => {
  const textMap = {
    login: '登录',
    create: '创建',
    edit: '编辑',
    delete: '删除'
  }
  return textMap[type as keyof typeof textMap] || type
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

const loadUserInfo = () => {
  if (userInfo.value) {
    basicForm.username = userInfo.value.username
    basicForm.email = userInfo.value.email || ''
    basicForm.phone = userInfo.value.phone || ''
    // 其他字段根据实际情况设置
  }
}

// 生命周期
onMounted(() => {
  loadUserInfo()
  loadLogs()
})
</script>

<style lang="scss" scoped>
.profile-container {
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
  
  .profile-card {
    margin-bottom: 20px;
    
    .profile-info {
      text-align: center;
      
      .avatar-section {
        margin-bottom: 20px;
        
        .user-avatar {
          display: block;
          margin: 0 auto 10px;
          border: 4px solid #f0f0f0;
        }
        
        .change-avatar-btn {
          font-size: 12px;
          color: #409eff;
        }
      }
      
      .user-details {
        .username {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #333;
        }
        
        .user-role {
          margin: 0 0 4px 0;
          color: #409eff;
          font-size: 14px;
        }
        
        .user-email {
          margin: 0 0 20px 0;
          color: #666;
          font-size: 14px;
        }
        
        .user-stats {
          display: flex;
          justify-content: space-around;
          padding: 20px 0;
          border-top: 1px solid #f0f0f0;
          
          .stat-item {
            text-align: center;
            
            .stat-value {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin-bottom: 4px;
            }
            
            .stat-label {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }
    }
  }
  
  .quick-actions-card {
    .card-title {
      font-weight: bold;
      color: #333;
    }
    
    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .action-btn {
        justify-content: flex-start;
      }
    }
  }
  
  .profile-form {
    .form-actions {
      margin-top: 30px;
      text-align: center;
    }
  }
  
  .security-section {
    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .security-info {
        h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #333;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
  
  .logs-section {
    .logs-filter {
      margin-bottom: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .pagination-container {
      margin-top: 20px;
      text-align: right;
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
    
    .quick-actions {
      .action-btn {
        width: 100%;
      }
    }
    
    .user-stats {
      flex-direction: column;
      gap: 16px;
    }
    
    .security-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
}
</style>
