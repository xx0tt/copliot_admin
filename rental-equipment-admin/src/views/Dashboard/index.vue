<template>
  <div class="dashboard-container">
    <h1>仪表板</h1>
    <p>欢迎使用租赁设备管理系统！</p>
    
    <!-- 统计卡片区域 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-title">总订单数</div>
            <div class="stat-value">1,234</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-title">设备总数</div>
            <div class="stat-value">856</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-title">在租设备</div>
            <div class="stat-value">234</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-title">本月收入</div>
            <div class="stat-value">¥245,680</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
// 简化版仪表板
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  
  .stat-item {
    text-align: center;
    padding: 20px;
    
    .stat-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
  }
}
</style>
