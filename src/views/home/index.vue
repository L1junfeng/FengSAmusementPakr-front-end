<!--
 * @Descripttion: 
 * @version: 
 * @Date: 2021-04-20 11:06:21
 * @LastEditors: huzhushan@126.com
 * @LastEditTime: 2022-09-24 18:18:43
 * @Author: huzhushan@126.com
 * @HomePage: https://huzhushan.gitee.io/vue3-element-admin
 * @Github: https://github.com/huzhushan/vue3-element-admin
 * @Donate: https://huzhushan.gitee.io/vue3-element-admin/donate/
-->
<!-- <template>
  home,hello
</template> -->


<template>
  <el-container>
    <el-header>
      <h1>游乐园管理系统</h1>
    </el-header>
    <el-main>
      <!-- 统计卡片 -->
      <el-row :gutter="20">
        <el-col :span="6" v-for="(stat, index) in stats" :key="index">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <el-icon>
                  <component :is="stat.icon" />
                </el-icon>
                <span>{{ stat.name }}</span>
              </div>
            </template>
            <div class="card-content">
              {{ stat.value }}
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表和活动 -->
      <el-row :gutter="20" class="mt-4">
        <el-col :span="16">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>游客趋势</span>
              </div>
            </template>
            <div ref="chartRef" style="height: 300px;"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>最近活动</span>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in recentActivities"
                :key="index"
                :timestamp="activity.time"
                placement="top"
              >
                <el-card>
                  <h4>{{ activity.name }}</h4>
                  <p>{{ activity.description }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>

      <!-- 快速操作 -->
      <el-row class="mt-4">
        <el-col :span="24">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>快速操作</span>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :span="6" v-for="(action, index) in quickActions" :key="index">
                <el-button type="primary" :icon="action.icon" class="w-full">
                  {{ action.name }}
                </el-button>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, Ticket, Money, TrendCharts, Plus, Setting, Calendar, PieChart } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const stats = ref([
  { name: '今日游客', value: '3,897', icon: User },
  { name: '售出门票', value: '5,240', icon: Ticket },
  { name: '今日收入', value: '¥158,230', icon: Money },
  { name: '设备使用率', value: '87%', icon: TrendCharts },
])

const recentActivities = ref([
  { name: '过山车维护完成', time: '2023-05-20 14:30', description: '工程团队完成了对"极速飞车"的例行维护。' },
  { name: '新餐厅开业', time: '2023-05-20 11:00', description: '主题餐厅"海底世界"正式开始营业。' },
  { name: '儿童节活动策划会议', time: '2023-05-20 09:30', description: '市场部完成了即将到来的儿童节活动策划。' },
])

const quickActions = ref([
  { name: '添加新活动', icon: Plus },
  { name: '设备管理', icon: Setting },
  { name: '查看日程', icon: Calendar },
  { name: '游客分析', icon: PieChart },
])

const chartRef = ref(null)

onMounted(() => {
  const chart = echarts.init(chartRef.value)
  const option = {
    title: {
      text: '近7天游客数量'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [3000, 3500, 3200, 4500, 5000, 7000, 6500],
      type: 'line',
      smooth: true
    }]
  }
  chart.setOption(option)
})
</script>

<style scoped>
.el-header {
  background-color: #409EFF;
  color: white;
  line-height: 60px;
}
.el-header h1 {
  margin: 0;
}
.card-header {
  display: flex;
  align-items: center;
}
.card-header .el-icon {
  margin-right: 10px;
}
.stat-card .card-content {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}
.mt-4 {
  margin-top: 20px;
}
.w-full {
  width: 100%;
}
</style>