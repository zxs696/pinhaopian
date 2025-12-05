<template>
  <div class="statistics-container">
    <div class="statistics-filters">
      <div class="filter-group">
        <label>统计周期:</label>
        <select v-model="period" @change="updateStatistics">
          <option value="daily">按日统计</option>
          <option value="weekly">按周统计</option>
          <option value="monthly">按月统计</option>
          <option value="yearly">按年统计</option>
        </select>
      </div>
      <div class="filter-group">
        <label>开始日期:</label>
        <input type="date" v-model="startDate" @change="updateStatistics">
      </div>
      <div class="filter-group">
        <label>结束日期:</label>
        <input type="date" v-model="endDate" @change="updateStatistics">
      </div>
      <div class="filter-group">
        <button class="query-btn" @click="queryStatistics">查询</button>
        <button class="reset-btn" @click="resetFilters">重置</button>
        <button class="export-btn" @click="exportStatistics">
          <i class="icon-download"></i> 导出报表
        </button>
      </div>
    </div>
    
    <div class="statistics-content">
      <!-- 汇总统计卡片 -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-icon users-icon">
            <i class="icon-users"></i>
          </div>
          <div class="summary-info">
            <div class="summary-title">用户统计</div>
            <div class="summary-data">
              <div class="summary-value">{{ summary.totalUsers }}</div>
              <div class="summary-label">总用户数</div>
            </div>
            <div class="summary-details">
              <div class="detail-item">
                <span class="detail-label">新增用户:</span>
                <span class="detail-value">{{ summary.newUsers }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">活跃用户:</span>
                <span class="detail-value">{{ summary.activeUsers }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon videos-icon">
            <i class="icon-video"></i>
          </div>
          <div class="summary-info">
            <div class="summary-title">视频统计</div>
            <div class="summary-data">
              <div class="summary-value">{{ summary.totalVideos }}</div>
              <div class="summary-label">总视频数</div>
            </div>
            <div class="summary-details">
              <div class="detail-item">
                <span class="detail-label">新增视频:</span>
                <span class="detail-value">{{ summary.newVideos }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">审核通过:</span>
                <span class="detail-value">{{ summary.approvedVideos }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon views-icon">
            <i class="icon-eye"></i>
          </div>
          <div class="summary-info">
            <div class="summary-title">观看统计</div>
            <div class="summary-data">
              <div class="summary-value">{{ formatNumber(summary.totalViews) }}</div>
              <div class="summary-label">总观看量</div>
            </div>
            <div class="summary-details">
              <div class="detail-item">
                <span class="detail-label">人均观看:</span>
                <span class="detail-value">{{ summary.avgViewsPerUser }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">峰值观看:</span>
                <span class="detail-value">{{ summary.peakViews }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon interactions-icon">
            <i class="icon-heart"></i>
          </div>
          <div class="summary-info">
            <div class="summary-title">互动统计</div>
            <div class="summary-data">
              <div class="summary-value">{{ formatNumber(summary.totalInteractions) }}</div>
              <div class="summary-label">总互动量</div>
            </div>
            <div class="summary-details">
              <div class="detail-item">
                <span class="detail-label">点赞数:</span>
                <span class="detail-value">{{ formatNumber(summary.totalLikes) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">评论数:</span>
                <span class="detail-value">{{ formatNumber(summary.totalComments) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 统计图表 -->
      <div class="charts-section">
        <div class="chart-container">
          <div class="chart-header">
            <h3>用户增长趋势</h3>
            <div class="chart-controls">
              <button @click="toggleChartType('user')" class="chart-type-btn">
                {{ userChartType === 'line' ? '柱状图' : '折线图' }}
              </button>
            </div>
          </div>
          <div class="chart-body">
            <div id="userChart" class="chart"></div>
          </div>
        </div>
        
        <div class="chart-container">
          <div class="chart-header">
            <h3>视频上传趋势</h3>
            <div class="chart-controls">
              <button @click="toggleChartType('video')" class="chart-type-btn">
                {{ videoChartType === 'line' ? '柱状图' : '折线图' }}
              </button>
            </div>
          </div>
          <div class="chart-body">
            <div id="videoChart" class="chart"></div>
          </div>
        </div>
      </div>
      
      <!-- 详细数据表格 -->
      <div class="data-table-section">
        <div class="table-header">
          <h3>详细统计数据</h3>
          <div class="table-controls">
            <div class="pagination-info">
              显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalItems) }} 条，共 {{ totalItems }} 条
            </div>
            <div class="pagination-controls">
              <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
              <span>{{ currentPage }} / {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
            </div>
          </div>
        </div>
        <div class="table-body">
          <table class="statistics-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>新增用户</th>
                <th>活跃用户</th>
                <th>新增视频</th>
                <th>审核通过</th>
                <th>观看次数</th>
                <th>点赞数</th>
                <th>评论数</th>
                <th>分享数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedData" :key="index">
                <td>{{ item.date }}</td>
                <td>{{ item.newUsers }}</td>
                <td>{{ item.activeUsers }}</td>
                <td>{{ item.newVideos }}</td>
                <td>{{ item.approvedVideos }}</td>
                <td>{{ formatNumber(item.views) }}</td>
                <td>{{ formatNumber(item.likes) }}</td>
                <td>{{ formatNumber(item.comments) }}</td>
                <td>{{ formatNumber(item.shares) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

// 筛选条件
const period = ref('daily')
const startDate = ref('')
const endDate = ref('')

// 图表类型
const userChartType = ref('line')
const videoChartType = ref('line')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 汇总数据
const summary = ref({
  totalUsers: 0,
  newUsers: 0,
  activeUsers: 0,
  totalVideos: 0,
  newVideos: 0,
  approvedVideos: 0,
  totalViews: 0,
  avgViewsPerUser: 0,
  peakViews: 0,
  totalInteractions: 0,
  totalLikes: 0,
  totalComments: 0
})

// 详细数据
const detailData = ref([])

// 计算属性
const totalItems = computed(() => detailData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return detailData.value.slice(start, end)
})

// 监听分页变化
watch(currentPage, () => {
  // 滚动到表格顶部
  const tableElement = document.querySelector('.data-table-section')
  if (tableElement) {
    tableElement.scrollIntoView({ behavior: 'smooth' })
  }
})

// 页面加载时初始化
onMounted(() => {
  initializeFilters()
  loadStatisticsData()
})

// 初始化筛选条件
const initializeFilters = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  startDate.value = formatDateForInput(thirtyDaysAgo)
  endDate.value = formatDateForInput(today)
}

// 加载统计数据
const loadStatisticsData = async () => {
  try {
    // 这里应该调用API获取实际数据
    // 暂时使用模拟数据
    summary.value = {
      totalUsers: 1250,
      newUsers: 85,
      activeUsers: 620,
      totalVideos: 3450,
      newVideos: 125,
      approvedVideos: 118,
      totalViews: 125000,
      avgViewsPerUser: 100,
      peakViews: 2500,
      totalInteractions: 45600,
      totalLikes: 32000,
      totalComments: 13600
    }
    
    // 生成详细数据
    generateDetailData()
    
    // 等待DOM更新后初始化图表
    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 生成详细数据
const generateDetailData = () => {
  const data = []
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  
  // 根据统计周期生成数据
  let currentDate = new Date(start)
  
  while (currentDate <= end) {
    data.push({
      date: formatDate(currentDate),
      newUsers: Math.floor(Math.random() * 20) + 5,
      activeUsers: Math.floor(Math.random() * 100) + 50,
      newVideos: Math.floor(Math.random() * 15) + 3,
      approvedVideos: Math.floor(Math.random() * 12) + 2,
      views: Math.floor(Math.random() * 2000) + 500,
      likes: Math.floor(Math.random() * 300) + 100,
      comments: Math.floor(Math.random() * 100) + 20,
      shares: Math.floor(Math.random() * 50) + 10
    })
    
    // 根据周期增加日期
    if (period.value === 'daily') {
      currentDate.setDate(currentDate.getDate() + 1)
    } else if (period.value === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7)
    } else if (period.value === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1)
    } else if (period.value === 'yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + 1)
    }
  }
  
  detailData.value = data
}

// 初始化图表
const initCharts = () => {
  // 这里应该使用图表库如ECharts初始化图表
  // 暂时只创建占位元素
}

// 更新统计数据
const updateStatistics = () => {
  loadStatisticsData()
}

// 查询统计数据
const queryStatistics = () => {
  currentPage.value = 1
  loadStatisticsData()
}

// 重置筛选条件
const resetFilters = () => {
  period.value = 'daily'
  initializeFilters()
  currentPage.value = 1
  loadStatisticsData()
}

// 导出统计报表
const exportStatistics = () => {
  // 这里应该实现数据导出功能
}

// 切换图表类型
const toggleChartType = (chartName) => {
  if (chartName === 'user') {
    userChartType.value = userChartType.value === 'line' ? 'bar' : 'line'
  } else if (chartName === 'video') {
    videoChartType.value = videoChartType.value === 'line' ? 'bar' : 'line'
  }
  
  // 重新初始化图表
  nextTick(() => {
    initCharts()
  })
}

// 分页控制
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
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

// 格式化日期为input格式
const formatDateForInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.statistics-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-group label {
  margin-right: 8px;
  font-weight: 500;
  white-space: nowrap;
}

.filter-group select,
.filter-group input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.query-btn,
.reset-btn,
.export-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.query-btn {
  background: #409eff;
  color: white;
}

.reset-btn {
  background: #f0f0f0;
  color: #666;
}

.export-btn {
  background: #67c23a;
  color: white;
}

.export-btn i {
  margin-right: 5px;
}

.statistics-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.summary-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  color: white;
  font-size: 24px;
}

.users-icon {
  background-color: #409eff;
}

.videos-icon {
  background-color: #67c23a;
}

.views-icon {
  background-color: #e6a23c;
}

.interactions-icon {
  background-color: #f56c6c;
}

.summary-info {
  flex: 1;
}

.summary-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
}

.summary-data {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
}

.summary-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-right: 10px;
}

.summary-label {
  color: #666;
}

.summary-details {
  display: flex;
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-container {
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

.chart-controls {
  display: flex;
  gap: 10px;
}

.chart-type-btn {
  padding: 4px 8px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.chart-type-btn:hover {
  background-color: #f5f7fa;
  border-color: #409eff;
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

.data-table-section {
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

.table-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-controls button {
  padding: 4px 8px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-controls button:not(:disabled):hover {
  background-color: #f5f7fa;
  border-color: #409eff;
  color: #409eff;
}

.table-body {
  overflow-x: auto;
}

.statistics-table {
  width: 100%;
  border-collapse: collapse;
}

.statistics-table th,
.statistics-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.statistics-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #333;
}

.statistics-table tr:hover {
  background-color: #f5f7fa;
}

@media (max-width: 1200px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .statistics-filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group select,
  .filter-group input {
    width: 100%;
  }
  
  .summary-card {
    flex-direction: column;
    text-align: center;
  }
  
  .summary-icon {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .summary-details {
    flex-direction: column;
    gap: 10px;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>