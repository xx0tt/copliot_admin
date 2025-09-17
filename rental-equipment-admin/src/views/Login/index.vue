<!-- 登录页面 -->
<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="login-background">
      <div class="decoration-1"></div>
      <div class="decoration-2"></div>
      <div class="decoration-3"></div>
    </div>
    
    <!-- 登录表单卡片 -->
    <el-card class="login-card" shadow="hover">
      <!-- 登录标题 -->
      <div class="login-header">
        <img src="/vite.svg" alt="Logo" class="logo">
        <h2 class="title">租赁设备管理系统</h2>
        <p class="subtitle">欢迎登录后台管理平台</p>
      </div>
      
      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <!-- 用户名输入框 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <!-- 记住登录选项 -->
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">
              记住登录状态
            </el-checkbox>
            <el-link type="primary" :underline="false">
              忘记密码？
            </el-link>
          </div>
        </el-form-item>
        
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 快速登录提示 -->
      <div class="demo-accounts">
        <el-divider>演示账号</el-divider>
        <div class="demo-account-list">
          <el-tag
            v-for="account in demoAccounts"
            :key="account.username"
            class="demo-account"
            @click="fillDemoAccount(account)"
          >
            {{ account.username }} ({{ account.role }})
          </el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest } from '@/types/user'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive<LoginRequest & { remember: boolean }>({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2到20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
  ]
}

// 演示账号列表
const demoAccounts = [
  { username: 'admin', password: 'admin123', role: '超级管理员' },
  { username: 'manager', password: 'manager123', role: '经理' },
  { username: 'staff', password: 'staff123', role: '员工' }
]

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    // 验证表单
    await loginFormRef.value.validate()
    
    loading.value = true
    
    // 调用登录API
    const result = await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
      remember: loginForm.remember
    })
    
    if (result.success) {
      ElMessage.success('登录成功')
      // 跳转到首页
      router.push('/')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 填充演示账号
const fillDemoAccount = (account: typeof demoAccounts[0]) => {
  loginForm.username = account.username
  loginForm.password = account.password
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  
  // 背景装饰元素
  .login-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    
    .decoration-1,
    .decoration-2,
    .decoration-3 {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .decoration-1 {
      width: 200px;
      height: 200px;
      top: 10%;
      left: 10%;
      animation: float 6s ease-in-out infinite;
    }
    
    .decoration-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 10%;
      animation: float 8s ease-in-out infinite reverse;
    }
    
    .decoration-3 {
      width: 100px;
      height: 100px;
      bottom: 20%;
      left: 20%;
      animation: float 10s ease-in-out infinite;
    }
  }
}

// 浮动动画
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.login-card {
  width: 400px;
  padding: 20px;
  z-index: 2;
  position: relative;
  border-radius: 12px;
  
  .login-header {
    text-align: center;
    margin-bottom: 30px;
    
    .logo {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
    
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 8px;
    }
    
    .subtitle {
      font-size: 14px;
      color: #909399;
    }
  }
  
  .login-form {
    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    
    .login-btn {
      width: 100%;
      height: 42px;
      font-size: 16px;
    }
  }
  
  .demo-accounts {
    margin-top: 20px;
    
    .demo-account-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      
      .demo-account {
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>
