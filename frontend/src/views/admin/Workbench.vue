<template>
  <div class="workbench-container">
    <div class="dashboard-grid">
      <!-- 快捷操作区域 -->
      <div class="card">
        <div class="card-header">
          <h3>快捷操作</h3>
        </div>
        <div class="card-body">
          <div class="quick-actions">
            <div class="action-item" @click="navigateTo('/admin/videos/pending')">
              <div class="action-icon">
                <i class="icon-video"></i>
              </div>
              <div class="action-text">
                <h4>视频审核</h4>
                <p>待审核视频: {{ pendingCount }}</p>
              </div>
            </div>
            <div class="action-item" @click="navigateTo('/admin/videos')">
              <div class="action-icon">
                <i class="icon-manage"></i>
              </div>
              <div class="action-text">
                <h4>视频管理</h4>
                <p>管理所有视频内容</p>
              </div>
            </div>
            <div class="action-item" @click="navigateTo('/admin/users')">
              <div class="action-icon">
                <i class="icon-users"></i>
              </div>
              <div class="action-text">
                <h4>用户管理</h4>
                <p>管理系统用户</p>
              </div>
            </div>
            <div class="action-item" @click="navigateTo('/upload')">
              <div class="action-icon">
                <i class="icon-upload"></i>
              </div>
              <div class="action-text">
                <h4>上传视频</h4>
                <p>发布新视频内容</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 系统通知 -->
      <div class="card">
        <div class="card-header">
          <h3>系统通知</h3>
        </div>
        <div class="card-body">
          <div class="notification-list">
            <div class="notification-item" v-for="(notification, index) in notifications" :key="index">
              <div class="notification-icon" :class="notification.type">
                <i :class="getNotificationIcon(notification.type)"></i>
              </div>
              <div class="notification-content">
                <h4>{{ notification.title }}</h4>
                <p>{{ notification.content }}</p>
                <span class="notification-time">{{ formatTime(notification.time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 数据概览 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>数据概览</h3>
        </div>
        <div class="card-body">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">总用户数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalVideos }}</div>
              <div class="stat-label">总视频数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.todayUploads }}</div>
              <div class="stat-label">今日上传</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.pendingReviews }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 待审核视频数量
const pendingCount = ref(0)

// 通知列表
const notifications = ref([
  {
    type: 'info',
    title: '系统更新通知',
    content: '系统将于今晚22:00进行维护升级，预计持续2小时',
    time: new Date(Date.now() - 3600000)
  },
  {
    type: 'warning',
    title: '存储空间提醒',
    content: '当前存储空间使用率已达80%，请及时清理或扩容',
    time: new Date(Date.now() - 7200000)
  },
  {
    type: 'success',
    title: '审核任务完成',
    content: '您有10个视频已审核完成并发布',
    time: new Date(Date.now() - 10800000)
  }
])

// 数据统计
const stats = ref({
  totalUsers: 0,
  totalVideos: 0,
  todayUploads: 0,
  pendingReviews: 0
})

// 页面加载时获取数据
onMounted(async () => {
  try {
    // 这里应该调用API获取实际数据
    // 暂时使用模拟数据
    pendingCount.value = 15
    stats.value = {
      totalUsers: 1250,
      totalVideos: 3450,
      todayUploads: 28,
      pendingReviews: 15
    }
  } catch (error) {
    console.error('获取工作台数据失败:', error)
  }
})

// 导航方法
const navigateTo = (path) => {
  router.push(path)
}

// 获取通知图标
const getNotificationIcon = (type) => {
  const icons = {
    info: 'icon-info',
    warning: 'icon-warning',
    success: 'icon-success',
    error: 'icon-error'
  }
  return icons[type] || 'icon-info'
}

// 格式化时间
const formatTime = (time) => {
  const now = new Date()
  const diff = now - time
  const hours = Math.floor(diff / 3600000)
  
  if (hours < 1) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    const days = Math.floor(hours / 24)
    return `${days}天前`
  }
}
</script>

<style scoped>
.workbench-container {
  padding: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.card-body {
  padding: 20px;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 18px;
}

.action-text h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 500;
}

.action-text p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
}

.notification-icon.info {
  background-color: #409eff;
}

.notification-icon.warning {
  background-color: #e6a23c;
}

.notification-icon.success {
  background-color: #67c23a;
}

.notification-icon.error {
  background-color: #f56c6c;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 500;
}

.notification-content p {
  margin: 0 0 5px 0;
  font-size: 12px;
  color: #666;
}

.notification-time {
  font-size: 11px;
  color: #999;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  border-radius: 6px;
  background-color: #f5f7fa;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>