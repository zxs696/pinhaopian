<template>
  <div class="dashboard-container">
    <!-- 只保留核心内容，布局由AdminLayout提供 -->
    <div class="dashboard-content">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>数据概览</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <div class="content">
        <div class="stats-cards">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ statistics.totalVideos }}</div>
              <div class="stats-label">总视频数</div>
            </div>
            <div class="stats-icon">
              <el-icon class="icon-large"><video-play /></el-icon>
            </div>
          </el-card>
          
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ statistics.totalUsers }}</div>
              <div class="stats-label">总用户数</div>
            </div>
            <div class="stats-icon">
              <el-icon class="icon-large"><user /></el-icon>
            </div>
          </el-card>
          
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ statistics.totalViews }}</div>
              <div class="stats-label">总观看量</div>
            </div>
            <div class="stats-icon">
              <el-icon class="icon-large"><view /></el-icon>
            </div>
          </el-card>
          
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ statistics.newVideosToday }}</div>
              <div class="stats-label">今日新增视频</div>
            </div>
            <div class="stats-icon">
              <el-icon class="icon-large"><upload-filled /></el-icon>
            </div>
          </el-card>
        </div>
        
        <div class="charts-section">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>观看趋势（近7天）</span>
              </div>
            </template>
            <div class="chart-container">
              <div class="chart-placeholder">
                <el-empty description="图表区域" />
              </div>
            </div>
          </el-card>
          
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>分类占比</span>
              </div>
            </template>
            <div class="chart-container">
              <div class="chart-placeholder">
                <el-empty description="图表区域" />
              </div>
            </div>
          </el-card>
        </div>
        
        <div class="recent-activities">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>最近活动</span>
              </div>
            </template>
            <el-table :data="recentActivities" style="width: 100%">
              <el-table-column prop="time" label="时间" width="180" />
              <el-table-column prop="action" label="操作" width="120" />
              <el-table-column prop="user" label="用户" width="120" />
              <el-table-column prop="video" label="视频" show-overflow-tooltip />
            </el-table>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 管理后台仪表盘逻辑 - 只保留数据和功能相关逻辑
import { ref, onMounted } from 'vue'
import { 
  VideoPlay, 
  User, 
  UploadFilled,
  View
} from '@element-plus/icons-vue'

// 统计数据
const statistics = ref({
  totalVideos: 128,
  totalUsers: 512,
  totalViews: 10240,
  newVideosToday: 12
})

// 最近活动数据
const recentActivities = ref([
  {
    time: '2024-01-15 14:30',
    action: '上传视频',
    user: 'user123',
    video: '新年旅行vlog'
  },
  {
    time: '2024-01-15 13:15',
    action: '评论视频',
    user: 'user456',
    video: '美食制作教程'
  },
  {
    time: '2024-01-15 12:45',
    action: '点赞视频',
    user: 'user789',
    video: '科技新品评测'
  }
])

onMounted(() => {
  // 初始化数据
  loadDashboardData()
})

function loadDashboardData() {
  // 模拟加载仪表盘数据
  console.log('加载仪表盘数据')
}
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
}

.dashboard-content {
  width: 100%;
  height: 100%;
}

.content {
  padding: 20px;
  overflow-y: auto;
  height: calc(100% - 50px);
}

.breadcrumb {
  margin-bottom: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 32px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.stats-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.stats-icon {
  color: var(--el-color-primary);
}

.icon-large {
  font-size: 40px;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  height: 300px;
}

.chart-container {
  height: calc(100% - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-activities {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .chart-card {
    height: 250px;
  }
}
</style>