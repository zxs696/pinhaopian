<template>
  <div class="danmaku-management-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>弹幕管理</span>
          <div class="header-actions">
            <el-select v-model="danmakuStatus" placeholder="弹幕状态" style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="正常" value="normal" />
              <el-option label="已屏蔽" value="blocked" />
              <el-option label="已删除" value="deleted" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="danmakuList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="弹幕内容" show-overflow-tooltip />
        <el-table-column prop="videoTitle" label="所属视频" width="180" />
        <el-table-column prop="userName" label="发送用户" width="120" />
        <el-table-column prop="timePoint" label="弹幕时间点" width="120" />
        <el-table-column prop="color" label="颜色" width="80">
          <template #default="scope">
            <div class="color-preview" :style="{ backgroundColor: scope.row.color }"></div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="80">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发送时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button 
              v-if="scope.row.status === 'normal'" 
              size="small" 
              type="warning" 
              @click="handleBlock(scope.row)"
            >
              屏蔽
            </el-button>
            <el-button 
              v-if="scope.row.status === 'blocked'" 
              size="small" 
              type="success" 
              @click="handleUnblock(scope.row)"
            >
              解除
            </el-button>
            <el-button 
              v-if="scope.row.status !== 'deleted'" 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 弹幕详情对话框 -->
    <el-dialog v-model="dialogVisible" title="弹幕详情" width="600px">
      <div class="danmaku-detail" v-if="currentDanmaku">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="弹幕ID">{{ currentDanmaku.id }}</el-descriptions-item>
          <el-descriptions-item label="弹幕内容">{{ currentDanmaku.content }}</el-descriptions-item>
          <el-descriptions-item label="所属视频">{{ currentDanmaku.videoTitle }}</el-descriptions-item>
          <el-descriptions-item label="发送用户">{{ currentDanmaku.userName }}</el-descriptions-item>
          <el-descriptions-item label="弹幕时间点">{{ currentDanmaku.timePoint }}</el-descriptions-item>
          <el-descriptions-item label="颜色">
            <div class="color-preview" :style="{ backgroundColor: currentDanmaku.color }"></div>
            {{ currentDanmaku.color }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getTypeTagType(currentDanmaku.type)">
              {{ getTypeText(currentDanmaku.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发送时间">{{ currentDanmaku.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentDanmaku.status)">
              {{ getStatusText(currentDanmaku.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button 
            v-if="currentDanmaku && currentDanmaku.status === 'normal'" 
            type="warning" 
            @click="handleBlock(currentDanmaku)"
          >
            屏蔽
          </el-button>
          <el-button 
            v-if="currentDanmaku && currentDanmaku.status === 'blocked'" 
            type="success" 
            @click="handleUnblock(currentDanmaku)"
          >
            解除
          </el-button>
          <el-button 
            v-if="currentDanmaku && currentDanmaku.status !== 'deleted'" 
            type="danger" 
            @click="handleDelete(currentDanmaku)"
          >
            删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 数据
const danmakuList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const danmakuStatus = ref('')
const dialogVisible = ref(false)
const currentDanmaku = ref(null)

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    normal: 'success',
    blocked: 'warning',
    deleted: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    normal: '正常',
    blocked: '已屏蔽',
    deleted: '已删除'
  }
  return statusMap[status] || '未知'
}

// 获取弹幕类型标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    scroll: 'primary',
    top: 'success',
    bottom: 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取弹幕类型文本
const getTypeText = (type) => {
  const typeMap = {
    scroll: '滚动',
    top: '顶部',
    bottom: '底部'
  }
  return typeMap[type] || '未知'
}

// 获取弹幕列表
const fetchDanmakuList = async () => {
  try {
    // 模拟数据
    const mockData = {
      data: [
        { 
          id: 1, 
          content: '太精彩了！', 
          videoTitle: '搞笑视频合集', 
          userName: '用户A', 
          timePoint: '00:15:23',
          color: '#FFFFFF',
          type: 'scroll',
          createTime: '2023-01-01 12:00:00',
          status: 'normal'
        },
        { 
          id: 2, 
          content: '666666', 
          videoTitle: '科技产品评测', 
          userName: '用户B', 
          timePoint: '00:08:45',
          color: '#FF0000',
          type: 'scroll',
          createTime: '2023-01-02 14:30:00',
          status: 'normal'
        },
        { 
          id: 3, 
          content: '前排围观', 
          videoTitle: '美食制作教程', 
          userName: '用户C', 
          timePoint: '00:02:10',
          color: '#00FF00',
          type: 'top',
          createTime: '2023-01-03 16:45:00',
          status: 'blocked'
        },
        { 
          id: 4, 
          content: '学到了', 
          videoTitle: '旅行vlog', 
          userName: '用户D', 
          timePoint: '00:12:30',
          color: '#0000FF',
          type: 'bottom',
          createTime: '2023-01-04 09:20:00',
          status: 'normal'
        },
        { 
          id: 5, 
          content: '广告太多', 
          videoTitle: '音乐MV', 
          userName: '用户E', 
          timePoint: '00:03:15',
          color: '#FFFF00',
          type: 'scroll',
          createTime: '2023-01-05 11:15:00',
          status: 'deleted'
        }
      ],
      total: 5
    }
    
    // 根据弹幕状态过滤数据
    let filteredData = mockData.data
    if (danmakuStatus.value) {
      filteredData = mockData.data.filter(item => item.status === danmakuStatus.value)
    }
    
    danmakuList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取弹幕列表失败:', error)
    ElMessage.error('获取弹幕列表失败')
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchDanmakuList()
}

// 查看弹幕详情
const handleView = (row) => {
  currentDanmaku.value = row
  dialogVisible.value = true
}

// 屏蔽弹幕
const handleBlock = (row) => {
  ElMessageBox.confirm(`确定要屏蔽这条弹幕吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里应该调用屏蔽弹幕API
      ElMessage.success('屏蔽成功')
      fetchDanmakuList()
      dialogVisible.value = false
    } catch (error) {
      console.error('屏蔽弹幕失败:', error)
      ElMessage.error('屏蔽弹幕失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 解除屏蔽
const handleUnblock = (row) => {
  ElMessageBox.confirm(`确定要解除屏蔽这条弹幕吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    try {
      // 这里应该调用解除屏蔽API
      ElMessage.success('解除屏蔽成功')
      fetchDanmakuList()
      dialogVisible.value = false
    } catch (error) {
      console.error('解除屏蔽失败:', error)
      ElMessage.error('解除屏蔽失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 删除弹幕
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除这条弹幕吗？删除后不可恢复！`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    try {
      // 这里应该调用删除弹幕API
      ElMessage.success('删除成功')
      fetchDanmakuList()
      dialogVisible.value = false
    } catch (error) {
      console.error('删除弹幕失败:', error)
      ElMessage.error('删除弹幕失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchDanmakuList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchDanmakuList()
}

// 初始化
onMounted(() => {
  fetchDanmakuList()
})
</script>

<style scoped>
.danmaku-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.danmaku-detail {
  margin-bottom: 20px;
}

.color-preview {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  vertical-align: middle;
  margin-right: 5px;
}
</style>