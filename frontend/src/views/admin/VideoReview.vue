<template>
  <div class="video-review-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>视频审核管理</span>
          <div class="header-actions">
            <el-select v-model="reviewStatus" placeholder="审核状态" style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="videoList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="视频封面" width="120">
          <template #default="scope">
            <el-image
              style="width: 100px; height: 60px"
              :src="scope.row.cover"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="视频标题" />
        <el-table-column prop="uploader" label="上传者" width="120" />
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column prop="status" label="审核状态" width="100">
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
              v-if="scope.row.status === 'pending'" 
              size="small" 
              type="success" 
              @click="handleApprove(scope.row)"
            >
              通过
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending'" 
              size="small" 
              type="danger" 
              @click="handleReject(scope.row)"
            >
              拒绝
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
    
    <!-- 视频详情对话框 -->
    <el-dialog v-model="dialogVisible" title="视频详情" width="800px">
      <div class="video-detail" v-if="currentVideo">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="video-cover">
              <el-image
                style="width: 100%; height: 200px"
                :src="currentVideo.cover"
                fit="cover"
              />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="video-info">
              <p><strong>标题:</strong> {{ currentVideo.title }}</p>
              <p><strong>上传者:</strong> {{ currentVideo.uploader }}</p>
              <p><strong>上传时间:</strong> {{ currentVideo.uploadTime }}</p>
              <p><strong>视频时长:</strong> {{ currentVideo.duration }}</p>
              <p><strong>播放量:</strong> {{ currentVideo.playCount }}</p>
              <p><strong>点赞数:</strong> {{ currentVideo.likeCount }}</p>
              <p><strong>描述:</strong> {{ currentVideo.description }}</p>
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button 
            v-if="currentVideo && currentVideo.status === 'pending'" 
            type="success" 
            @click="handleApprove(currentVideo)"
          >
            通过
          </el-button>
          <el-button 
            v-if="currentVideo && currentVideo.status === 'pending'" 
            type="danger" 
            @click="handleReject(currentVideo)"
          >
            拒绝
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="500px">
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectFormRef" label-width="80px">
        <el-form-item label="拒绝原因" prop="reason">
          <el-input v-model="rejectForm.reason" type="textarea" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReject">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 数据
const videoList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const reviewStatus = ref('')
const dialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentVideo = ref(null)
const rejectFormRef = ref()

// 拒绝表单数据
const rejectForm = reactive({
  id: null,
  reason: ''
})

// 拒绝表单验证规则
const rejectRules = {
  reason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 5, max: 200, message: '长度在 5 到 200 个字符', trigger: 'blur' }
  ]
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || '未知'
}

// 获取视频列表
const fetchVideoList = async () => {
  try {
    // 模拟数据
    const mockData = {
      data: [
        { 
          id: 1, 
          title: '搞笑视频合集', 
          cover: 'https://picsum.photos/seed/video1/300/200.jpg',
          uploader: '用户A', 
          uploadTime: '2023-01-01 12:00:00',
          duration: '05:23',
          playCount: 1234,
          likeCount: 56,
          description: '这是一个搞笑视频合集',
          status: 'pending' 
        },
        { 
          id: 2, 
          title: '美食制作教程', 
          cover: 'https://picsum.photos/seed/video2/300/200.jpg',
          uploader: '用户B', 
          uploadTime: '2023-01-02 12:00:00',
          duration: '10:15',
          playCount: 2345,
          likeCount: 78,
          description: '教你如何制作美食',
          status: 'approved' 
        },
        { 
          id: 3, 
          title: '旅行vlog', 
          cover: 'https://picsum.photos/seed/video3/300/200.jpg',
          uploader: '用户C', 
          uploadTime: '2023-01-03 12:00:00',
          duration: '15:42',
          playCount: 3456,
          likeCount: 90,
          description: '记录旅行中的美好瞬间',
          status: 'rejected' 
        },
        { 
          id: 4, 
          title: '科技产品评测', 
          cover: 'https://picsum.photos/seed/video4/300/200.jpg',
          uploader: '用户D', 
          uploadTime: '2023-01-04 12:00:00',
          duration: '08:30',
          playCount: 4567,
          likeCount: 123,
          description: '最新科技产品评测',
          status: 'pending' 
        },
        { 
          id: 5, 
          title: '音乐MV', 
          cover: 'https://picsum.photos/seed/video5/300/200.jpg',
          uploader: '用户E', 
          uploadTime: '2023-01-05 12:00:00',
          duration: '04:18',
          playCount: 5678,
          likeCount: 234,
          description: '最新音乐MV',
          status: 'approved' 
        }
      ],
      total: 5
    }
    
    // 根据审核状态过滤数据
    let filteredData = mockData.data
    if (reviewStatus.value) {
      filteredData = mockData.data.filter(item => item.status === reviewStatus.value)
    }
    
    videoList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取视频列表失败:', error)
    ElMessage.error('获取视频列表失败')
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchVideoList()
}

// 查看视频详情
const handleView = (row) => {
  currentVideo.value = row
  dialogVisible.value = true
}

// 通过审核
const handleApprove = (row) => {
  ElMessageBox.confirm(`确定要通过视频 "${row.title}" 的审核吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    try {
      // 这里应该调用审核通过API
      ElMessage.success('审核通过成功')
      fetchVideoList()
      dialogVisible.value = false
    } catch (error) {
      console.error('审核通过失败:', error)
      ElMessage.error('审核通过失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 拒绝审核
const handleReject = (row) => {
  rejectForm.id = row.id
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

// 提交拒绝
const submitReject = async () => {
  if (!rejectFormRef.value) return
  
  await rejectFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 这里应该调用审核拒绝API
        ElMessage.success('审核拒绝成功')
        rejectDialogVisible.value = false
        dialogVisible.value = false
        fetchVideoList()
      } catch (error) {
        console.error('审核拒绝失败:', error)
        ElMessage.error('审核拒绝失败')
      }
    }
  })
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchVideoList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchVideoList()
}

// 初始化
onMounted(() => {
  fetchVideoList()
})
</script>

<style scoped>
.video-review-container {
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

.video-detail {
  margin-bottom: 20px;
}

.video-cover {
  margin-bottom: 15px;
}

.video-info p {
  margin-bottom: 10px;
}
</style>