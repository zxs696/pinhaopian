<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <div class="content">
        <div class="stats-cards">
          <div class="stats-card video-card">
            <div class="stats-icon-wrapper">
              <div class="stats-icon-bg video-bg"></div>
              <el-icon class="stats-icon"><video-play /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ statistics.totalVideos }}</div>
              <div class="stats-label">总视频数</div>
              <div class="stats-change positive">+12.5%</div>
            </div>
          </div>
          
          <div class="stats-card user-card">
            <div class="stats-icon-wrapper">
              <div class="stats-icon-bg user-bg"></div>
              <el-icon class="stats-icon"><user /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ statistics.totalUsers }}</div>
              <div class="stats-label">总用户数</div>
              <div class="stats-change positive">+8.2%</div>
            </div>
          </div>
          
          <div class="stats-card view-card">
            <div class="stats-icon-wrapper">
              <div class="stats-icon-bg view-bg"></div>
              <el-icon class="stats-icon"><view /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ formatNumber(statistics.totalViews) }}</div>
              <div class="stats-label">总观看量</div>
              <div class="stats-change positive">+23.7%</div>
            </div>
          </div>
          
          <div class="stats-card upload-card">
            <div class="stats-icon-wrapper">
              <div class="stats-icon-bg upload-bg"></div>
              <el-icon class="stats-icon"><upload-filled /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ statistics.newVideosToday }}</div>
              <div class="stats-label">今日新增</div>
              <div class="stats-change neutral">与昨日持平</div>
            </div>
          </div>
        </div>
        
        <div class="charts-section">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">观看趋势</h3>
              <div class="chart-subtitle">近7天数据</div>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <el-empty description="图表区域" />
              </div>
            </div>
          </div>
          
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">分类占比</h3>
              <div class="chart-subtitle">视频类别分布</div>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <el-empty description="图表区域" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="recent-activities">
          <div class="section-header">
            <h3 class="section-title">最近活动</h3>
            <el-button type="primary" link>查看全部</el-button>
          </div>
          <div class="activities-list">
            <div v-for="(activity, index) in recentActivities" :key="index" class="activity-item">
              <div class="activity-icon">
                <el-icon><document /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-main">
                  <span class="activity-user">{{ activity.user }}</span>
                  <span class="activity-action">{{ activity.action }}</span>
                  <span class="activity-target">{{ activity.video }}</span>
                </div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
          </div>
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
  View,
  Document
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

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
</script>

<style scoped lang="scss">
// 导入主题变量
@use "@/assets/styles/theme" as theme;

.dashboard-container {
  width: 100%;
  height: 100%;
  background-color: var(--color-background);
}

.dashboard-content {
  width: 100%;
  height: 100%;
}

.content {
  padding: 24px;
  overflow-y: auto;
  height: 100%;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stats-card {
  background: var(--color-background);
  border-radius: var(--border-radius);
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: var(--transition);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stats-icon-wrapper {
  position: relative;
  margin-right: 20px;
}

.stats-icon-bg {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  position: absolute;
  opacity: 0.1;
}

.video-bg {
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
}

.user-bg {
  background: linear-gradient(135deg, var(--color-secondary) 0%, #f5576c 100%);
}

.view-bg {
  background: linear-gradient(135deg, var(--color-info) 0%, #00f2fe 100%);
}

.upload-bg {
  background: linear-gradient(135deg, var(--color-success) 0%, #38f9d7 100%);
}

.stats-icon {
  font-size: 28px;
  position: relative;
  z-index: 2;
}

.video-card .stats-icon {
  color: var(--color-primary);
}

.user-card .stats-icon {
  color: var(--color-secondary);
}

.view-card .stats-icon {
  color: var(--color-info);
}

.upload-card .stats-icon {
  color: var(--color-success);
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.stats-change {
  font-size: 12px;
  font-weight: 600;
}

.positive {
  color: var(--color-success);
}

.neutral {
  color: var(--color-text-secondary);
}

/* 图表区域样式 */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: var(--color-background);
  border-radius: var(--border-radius);
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 320px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  margin-bottom: 16px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.chart-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.chart-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 最近活动样式 */
.recent-activities {
  background: var(--color-background);
  border-radius: var(--border-radius);
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 12px;
  background-color: var(--color-hover);
  transition: var(--transition);
}

.activity-item:hover {
  background-color: var(--color-border);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: var(--color-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: var(--color-info);
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-main {
  margin-bottom: 4px;
}

.activity-user {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-right: 8px;
}

.activity-action {
  color: var(--color-text-secondary);
  margin-right: 8px;
}

.activity-target {
  color: var(--color-primary);
  font-weight: 500;
}

.activity-time {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .chart-card {
    height: 280px;
  }
  
  .stats-card {
    padding: 20px;
  }
  
  .chart-card {
    padding: 20px;
  }
  
  .recent-activities {
    padding: 20px;
  }
}
</style>