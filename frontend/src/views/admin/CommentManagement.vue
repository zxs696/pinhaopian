<template>
  <div class="comment-management-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>评论管理</span>
          <div class="header-actions">
            <el-select v-model="commentStatus" placeholder="评论状态" style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="正常" value="normal" />
              <el-option label="已隐藏" value="hidden" />
              <el-option label="已删除" value="deleted" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="commentList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
        <el-table-column prop="videoTitle" label="所属视频" width="180" />
        <el-table-column prop="userName" label="评论用户" width="120" />
        <el-table-column prop="createTime" label="评论时间" width="180" />
        <el-table-column prop="likeCount" label="点赞数" width="80" />
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
              @click="handleHide(scope.row)"
            >
              隐藏
            </el-button>
            <el-button 
              v-if="scope.row.status === 'hidden'" 
              size="small" 
              type="success" 
              @click="handleShow(scope.row)"
            >
              显示
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
    
    <!-- 评论详情对话框 -->
    <el-dialog v-model="dialogVisible" title="评论详情" width="600px">
      <div class="comment-detail" v-if="currentComment">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="评论ID">{{ currentComment.id }}</el-descriptions-item>
          <el-descriptions-item label="评论内容">{{ currentComment.content }}</el-descriptions-item>
          <el-descriptions-item label="所属视频">{{ currentComment.videoTitle }}</el-descriptions-item>
          <el-descriptions-item label="评论用户">{{ currentComment.userName }}</el-descriptions-item>
          <el-descriptions-item label="评论时间">{{ currentComment.createTime }}</el-descriptions-item>
          <el-descriptions-item label="点赞数">{{ currentComment.likeCount }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentComment.status)">
              {{ getStatusText(currentComment.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="reply-list" v-if="currentComment.replies && currentComment.replies.length > 0">
          <h4>回复列表</h4>
          <div v-for="reply in currentComment.replies" :key="reply.id" class="reply-item">
            <div class="reply-content">{{ reply.content }}</div>
            <div class="reply-info">
              <span>{{ reply.userName }}</span>
              <span>{{ reply.createTime }}</span>
              <span>点赞: {{ reply.likeCount }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button 
            v-if="currentComment && currentComment.status === 'normal'" 
            type="warning" 
            @click="handleHide(currentComment)"
          >
            隐藏
          </el-button>
          <el-button 
            v-if="currentComment && currentComment.status === 'hidden'" 
            type="success" 
            @click="handleShow(currentComment)"
          >
            显示
          </el-button>
          <el-button 
            v-if="currentComment && currentComment.status !== 'deleted'" 
            type="danger" 
            @click="handleDelete(currentComment)"
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
const commentList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const commentStatus = ref('')
const dialogVisible = ref(false)
const currentComment = ref(null)

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    normal: 'success',
    hidden: 'warning',
    deleted: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    normal: '正常',
    hidden: '已隐藏',
    deleted: '已删除'
  }
  return statusMap[status] || '未知'
}

// 获取评论列表
const fetchCommentList = async () => {
  try {
    // 模拟数据
    const mockData = {
      data: [
        { 
          id: 1, 
          content: '这个视频太有趣了！', 
          videoTitle: '搞笑视频合集', 
          userName: '用户A', 
          createTime: '2023-01-01 12:00:00',
          likeCount: 23,
          status: 'normal',
          replies: [
            { id: 11, content: '我也觉得很有趣', userName: '用户B', createTime: '2023-01-01 12:05:00', likeCount: 5 },
            { id: 12, content: '确实不错', userName: '用户C', createTime: '2023-01-01 12:10:00', likeCount: 3 }
          ]
        },
        { 
          id: 2, 
          content: '学到了很多知识', 
          videoTitle: '科技产品评测', 
          userName: '用户B', 
          createTime: '2023-01-02 14:30:00',
          likeCount: 15,
          status: 'normal',
          replies: []
        },
        { 
          id: 3, 
          content: '这个方法不太实用', 
          videoTitle: '美食制作教程', 
          userName: '用户C', 
          createTime: '2023-01-03 16:45:00',
          likeCount: 8,
          status: 'hidden',
          replies: []
        },
        { 
          id: 4, 
          content: '内容很精彩，期待更多', 
          videoTitle: '旅行vlog', 
          userName: '用户D', 
          createTime: '2023-01-04 09:20:00',
          likeCount: 32,
          status: 'normal',
          replies: [
            { id: 41, content: '同期待', userName: '用户E', createTime: '2023-01-04 09:25:00', likeCount: 7 }
          ]
        },
        { 
          id: 5, 
          content: '广告太多了', 
          videoTitle: '音乐MV', 
          userName: '用户E', 
          createTime: '2023-01-05 11:15:00',
          likeCount: 2,
          status: 'deleted',
          replies: []
        }
      ],
      total: 5
    }
    
    // 根据评论状态过滤数据
    let filteredData = mockData.data
    if (commentStatus.value) {
      filteredData = mockData.data.filter(item => item.status === commentStatus.value)
    }
    
    commentList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchCommentList()
}

// 查看评论详情
const handleView = (row) => {
  currentComment.value = row
  dialogVisible.value = true
}

// 隐藏评论
const handleHide = (row) => {
  ElMessageBox.confirm(`确定要隐藏这条评论吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里应该调用隐藏评论API
      ElMessage.success('隐藏成功')
      fetchCommentList()
      dialogVisible.value = false
    } catch (error) {
      console.error('隐藏评论失败:', error)
      ElMessage.error('隐藏评论失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 显示评论
const handleShow = (row) => {
  ElMessageBox.confirm(`确定要显示这条评论吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    try {
      // 这里应该调用显示评论API
      ElMessage.success('显示成功')
      fetchCommentList()
      dialogVisible.value = false
    } catch (error) {
      console.error('显示评论失败:', error)
      ElMessage.error('显示评论失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 删除评论
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除这条评论吗？删除后不可恢复！`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    try {
      // 这里应该调用删除评论API
      ElMessage.success('删除成功')
      fetchCommentList()
      dialogVisible.value = false
    } catch (error) {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchCommentList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchCommentList()
}

// 初始化
onMounted(() => {
  fetchCommentList()
})
</script>

<style scoped>
.comment-management-container {
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

.comment-detail {
  margin-bottom: 20px;
}

.reply-list {
  margin-top: 20px;
}

.reply-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.reply-content {
  margin-bottom: 5px;
}

.reply-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
</style>