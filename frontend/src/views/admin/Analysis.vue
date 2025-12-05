<template>
  <div class="analysis-container">
    <div class="analysis-filters">
      <div class="filter-group">
        <label>时间范围:</label>
        <select v-model="timeRange" @change="updateAnalysis">
          <option value="7">最近7天</option>
          <option value="30">最近30天</option>
          <option value="90">最近90天</option>
          <option value="365">最近一年</option>
        </select>
      </div>
      <div class="filter-group">
        <label>数据类型:</label>
        <select v-model="dataType" @change="updateAnalysis">
          <option value="all">全部数据</option>
          <option value="users">用户数据</option>
          <option value="videos">视频数据</option>
          <option value="interactions">互动数据</option>
        </select>
      </div>
      <button class="refresh-btn" @click="refreshData">
        <i class="icon-refresh"></i> 刷新数据
      </button>
    </div>
    
    <div class="analysis-content">
      <!-- 关键指标卡片 -->
      <div class="metrics-cards">
        <div class="metric-card">
          <div class="metric-icon user-icon">
            <i class="icon-users"></i>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ metrics.totalUsers }}</div>
            <div class="metric-label">总用户数</div>
            <div class="metric-change" :class="metrics.usersChange >= 0 ? 'positive' : 'negative'">
              {{ metrics.usersChange >= 0 ? '+' : '' }}{{ metrics.usersChange }}%
            </div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon video-icon">
            <i class="icon-video"></i>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ metrics.totalVideos }}</div>
            <div class="metric-label">总视频数</div>
            <div class="metric-change" :class="metrics.videosChange >= 0 ? 'positive' : 'negative'">
              {{ metrics.videosChange >= 0 ? '+' : '' }}{{ metrics.videosChange }}%
            </div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon view-icon">
            <i class="icon-eye"></i>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ formatNumber(metrics.totalViews) }}</div>
            <div class="metric-label">总观看量</div>
            <div class="metric-change" :class="metrics.viewsChange >= 0 ? 'positive' : 'negative'">
              {{ metrics.viewsChange >= 0 ? '+' : '' }}{{ metrics.viewsChange }}%
            </div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon interaction-icon">
            <i class="icon-heart"></i>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ formatNumber(metrics.totalInteractions) }}</div>
            <div class="metric-label">总互动量</div>
            <div class="metric-change" :class="metrics.interactionsChange >= 0 ? 'positive' : 'negative'">
              {{ metrics.interactionsChange >= 0 ? '+' : '' }}{{ metrics.interactionsChange }}%
            </div>
          </div>
        </div>
      </div>
      
      <!-- 图表区域 -->
      <div class="charts-container">
        <!-- 用户增长趋势图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>用户增长趋势</h3>
            <div class="chart-actions">
              <button @click="exportChart('userGrowth')" class="export-btn">
                <i class="icon-download"></i>
              </button>
            </div>
          </div>
          <div class="chart-body">
            <div id="userGrowthChart" class="chart"></div>
          </div>
        </div>
        
        <!-- 视频上传趋势图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>视频上传趋势</h3>
            <div class="chart-actions">
              <button @click="exportChart('videoUpload')" class="export-btn">
                <i class="icon-download"></i>
              </button>
            </div>
          </div>
          <div class="chart-body">
            <div id="videoUploadChart" class="chart"></div>
          </div>
        </div>
        
        <!-- 视频分类分布图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>视频分类分布</h3>
            <div class="chart-actions">
              <button @click="exportChart('categoryDistribution')" class="export-btn">
                <i class="icon-download"></i>
              </button>
            </div>
          </div>
          <div class="chart-body">
            <div id="categoryDistributionChart" class="chart"></div>
          </div>
        </div>
        
        <!-- 用户活跃度热力图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>用户活跃度热力图</h3>
            <div class="chart-actions">
              <button @click="exportChart('userActivity')" class="export-btn">
                <i class="icon-download"></i>
              </button>
            </div>
          </div>
          <div class="chart-body">
            <div id="userActivityChart" class="chart"></div>
          </div>
        </div>
      </div>
      
      <!-- 数据表格 -->
      <div class="data-table-card">
        <div class="table-header">
          <h3>详细数据</h3>
          <div class="table-actions">
            <button @click="exportData" class="export-btn">
              <i class="icon-download"></i> 导出数据
            </button>
          </div>
        </div>
        <div class="table-body">
          <table class="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>新增用户</th>
                <th>新增视频</th>
                <th>观看次数</th>
                <th>点赞数</th>
                <th>评论数</th>
                <th>分享数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in tableData" :key="index">
                <td>{{ row.date }}</td>
                <td>{{ row.newUsers }}</td>
                <td>{{ row.newVideos }}</td>
                <td>{{ formatNumber(row.views) }}</td>
                <td>{{ formatNumber(row.likes) }}</td>
                <td>{{ formatNumber(row.comments) }}</td>
                <td>{{ formatNumber(row.shares) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

// 筛选条件
const timeRange = ref('30')
const dataType = ref('all')

// 关键指标数据
const metrics = ref({
  totalUsers: 0,
  usersChange: 0,
  totalVideos: 0,
  videosChange: 0,
  totalViews: 0,
  viewsChange: 0,
  totalInteractions: 0,
  interactionsChange: 0
})

// 表格数据
const tableData = ref([])

// 页面加载时初始化
onMounted(() => {
  loadAnalysisData()
  // 这里应该初始化图表库，如ECharts
  // 暂时使用模拟数据
})

// 加载分析数据
const loadAnalysisData = async () => {
  try {
    // 这里应该调用API获取实际数据
    // 暂时使用模拟数据
    metrics.value = {
      totalUsers: 1250,
      usersChange: 5.2,
      totalVideos: 3450,
      videosChange: 8.7,
      totalViews: 125000,
      viewsChange: 12.3,
      totalInteractions: 45600,
      interactionsChange: 9.8
    }
    
    // 生成表格数据
    generateTableData()
    
    // 等待DOM更新后初始化图表
    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    console.error('加载分析数据失败:', error)
  }
}

// 生成表格数据
const generateTableData = () => {
  const data = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    
    data.push({
      date: formatDate(date),
      newUsers: Math.floor(Math.random() * 20) + 5,
      newVideos: Math.floor(Math.random() * 15) + 3,
      views: Math.floor(Math.random() * 2000) + 500,
      likes: Math.floor(Math.random() * 300) + 100,
      comments: Math.floor(Math.random() * 100) + 20,
      shares: Math.floor(Math.random() * 50) + 10
    })
  }
  
  tableData.value = data
}

// 初始化图表
const initCharts = () => {
  // 这里应该使用图表库如ECharts初始化图表
  // 暂时只创建占位元素
  console.log('初始化图表')
}

// 更新分析数据
const updateAnalysis = () => {
  loadAnalysisData()
}

// 刷新数据
const refreshData = () => {
  loadAnalysisData()
}

// 导出图表
const exportChart = (chartId) => {
  // 这里应该实现图表导出功能
  console.log('导出图表:', chartId)
}

// 导出数据
const exportData = () => {
  // 这里应该实现数据导出功能
  console.log('导出数据')
}

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped>
.analysis-container {
  padding: 20px;
}

.analysis-filters {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.filter-group label {
  margin-right: 8px;
  font-weight: 500;
}

.filter-group select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.refresh-btn {
  padding: 6px 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.refresh-btn i {
  margin-right: 5px;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.metric-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 20px;
}

.user-icon {
  background-color: #409eff;
}

.video-icon {
  background-color: #67c23a;
}

.view-icon {
  background-color: #e6a23c;
}

.interaction-icon {
  background-color: #f56c6c;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.metric-label {
  color: #666;
  margin-bottom: 5px;
}

.metric-change {
  font-size: 12px;
  font-weight: 500;
}

.metric-change.positive {
  color: #67c23a;
}

.metric-change.negative {
  color: #f56c6c;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.chart-actions {
  display: flex;
  gap: 10px;
}

.export-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 5px;
  border-radius: 4px;
}

.export-btn:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.chart-body {
  padding: 20px;
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}

.data-table-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.table-body {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #333;
}

.data-table tr:hover {
  background-color: #f5f7fa;
}

@media (max-width: 1200px) {
  .metrics-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .analysis-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .filter-group {
    margin-right: 0;
  }
  
  .metrics-cards {
    grid-template-columns: 1fr;
  }
}
</style>