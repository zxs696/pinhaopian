<template>
  <div class="video-management-container">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>视频管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-actions">
      <el-button type="warning" @click="exportVideoData">
        <el-icon><download /></el-icon>
        导出数据
      </el-button>
      <el-button type="primary" @click="refreshList">
                <el-icon><Refresh /></el-icon>
                刷新列表
              </el-button>
            </div>
          <el-card>
            <template #header>
              <div class="card-header">
                <span>视频管理</span>
                <span class="video-count">（共 {{ videos.length }} 个视频）</span>
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
                <el-option label="其他" value="other" />
              </el-select>
              <el-select v-model="filterStatus" placeholder="选择状态" class="status-select">
                <el-option label="全部状态" value="" />
                <el-option label="正常" value="normal" />
                <el-option label="下架" value="offline" />
              </el-select>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetFilters">重置</el-button>
            </div>
            
            <el-table 
              :data="paginatedVideos" 
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
              <el-table-column prop="category" label="分类" width="100">
                <template #default="scope">
                  <el-tag>{{ getCategoryName(scope.row.category) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="views" label="观看量" width="100" />
              <el-table-column prop="likes" label="点赞数" width="100" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'">
                    {{ scope.row.status === 'normal' ? '正常' : '下架' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.uploadTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewVideo(scope.row)">查看</el-button>
                  <el-button type="warning" size="small" @click="editVideo(scope.row)">编辑</el-button>
                  <el-button 
                    :type="scope.row.status === 'normal' ? 'danger' : 'success'" 
                    size="small" 
                    @click="toggleVideoStatus(scope.row)"
                  >
                    {{ scope.row.status === 'normal' ? '下架' : '上架' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="table-footer">
              <div class="batch-actions" v-if="selectedVideos.length > 0">
                <span>已选择 {{ selectedVideos.length }} 个视频</span>
                <el-button type="danger" @click="batchOffline">批量下架</el-button>
                <el-button type="success" @click="batchOnline">批量上架</el-button>
                <el-button type="warning" @click="batchDelete" plain>批量删除</el-button>
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

    
    <!-- 视频编辑对话框 -->
    <el-dialog
      v-model="editVisible"
      title="编辑视频信息"
      width="60%"
      :before-close="handleCloseEdit"
    >
      <div v-if="editingVideo" class="edit-form">
        <el-form :model="editingVideo" label-width="120px">
          <el-form-item label="视频标题" required>
            <el-input v-model="editingVideo.title" placeholder="请输入视频标题" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="视频分类" required>
            <el-select v-model="editingVideo.category" placeholder="请选择视频分类">
              <el-option label="生活" value="life" />
              <el-option label="科技" value="tech" />
              <el-option label="娱乐" value="entertainment" />
              <el-option label="教育" value="education" />
              <el-option label="音乐" value="music" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="视频状态">
            <el-select v-model="editingVideo.status" placeholder="请选择视频状态">
              <el-option label="正常" value="normal" />
              <el-option label="下架" value="offline" />
            </el-select>
          </el-form-item>
          <el-form-item label="视频描述">
            <el-input
              v-model="editingVideo.description"
              type="textarea"
              :rows="4"
              placeholder="请输入视频描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="handleCloseEdit">取消</el-button>
        <el-button type="primary" @click="saveVideoChanges">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 视频管理页面逻辑
import { ref, computed, onMounted } from 'vue'
import { 
  DataLine, 
  VideoPlay, 
  Timer, 
  User, 
  Grid, 
  Search, 
  Refresh, 
  Download 
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccess, showInfo } from '../../utils/message.js'

const activeMenu = ref('video-management')
const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const selectedVideos = ref([])
const editVisible = ref(false)
const editingVideo = ref(null)

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 模拟视频数据
const videos = ref([
  {
    id: '001',
    title: '摄影技巧分享：如何拍出专业级照片',
    uploader: 'photographer123',
    category: 'education',
    views: 12580,
    likes: 986,
    status: 'normal',
    uploadTime: '2024-01-14 15:30:00',
    coverImage: '/logo.png',
    description: '本视频分享了一些专业摄影技巧，帮助你提升拍照水平。'
  },
  {
    id: '002',
    title: '2024年最新科技产品评测',
    uploader: 'techreviewer',
    category: 'tech',
    views: 25600,
    likes: 2145,
    status: 'normal',
    uploadTime: '2024-01-13 10:15:00',
    coverImage: '/logo.png',
    description: '详细评测2024年最新发布的科技产品，包括性能、价格和使用体验。'
  },
  {
    id: '003',
    title: '家常菜教程：红烧肉的做法',
    uploader: 'chefmaster',
    category: 'life',
    views: 32450,
    likes: 3567,
    status: 'normal',
    uploadTime: '2024-01-12 18:45:00',
    coverImage: '/logo.png',
    description: '详细教程教你如何做出美味的红烧肉，简单易学。'
  },
  {
    id: '004',
    title: '古典音乐欣赏：贝多芬第五交响曲',
    uploader: 'musiclover',
    category: 'music',
    views: 8900,
    likes: 765,
    status: 'normal',
    uploadTime: '2024-01-11 20:20:00',
    coverImage: '/logo.png',
    description: '深入解析贝多芬第五交响曲，带你领略古典音乐的魅力。'
  },
  {
    id: '005',
    title: '电影解析：《星际穿越》中的科学原理',
    uploader: 'moviecritic',
    category: 'entertainment',
    views: 45800,
    likes: 4321,
    status: 'offline',
    uploadTime: '2024-01-10 14:10:00',
    coverImage: '/logo.png',
    description: '解析《星际穿越》中涉及的科学原理，探讨科幻与现实的边界。'
  }
])

// 计算过滤后的视频列表
const filteredVideos = computed(() => {
  let result = [...videos.value]
  
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
  
  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(video => video.status === filterStatus.value)
  }
  
  return result
})

// 分页后的视频列表
const paginatedVideos = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredVideos.value.slice(start, end)
})

onMounted(() => {
  loadVideoData()
})

function loadVideoData() {
  // 模拟加载视频数据
  console.log('加载视频数据')
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
  console.log('选择状态:', filterStatus.value)
}

function resetFilters() {
  searchKeyword.value = ''
  filterCategory.value = ''
  filterStatus.value = ''
  pagination.value.currentPage = 1
}

function handleSelectionChange(selection) {
  selectedVideos.value = selection
}

function viewVideo(video) {
  // 查看视频详情
  console.log('查看视频:', video.id)
  showInfo('查看视频功能待实现')
}

function editVideo(video) {
  // 编辑视频信息
  editingVideo.value = { ...video }
  editVisible.value = true
}

function handleCloseEdit() {
  editVisible.value = false
  editingVideo.value = null
}

function saveVideoChanges() {
  // 保存视频修改
  if (!editingVideo.value) return
  
  const index = videos.value.findIndex(v => v.id === editingVideo.value.id)
  if (index !== -1) {
    videos.value[index] = { ...editingVideo.value }
    showSuccess('视频信息已更新')
  }
  handleCloseEdit()
}

function toggleVideoStatus(video) {
  const newStatus = video.status === 'normal' ? 'offline' : 'normal'
  const action = newStatus === 'normal' ? '上架' : '下架'
  
  ElMessageBox.confirm(`确定要${action}此视频吗？`, '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = videos.value.findIndex(v => v.id === video.id)
    if (index !== -1) {
      videos.value[index].status = newStatus
      showSuccess(`视频已${action}`)
    }
  }).catch(() => {
    // 取消操作
  })
}

function batchOffline() {
  ElMessageBox.confirm(`确定要下架选中的 ${selectedVideos.value.length} 个视频吗？`, '批量下架', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedVideos.value.forEach(video => {
      const index = videos.value.findIndex(v => v.id === video.id)
      if (index !== -1) {
        videos.value[index].status = 'offline'
      }
    })
    selectedVideos.value = []
    showSuccess('批量下架成功')
  }).catch(() => {
    // 取消操作
  })
}

function batchOnline() {
  ElMessageBox.confirm(`确定要上架选中的 ${selectedVideos.value.length} 个视频吗？`, '批量上架', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedVideos.value.forEach(video => {
      const index = videos.value.findIndex(v => v.id === video.id)
      if (index !== -1) {
        videos.value[index].status = 'normal'
      }
    })
    selectedVideos.value = []
    showSuccess('批量上架成功')
  }).catch(() => {
    // 取消操作
  })
}

function batchDelete() {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedVideos.value.length} 个视频吗？此操作不可恢复！`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    // 批量删除视频
    selectedVideos.value.forEach(video => {
      const index = videos.value.findIndex(v => v.id === video.id)
      if (index !== -1) {
        videos.value.splice(index, 1)
      }
    })
    selectedVideos.value = []
    showSuccess('批量删除成功')
  }).catch(() => {
    // 取消操作
  })
}

function refreshList() {
  loadVideoData()
  showSuccess('列表已刷新')
}

function exportVideoData() {
  showSuccess('数据导出成功')
  console.log('导出视频数据')
}

function handleSizeChange(size) {
  pagination.value.pageSize = size
}

function handleCurrentChange(current) {
  pagination.value.currentPage = current
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
.video-management-container {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.content {
  padding: 20px;
  overflow-y: auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.video-count {
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

.category-select,
.status-select {
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

.edit-form {
  max-height: 60vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .search-input,
  .category-select,
  .status-select {
    width: 100%;
  }
  
  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .batch-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 5px;
  }
}
</style>