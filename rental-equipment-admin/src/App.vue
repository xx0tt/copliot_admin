<script setup lang="ts">
import { onMounted } from 'vue'

// 简单的应用初始化
onMounted(() => {
  console.log('App mounted')
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
:root {
  --animation-duration: 300ms;
  --animation-easing: cubic-bezier(0.55, 0, 0.1, 1);
  --animation-enabled: 1;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100vh;
}

.el-main {
  padding: 20px;
}

.el-header {
  padding: 0;
}

.el-aside {
  padding: 0;
}

// 通用工具类
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.full-width {
  width: 100%;
}

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--animation-duration) var(--animation-easing);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 左滑动画
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all var(--animation-duration) var(--animation-easing);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translate(50px, 0);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translate(-50px, 0);
}

// 右滑动画
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all var(--animation-duration) var(--animation-easing);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translate(-50px, 0);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translate(50px, 0);
}

// 上滑动画
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all var(--animation-duration) var(--animation-easing);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translate(0, 30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translate(0, -30px);
}

// 下滑动画
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--animation-duration) var(--animation-easing);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translate(0, -30px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translate(0, 30px);
}

// 缩放动画
.scale-enter-active,
.scale-leave-active {
  transition: all var(--animation-duration) var(--animation-easing);
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

// 旋转动画
.rotate-enter-active,
.rotate-leave-active {
  transition: all calc(var(--animation-duration) * 1.5) var(--animation-easing);
}

.rotate-enter-from {
  opacity: 0;
  transform: rotate(-5deg) scale(0.9);
}

.rotate-leave-to {
  opacity: 0;
  transform: rotate(5deg) scale(0.9);
}

// 无障碍支持：当用户设置了减少动画偏好时
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// 移动端优化
@media screen and (max-width: 768px) {
  :root {
    --animation-duration: calc(var(--animation-duration) * 0.7);
  }
}
</style>
