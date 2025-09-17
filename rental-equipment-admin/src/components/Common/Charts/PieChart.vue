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
const chartId = ref(`pie-chart-${Math.random().toString(36).substr(2, 9)}`)
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
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: props.data.map((item: any) => item.name) || []
      },
      series: [
        {
          name: '数据统计',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: props.data || []
        }
      ]
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
