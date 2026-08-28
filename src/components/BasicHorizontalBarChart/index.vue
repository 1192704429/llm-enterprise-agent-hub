<template>
  <div>
    <el-card>
      <div slot="header" style="font-size: 20px;font-weight: bold;">
        {{ name }}
      </div>
      <div :style="{ width: '100%', height: '400px' }" :id="chartId" v-if="dataList.length > 0" />
      <el-empty :style="{ width: '100%', height: '400px' }" description="数据为空~" v-else />
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  props: {
    name: {
      type: String,
      default: '横向柱状图'
    },
    dataList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chartId: `chart-${Date.now()}-${Math.floor(Math.random() * 1000)}horizontalBarChart`
    }
  },
  watch: {
    dataList: {
      handler(newVal) {
        this.$nextTick(() => {
          if (newVal.length === 0) {
            return
          }
          this.initChart(newVal)
        })
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    initChart(data) {
      const names = data.map(item => item.name)
      const values = data.map(item => item.value)
      const chartDom = document.getElementById(this.chartId)
      const myChart = echarts.init(chartDom)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '8%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: names,
          inverse: true,
          axisLabel: {
            width: 120,
            overflow: 'truncate'
          }
        },
        series: [
          {
            type: 'bar',
            data: values,
            itemStyle: {
              color: '#1890ff'
            }
          }
        ]
      }
      myChart.setOption(option)
    }
  }
}
</script>
