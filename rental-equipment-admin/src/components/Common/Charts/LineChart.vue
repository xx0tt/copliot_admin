<template>
  <div :id="chartId" :style="{ width: width, height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

// Props 定义
interface Props {
  data: any
  options?: any
  width?: string
  height?: string
  theme?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  theme: 'default'
})

// 生成唯一的图表ID
const chartId = ref(`line-chart-${Math.random().toString(36).substr(2, 9)}`)
let chartInstance: echarts.ECharts | null = null

// 初始化图表
const initChart = () => {
  const chartDom = document.getElementById(chartId.value)
  if (chartDom) {
    chartInstance = echarts.init(chartDom, props.theme)
    updateChart()
  }
}

// 更新图表数据
const updateChart = () => {
  if (chartInstance && props.data) {
    const defaultOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: props.data.legend || []
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: props.data.xAxis || []
      },
      yAxis: {
        type: 'value'
      },
      series: props.data.series || []
    }

    const finalOptions = props.options ? { ...defaultOptions, ...props.options } : defaultOptions
    chartInstance.setOption(finalOptions)
  }
}

// 图表自适应
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听数据变化
watch(
  () => props.data,
  () => {
    updateChart()
  },
  { deep: true }
)

// 监听配置变化
watch(
  () => props.options,
  () => {
    updateChart()
  },
  { deep: true }
)

// 生命周期
onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', resizeChart)
})

// 暴露方法给父组件
defineExpose({
  getChartInstance: () => chartInstance,
  resizeChart
})
</script>

<style scoped lang="scss">
/* 图表容器样式 */
</style>
