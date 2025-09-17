<template>
  <div class="test-page">
    <h1>测试页面</h1>
    <p>如果你能看到这个页面，说明路由系统工作正常。</p>
    <el-button @click="goToDashboard">前往首页</el-button>
    <el-button @click="goToOrders">前往订单</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToOrders = () => {
  router.push('/orders')
}
</script>

<style scoped>
.test-page {
  padding: 20px;
}
</style>
