<template>
  <div class="pending-videos-container">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>待审核视频</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-actions">
      <el-button type="primary" @click="refreshList">
        <el-icon><Refresh /></el-icon>
        刷新列表
      </el-button>
    </div>
          <el-card>
            <template #header>
              <div class="card-header">
                <span>待审核视频列表</span>
                <span class="pending-count">（共 {{ pendingVideos.length }} 个视频）</span>
              </div>
            </template>
            
            <div class="filter-section">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索视频标题或上传者"
                class="search-input"
                prefix-icon="Search"
                @keyup.enter="handleSearch"
              />
              <el-select v-model="filterCategory" placeholder="选择分类" class="category-select">
                <el-option label="全部分类" value="" />
                <el-option label="生活" value="life" />
                <el-option label="科技" value="tech" />
                <el-option label="娱乐" value="entertainment" />
                <el-option label="教育" value="education" />
                <el-option label="音乐" value="music" />
              </el-select>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetFilters">重置</el-button>
            </div>
            
            <el-table 
              :data="filteredVideos" 
              style="width: 100%"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="title" label="视频标题" min-width="200">
                <template #default="scope">
                  <div class="video-title">
                    <el-avatar :size="40" :src="scope.row.coverImage" class="video-cover" />
                    <span>{{ scope.row.title }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="uploader" label="上传者" width="120" />
              <el-table-column prop="category" label="分类" width="100" />
              <el-table-column prop="duration" label="时长" width="80">
                <template #default="scope">
                  {{ formatDuration(scope.row.duration) }}
                </template>
              </el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.uploadTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="previewVideo(scope.row)">预览</el-button>
                  <el-button type="success" size="small" @click="approveVideo(scope.row)">通过</el-button>
                  <el-button type="danger" size="small" @click="rejectVideo(scope.row)">拒绝</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="table-footer">
              <div class="batch-actions" v-if="selectedVideos.length > 0">
                <span>已选择 {{ selectedVideos.length }} 个视频</span>
                <el-button type="success" @click="batchApprove">批量通过</el-button>
                <el-button type="danger" @click="batchReject">批量拒绝</el-button>
              </div>
              <div class="pagination">
                  <el-pagination
                    v-model:current-page="pagination.currentPage"
                    v-model:page-size="pagination.pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="filteredVideos.length"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                  />
                </div>
              </div>
            </el-card>
    
    <!-- 视频预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="视频预览"
      width="80%"
      :before-close="handleClosePreview"
    >
      <div v-if="previewVideoData" class="video-preview-container">
        <video :src="previewVideoData.videoUrl" controls class="preview-player" />
        <div class="preview-info">
          <h3>{{ previewVideoData.title }}</h3>
          <p class="preview-uploader">上传者：{{ previewVideoData.uploader }}</p>
          <p class="preview-category">分类：{{ getCategoryName(previewVideoData.category) }}</p>
          <p class="preview-description">
            <strong>视频描述：</strong>
            {{ previewVideoData.description || '无描述' }}
          </p>
          <div class="preview-tags">
            <strong>标签：</strong>
            <el-tag v-for="tag in previewVideoData.tags" :key="tag" class="tag-item">
              {{ tag }}
            </el-tag>
            <span v-if="previewVideoData.tags.length === 0">无标签</span>
          </div>
        </div>
        <div class="preview-actions">
          <el-button type="success" @click="approveVideo(previewVideoData)">通过审核</el-button>
          <el-button type="danger" @click="rejectVideo(previewVideoData)">拒绝审核</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
// 待审核视频管理页面逻辑
import { ref, computed, onMounted } from 'vue'
import { 
  DataLine, 
  VideoPlay, 
  User, 
  Grid, 
  Search, 
  Refresh 
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccess } from '../../utils/message.js'

const activeMenu = ref('pending-videos')
const searchKeyword = ref('')
const filterCategory = ref('')
const selectedVideos = ref([])
const previewVisible = ref(false)
const previewVideoData = ref(null)

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 模拟待审核视频数据
const pendingVideos = ref([
  {
    id: '1001',
    title: '城市夜景延时摄影',
    uploader: 'creator123',
    category: 'life',
    duration: 360,
    uploadTime: '2024-01-15 10:30:00',
    coverImage: '/logo.png',
    videoUrl: '#',
    description: '记录城市夜晚的美丽景色',
    tags: ['延时摄影', '城市', '夜景']
  },
  {
    id: '1002',
    title: 'Python数据分析入门教程',
    uploader: 'teacher456',
    category: 'education',
    duration: 1200,
    uploadTime: '2024-01-15 09:45:00',
    coverImage: '/logo.png',
    videoUrl: '#',
    description: '从零开始学习Python数据分析',
    tags: ['Python', '数据分析', '教程']
  },
  {
    id: '1003',
    title: '最新科技产品开箱',
    uploader: 'techreviewer',
    category: 'tech',
    duration: 600,
    uploadTime: '2024-01-15 08:20:00',
    coverImage: '/logo.png',
    videoUrl: '#',
    description: '最新科技产品的开箱体验',
    tags: ['科技', '开箱', '评测']
  }
])

// 计算过滤后的视频列表
const filteredVideos = computed(() => {
  let result = [...pendingVideos.value]
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(video => 
      video.title.toLowerCase().includes(keyword) || 
      video.uploader.toLowerCase().includes(keyword)
    )
  }
  
  // 分类过滤
  if (filterCategory.value) {
    result = result.filter(video => video.category === filterCategory.value)
  }
  
  return result
})

onMounted(() => {
  loadPendingVideos()
})

function loadPendingVideos() {
  // 模拟加载待审核视频数据
  console.log('加载待审核视频数据')
}

function handleMenuSelect(key) {
  activeMenu.value = key
  console.log('选择菜单:', key)
  // 根据选择的菜单项跳转到相应页面
}

function handleSearch() {
  // 执行搜索
  pagination.value.currentPage = 1
  console.log('搜索关键词:', searchKeyword.value)
  console.log('选择分类:', filterCategory.value)
}

function resetFilters() {
  searchKeyword.value = ''
  filterCategory.value = ''
  pagination.value.currentPage = 1
}

function handleSelectionChange(selection) {
  selectedVideos.value = selection
}

function previewVideo(video) {
  previewVideoData.value = video
  previewVisible.value = true
}

function handleClosePreview() {
  previewVisible.value = false
  previewVideoData.value = null
}

function approveVideo(video) {
  ElMessageBox.confirm('确定要通过此视频的审核吗？', '审核确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟通过审核
    const index = pendingVideos.value.findIndex(v => v.id === video.id)
    if (index !== -1) {
      pendingVideos.value.splice(index, 1)
    }
    showSuccess('视频审核通过')
    if (previewVisible.value) {
      handleClosePreview()
    }
  }).catch(() => {
    // 取消操作
  })
}

function rejectVideo(video) {
  ElMessageBox.prompt('请输入拒绝理由', '拒绝审核', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入拒绝原因'
  }).then(({ value }) => {
    // 模拟拒绝审核
    const index = pendingVideos.value.findIndex(v => v.id === video.id)
    if (index !== -1) {
      pendingVideos.value.splice(index, 1)
    }
    showSuccess('视频已拒绝')
    if (previewVisible.value) {
      handleClosePreview()
    }
  }).catch(() => {
    // 取消操作
  })
}

function batchApprove() {
  ElMessageBox.confirm(`确定要通过选中的 ${selectedVideos.value.length} 个视频吗？`, '批量审核', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 批量通过审核
    selectedVideos.value.forEach(video => {
      const index = pendingVideos.value.findIndex(v => v.id === video.id)
      if (index !== -1) {
        pendingVideos.value.splice(index, 1)
      }
    })
    selectedVideos.value = []
    showSuccess('批量通过成功')
  }).catch(() => {
    // 取消操作
  })
}

function batchReject() {
  ElMessageBox.prompt('请输入批量拒绝理由', '批量拒绝', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入拒绝原因'
  }).then(({ value }) => {
    // 批量拒绝审核
    selectedVideos.value.forEach(video => {
      const index = pendingVideos.value.findIndex(v => v.id === video.id)
      if (index !== -1) {
        pendingVideos.value.splice(index, 1)
      }
    })
    selectedVideos.value = []
    showSuccess('批量拒绝成功')
  }).catch(() => {
    // 取消操作
  })
}

function refreshList() {
  loadPendingVideos()
  showSuccess('列表已刷新')
}

function handleSizeChange(size) {
  pagination.value.pageSize = size
}

function handleCurrentChange(current) {
  pagination.value.currentPage = current
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('zh-CN')
}

function getCategoryName(categoryKey) {
  const categoryMap = {
    'life': '生活',
    'tech': '科技',
    'entertainment': '娱乐',
    'education': '教育',
    'music': '音乐',
    'other': '其他'
  }
  return categoryMap[categoryKey] || categoryKey
}
</script>

<style scoped>
.pending-videos-container {
  padding: 20px;
  height: 100%;
}

.header-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.breadcrumb {
  margin-bottom: 15px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pending-count {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.category-select {
  width: 150px;
}

.video-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.video-cover {
  object-fit: cover;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.video-preview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-player {
  width: 100%;
  max-height: 500px;
}

.preview-info {
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
}

.preview-info h3 {
  margin-top: 0;
}

.preview-uploader,
.preview-category {
  color: var(--el-text-color-secondary);
  margin: 8px 0;
}

.preview-tags {
  margin-top: 10px;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.preview-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .search-input,
  .category-select {
    width: 100%;
  }
  
  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .batch-actions {
    justify-content: center;
  }
  
  .preview-player {
    max-height: 300px;
  }
}
</style>