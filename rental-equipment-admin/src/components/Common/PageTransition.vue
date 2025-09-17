<!-- 路由过渡动画组件 -->
<template>
  <transition
    :name="computedTransition"
    :mode="mode"
    :appear="appear"
    :duration="duration"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <slot />
  </transition>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getTransitionName } from '@/utils/transition'

interface Props {
  // 过渡动画名称
  name?: string
  // 过渡模式
  mode?: 'in-out' | 'out-in'
  // 是否在初始渲染时应用过渡
  appear?: boolean
  // 动画持续时间
  duration?: number | { enter: number; leave: number }
  // 是否启用智能动画
  smart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'out-in',
  appear: true,
  duration: 300,
  smart: true
})

const emit = defineEmits<{
  beforeEnter: [el: Element]
  enter: [el: Element, done: () => void]
  afterEnter: [el: Element]
  beforeLeave: [el: Element]
  leave: [el: Element, done: () => void]
  afterLeave: [el: Element]
}>()

const route = useRoute()

// 计算过渡动画名称
const computedTransition = computed(() => {
  if (props.name) {
    return props.name
  }
  
  if (props.smart) {
    // 使用智能动画系统
    return getTransitionName(route, route)
  }
  
  return 'fade'
})

// 动画生命周期钩子
const onBeforeEnter = (el: Element) => {
  emit('beforeEnter', el)
}

const onEnter = (el: Element, done: () => void) => {
  nextTick(() => {
    emit('enter', el, done)
    done()
  })
}

const onAfterEnter = (el: Element) => {
  emit('afterEnter', el)
}

const onBeforeLeave = (el: Element) => {
  emit('beforeLeave', el)
}

const onLeave = (el: Element, done: () => void) => {
  nextTick(() => {
    emit('leave', el, done)
    done()
  })
}

const onAfterLeave = (el: Element) => {
  emit('afterLeave', el)
}
</script>

<style lang="scss">
// 基础过渡动画样式已在App.vue中定义

// 特殊动画效果
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

// 弹性动画
.elastic-enter-active {
  animation: elastic-in 0.6s;
}
.elastic-leave-active {
  animation: elastic-in 0.6s reverse;
}

@keyframes elastic-in {
  0% {
    transform: scale(0) rotate(-360deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(-180deg);
    opacity: 0.7;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

// 翻转动画
.flip-enter-active,
.flip-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
  transform-style: preserve-3d;
}

.flip-enter-from {
  opacity: 0;
  transform: rotateY(-90deg);
}

.flip-leave-to {
  opacity: 0;
  transform: rotateY(90deg);
}
</style>
