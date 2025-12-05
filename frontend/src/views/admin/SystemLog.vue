<template>
  <div class="system-log-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统日志</span>
          <div class="header-actions">
            <el-select v-model="logLevel" placeholder="日志级别" style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="信息" value="info" />
              <el-option label="警告" value="warning" />
              <el-option label="错误" value="error" />
              <el-option label="调试" value="debug" />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="margin-right: 10px;"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button type="danger" @click="handleClearLogs">清空日志</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="logList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.level)">
              {{ getLevelText(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="日志信息" show-overflow-tooltip />
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="ip" label="IP地址" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button 
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
    
    <!-- 日志详情对话框 -->
    <el-dialog v-model="dialogVisible" title="日志详情" width="600px">
      <div class="log-detail" v-if="currentLog">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="日志ID">{{ currentLog.id }}</el-descriptions-item>
          <el-descriptions-item label="日志级别">
            <el-tag :type="getLevelType(currentLog.level)">
              {{ getLevelText(currentLog.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="日志信息">{{ currentLog.message }}</el-descriptions-item>
          <el-descriptions-item label="模块">{{ currentLog.module }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ currentLog.user }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
          <el-descriptions-item label="用户代理">{{ currentLog.userAgent }}</el-descriptions-item>
          <el-descriptions-item label="请求URL">{{ currentLog.url }}</el-descriptions-item>
          <el-descriptions-item label="请求方法">{{ currentLog.method }}</el-descriptions-item>
          <el-descriptions-item label="请求参数">
            <pre>{{ currentLog.params }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="堆栈信息" v-if="currentLog.stack">
            <pre>{{ currentLog.stack }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentLog.createTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button 
            v-if="currentLog" 
            type="danger" 
            @click="handleDelete(currentLog)"
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
const logList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const logLevel = ref('')
const dateRange = ref([])
const dialogVisible = ref(false)
const currentLog = ref(null)

// 获取日志级别类型
const getLevelType = (level) => {
  const levelMap = {
    info: 'primary',
    warning: 'warning',
    error: 'danger',
    debug: 'info'
  }
  return levelMap[level] || 'info'
}

// 获取日志级别文本
const getLevelText = (level) => {
  const levelMap = {
    info: '信息',
    warning: '警告',
    error: '错误',
    debug: '调试'
  }
  return levelMap[level] || '未知'
}

// 获取日志列表
const fetchLogList = async () => {
  try {
    // 模拟数据
    const mockData = {
      data: [
        { 
          id: 1, 
          level: 'info', 
          message: '用户登录成功', 
          module: '用户认证',
          user: 'admin',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          url: '/api/auth/login',
          method: 'POST',
          params: '{"username":"admin"}',
          stack: '',
          createTime: '2023-01-05 14:30:00'
        },
        { 
          id: 2, 
          level: 'warning', 
          message: '用户尝试访问未授权页面', 
          module: '权限控制',
          user: 'user1',
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          url: '/admin/system',
          method: 'GET',
          params: '{}',
          stack: '',
          createTime: '2023-01-05 14:25:00'
        },
        { 
          id: 3, 
          level: 'error', 
          message: '数据库连接失败', 
          module: '数据库',
          user: 'system',
          ip: '127.0.0.1',
          userAgent: 'System',
          url: '',
          method: '',
          params: '{}',
          stack: 'Error: Database connection failed\n    at Database.connect (/app/src/db.js:45:15)\n    at async main (/app/src/index.js:12:5)',
          createTime: '2023-01-05 14:20:00'
        },
        { 
          id: 4, 
          level: 'debug', 
          message: 'API请求处理完成', 
          module: 'API',
          user: 'user2',
          ip: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          url: '/api/videos',
          method: 'GET',
          params: '{"page":1,"limit":10}',
          stack: '',
          createTime: '2023-01-05 14:15:00'
        },
        { 
          id: 5, 
          level: 'info', 
          message: '文件上传成功', 
          module: '文件管理',
          user: 'user3',
          ip: '192.168.1.103',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          url: '/api/upload',
          method: 'POST',
          params: '{"filename":"video.mp4","size":1024000}',
          stack: '',
          createTime: '2023-01-05 14:10:00'
        }
      ],
      total: 5
    }
    
    // 根据日志级别过滤数据
    let filteredData = mockData.data
    if (logLevel.value) {
      filteredData = mockData.data.filter(item => item.level === logLevel.value)
    }
    
    // 根据日期范围过滤数据
    if (dateRange.value && dateRange.value.length === 2) {
      const startDate = new Date(dateRange.value[0]).getTime()
      const endDate = new Date(dateRange.value[1]).getTime() + 24 * 60 * 60 * 1000 // 包含结束日期
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.createTime).getTime()
        return itemDate >= startDate && itemDate <= endDate
      })
    }
    
    logList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取日志列表失败:', error)
    ElMessage.error('获取日志列表失败')
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchLogList()
}

// 查看日志详情
const handleView = (row) => {
  currentLog.value = row
  dialogVisible.value = true
}

// 删除日志
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除这条日志吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里应该调用删除日志API
      ElMessage.success('删除成功')
      fetchLogList()
      dialogVisible.value = false
    } catch (error) {
      console.error('删除日志失败:', error)
      ElMessage.error('删除日志失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 清空日志
const handleClearLogs = () => {
  ElMessageBox.confirm(`确定要清空所有日志吗？此操作不可恢复！`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    try {
      // 这里应该调用清空日志API
      ElMessage.success('日志清空成功')
      fetchLogList()
    } catch (error) {
      console.error('清空日志失败:', error)
      ElMessage.error('清空日志失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchLogList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchLogList()
}

// 初始化
onMounted(() => {
  fetchLogList()
})
</script>

<style scoped>
.system-log-container {
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

.log-detail {
  margin-bottom: 20px;
}

.log-detail pre {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
}
</style>