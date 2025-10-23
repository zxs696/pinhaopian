<template>
  <div class="video-list-container">
    <el-container class="main-container">
      <el-main>
        <div class="page-header">
          <h1>视频列表</h1>
        </div>
        
        <div class="filter-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-input v-model="searchKeyword" placeholder="搜索视频" prefix-icon="Search">
                <template #append>
                  <el-button type="primary" @click="searchVideos">搜索</el-button>
                </template>
              </el-input>
            </el-col>
            <el-col :span="6">
              <el-select v-model="categoryFilter" placeholder="选择分类">
                <el-option label="全部" value="" />
                <el-option label="电影" value="movie" />
                <el-option label="电视剧" value="tv" />
                <el-option label="综艺" value="variety" />
              </el-select>
            </el-col>
          </el-row>
        </div>
        
        <div class="video-grid">
          <el-skeleton :count="6" animated>
            <template #template>
              <div class="video-card-skeleton">
                <el-skeleton-item variant="image" style="height: 180px;" />
                <el-skeleton-item variant="p" style="margin-top: 16px;" />
                <el-skeleton-item variant="text" style="width: 60%;" />
              </div>
            </template>
          </el-skeleton>
        </div>
        
        <div class="pagination-section">
          <el-pagination
            layout="prev, pager, next"
            :total="100"
            :page-size="12"
            @current-change="handlePageChange"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
// 视频列表页逻辑
import { ref, onMounted } from 'vue'

const searchKeyword = ref('')
const categoryFilter = ref('')
const loading = ref(false)

onMounted(() => {
  // 加载视频列表数据
  loadVideoList()
})

function searchVideos() {
  // 搜索视频逻辑
  console.log('搜索关键词:', searchKeyword.value)
  loadVideoList()
}

function loadVideoList() {
  // 加载视频列表逻辑
  loading.value = true
  // 模拟加载延迟
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

function handlePageChange(page) {
  // 分页变化处理
  console.log('当前页码:', page)
}
</script>

<style scoped>
.video-list-container {
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.filter-section {
  margin-bottom: 32px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.video-card-skeleton {
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 16px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
  
  .video-card-skeleton {
    padding: 12px;
  }
  
  .video-card-skeleton .el-skeleton-item {
    height: 120px !important;
  }
}
</style>