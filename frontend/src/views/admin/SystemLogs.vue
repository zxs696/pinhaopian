<template>
  <div class="system-logs-container">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>系统日志</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-actions">
        <el-button type="primary" @click="handleExportLogs">
                <el-icon><Download /></el-icon>
                导出日志
              </el-button>
              <el-button type="danger" @click="handleClearLogs" :disabled="logs.length === 0">
                <el-icon><Delete /></el-icon>
                清空日志
              </el-button>
            </div>
          <el-card>
            <template #header>
              <div class="card-header">
                <span>系统日志</span>
                <el-tag type="info">操作记录与系统行为追踪</el-tag>
              </div>
            </template>
            
            <!-- 搜索过滤区域 -->
            <div class="search-filter">
              <el-row :gutter="12">
                <el-col :span="6">
                  <el-input
                    v-model="searchKeyword"
                    placeholder="搜索操作内容或用户名"
                    prefix-icon="Search"
                  />
                </el-col>
                <el-col :span="4">
                  <el-select
                    v-model="logType"
                    placeholder="日志类型"
                    clearable
                  >
                    <el-option label="全部" value="" />
                    <el-option label="登录/登出" value="auth" />
                    <el-option label="视频管理" value="video" />
                    <el-option label="用户管理" value="user" />
                    <el-option label="系统配置" value="system" />
                    <el-option label="权限变更" value="permission" />
                    <el-option label="异常错误" value="error" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-select
                    v-model="logLevel"
                    placeholder="日志级别"
                    clearable
                  >
                    <el-option label="全部" value="" />
                    <el-option label="信息" value="info" />
                    <el-option label="警告" value="warning" />
                    <el-option label="错误" value="error" />
                    <el-option label="致命" value="fatal" />
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                  />
                </el-col>
                <el-col :span="5">
                  <div class="filter-buttons">
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <!-- 日志统计概览 -->
            <el-row :gutter="20" class="stats-row">
              <el-col :span="6">
                <el-card shadow="hover" class="stats-card">
                  <div class="stats-content">
                    <div class="stats-number">{{ totalLogs }}</div>
                    <div class="stats-label">今日总日志</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover" class="stats-card">
                  <div class="stats-content">
                    <div class="stats-number">{{ errorLogs }}</div>
                    <div class="stats-label">错误日志</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover" class="stats-card">
                  <div class="stats-content">
                    <div class="stats-number">{{ warningLogs }}</div>
                    <div class="stats-label">警告日志</div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover" class="stats-card">
                  <div class="stats-content">
                    <div class="stats-number">{{ loginLogs }}</div>
                    <div class="stats-label">登录记录</div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            
            <!-- 日志图表 -->
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>日志趋势分析</span>
                  <el-select
                    v-model="chartTimeRange"
                    placeholder="时间范围"
                    size="small"
                  >
                    <el-option label="近7天" value="7" />
                    <el-option label="近30天" value="30" />
                    <el-option label="近90天" value="90" />
                  </el-select>
                </div>
              </template>
              <div class="chart-container">
                <!-- 这里可以放置图表，暂时用占位符 -->
                <div class="chart-placeholder">
                  <el-empty description="图表数据展示区域" />
                </div>
              </div>
            </el-card>
            
            <!-- 日志列表 -->
            <div class="logs-list">
              <el-table
                v-loading="loading"
                :data="paginatedLogs"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                @row-click="handleRowClick"
                row-class-name="log-row"
              >
                <el-table-column
                  type="selection"
                  width="55"
                />
                <el-table-column prop="id" label="日志ID" width="100" />
                <el-table-column prop="level" label="级别" width="80">
                  <template #default="scope">
                    <el-tag 
                      :type="getLevelType(scope.row.level)"
                      size="small"
                    >
                      {{ getLevelText(scope.row.level) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="类型" width="120">
                  <template #default="scope">
                    <el-tag 
                      :type="getTypeType(scope.row.type)"
                      size="small"
                    >
                      {{ getTypeText(scope.row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="username" label="操作人" width="120" />
                <el-table-column prop="action" label="操作内容" min-width="300">
                  <template #default="scope">
                    <div class="action-content" :title="scope.row.action">
                      {{ scope.row.action }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="ip" label="IP地址" width="140" />
                <el-table-column prop="userAgent" label="浏览器" min-width="200">
                  <template #default="scope">
                    <div class="user-agent" :title="scope.row.userAgent">
                      {{ getShortUserAgent(scope.row.userAgent) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="操作时间" width="180" sortable>
                  <template #default="scope">
                    {{ formatDateTime(scope.row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="scope">
                    <el-button type="primary" size="small" @click="handleViewLog(scope.row)">
                      <el-icon><View /></el-icon>
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            
            <!-- 分页 -->
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredLogs.length"
              class="pagination"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </el-card>
    
    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="logDetailVisible"
      title="日志详情"
      width="800px"
      :before-close="handleCloseLogDetail"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="日志ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="日志级别">
          <el-tag :type="getLevelType(currentLog.level)">
            {{ getLevelText(currentLog.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="日志类型">
          <el-tag :type="getTypeType(currentLog.type)">
            {{ getTypeText(currentLog.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ formatDateTime(currentLog.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="操作人" :span="2">{{ currentLog.username || '系统' }}</el-descriptions-item>
        <el-descriptions-item label="IP地址" :span="2">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作内容" :span="2">
          <div class="detail-action">{{ currentLog.action }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="用户代理" :span="2">
          <div class="detail-useragent">{{ currentLog.userAgent }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="请求URL" :span="2">{{ currentLog.url }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">{{ currentLog.method }}</el-descriptions-item>
        <el-descriptions-item label="响应状态">{{ currentLog.status }}</el-descriptions-item>
        <el-descriptions-item label="执行时间(ms)">{{ currentLog.executionTime }}ms</el-descriptions-item>
        <el-descriptions-item label="设备信息">{{ getDeviceInfo(currentLog.userAgent) }}</el-descriptions-item>
        <el-descriptions-item v-if="currentLog.params" label="请求参数" :span="2">
          <el-code :code="JSON.stringify(currentLog.params, null, 2)" />
        </el-descriptions-item>
        <el-descriptions-item v-if="currentLog.errorMessage" label="错误信息" :span="2">
          <div class="error-message">{{ currentLog.errorMessage }}</div>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentLog.errorStack" label="错误堆栈" :span="2">
          <el-scrollbar height="200px">
            <pre class="error-stack">{{ currentLog.errorStack }}</pre>
          </el-scrollbar>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="handleCloseLogDetail">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 清空日志确认对话框 -->
    <el-dialog
      v-model="clearLogDialogVisible"
      title="确认清空"
      width="400px"
      :before-close="handleCloseClearLogDialog"
    >
      <div class="clear-log-content">
        <el-icon size="48" class="warning-icon"><WarningFilled /></el-icon>
        <p class="warning-text">确定要清空所有日志记录吗？</p>
        <p class="warning-subtext">此操作不可撤销，清空后将无法恢复。</p>
        
        <el-date-picker
          v-model="clearLogDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="date-picker"
        />
        
        <el-select
          v-model="clearLogType"
          placeholder="选择日志类型"
          clearable
          class="log-type-select"
        >
          <el-option label="全部类型" value="" />
          <el-option label="登录/登出" value="auth" />
          <el-option label="视频管理" value="video" />
          <el-option label="用户管理" value="user" />
          <el-option label="系统配置" value="system" />
          <el-option label="权限变更" value="permission" />
          <el-option label="异常错误" value="error" />
        </el-select>
      </div>
      <template #footer>
        <el-button @click="handleCloseClearLogDialog">取消</el-button>
        <el-button type="danger" @click="confirmClearLogs">确认清空</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  Download,
  Delete,
  Search,
  Bell,
  AlertCircleFilled,
  InfoFilled
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccess } from '../../utils/message.js'

const loading = ref(false)
const searchKeyword = ref('')
const logType = ref('')
const logLevel = ref('')
const dateRange = ref([])
const chartTimeRange = ref('7')
const selectedLogs = ref([])
const logDetailVisible = ref(false)
const clearLogDialogVisible = ref(false)
const clearLogDateRange = ref([])
const clearLogType = ref('')
const currentLog = reactive({})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20
})

// 模拟日志数据
const logs = ref([
  // 登录相关日志
  {
    id: '1',
    level: 'info',
    type: 'auth',
    username: 'admin',
    action: '用户登录成功',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    url: '/api/auth/login',
    method: 'POST',
    status: 200,
    executionTime: 120,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
    params: { username: 'admin' }
  },
  {
    id: '2',
    level: 'warning',
    type: 'auth',
    username: 'unknown',
    action: '密码错误尝试登录',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/115.0',
    url: '/api/auth/login',
    method: 'POST',
    status: 401,
    executionTime: 95,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3小时前
    params: { username: 'admin' },
    errorMessage: '密码错误'
  },
  {
    id: '3',
    level: 'info',
    type: 'auth',
    username: 'editor',
    action: '用户登出',
    ip: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    url: '/api/auth/logout',
    method: 'POST',
    status: 200,
    executionTime: 50,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4小时前
    params: {}
  },
  // 视频管理日志
  {
    id: '4',
    level: 'info',
    type: 'video',
    username: 'editor',
    action: '上传新视频《前端开发实战教程》',
    ip: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    url: '/api/videos',
    method: 'POST',
    status: 200,
    executionTime: 1500,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5小时前
    params: { title: '前端开发实战教程', categoryId: '1' }
  },
  {
    id: '5',
    level: 'info',
    type: 'video',
    username: 'reviewer',
    action: '审核通过视频《前端开发实战教程》',
    ip: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    url: '/api/videos/1/review',
    method: 'PUT',
    status: 200,
    executionTime: 200,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6小时前
    params: { videoId: '1', status: 'approved', comment: '内容健康，符合要求' }
  },
  {
    id: '6',
    level: 'warning',
    type: 'video',
    username: 'reviewer',
    action: '审核拒绝视频《违规内容示例》',
    ip: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    url: '/api/videos/2/review',
    method: 'PUT',
    status: 200,
    executionTime: 150,
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7小时前
    params: { videoId: '2', status: 'rejected', comment: '包含违规内容' }
  },
  {
    id: '7',
    level: 'info',
    type: 'video',
    username: 'admin',
    action: '删除视频《违规内容示例》',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    url: '/api/videos/2',
    method: 'DELETE',
    status: 200,
    executionTime: 80,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8小时前
    params: { videoId: '2' }
  },
  // 用户管理日志
  {
    id: '8',
    level: 'info',
    type: 'user',
    username: 'admin',
    action: '创建新用户 user123',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    url: '/api/users',
    method: 'POST',
    status: 200,
    executionTime: 120,
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), // 9小时前
    params: { username: 'user123', nickname: '新用户', roleId: '5' }
  },
  {
    id: '9',
    level: 'info',
    type: 'user',
    username: 'admin',
    action: '更新用户信息 user123',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    url: '/api/users/123',
    method: 'PUT',
    status: 200,
    executionTime: 100,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10小时前
    params: { nickname: '更新后的昵称', email: 'user123@example.com' }
  },
  // 系统配置日志
  {
    id: '10',
    level: 'info',
    type: 'system',
    username: 'admin',
    action: '修改系统配置：启用内容审核功能',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    url: '/api/system/config',
    method: 'PUT',
    status: 200,
    executionTime: 80,
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(), // 11小时前
    params: { contentReviewEnabled: true }
  },
  // 权限变更日志
  {
    id: '11',
    level: 'info',
    type: 'permission',
    username: 'admin',
    action: '更新角色权限：编辑 - 添加视频审核权限',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    url: '/api/roles/3/permissions',
    method: 'PUT',
    status: 200,
    executionTime: 150,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12小时前
    params: { roleId: '3', permissions: ['video:review'] }
  },
  // 错误日志示例
  {
    id: '12',
    level: 'error',
    type: 'error',
    username: 'editor',
    action: '上传视频失败',
    ip: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    url: '/api/videos',
    method: 'POST',
    status: 500,
    executionTime: 2500,
    createdAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(), // 13小时前
    params: { title: '新视频上传测试' },
    errorMessage: '文件上传失败：存储空间已满',
    errorStack: 'Error: 文件上传失败：存储空间已满\n    at VideoUploadService.uploadFile (/app/services/video-upload.service.js:45:15)\n    at async VideoController.create (/app/controllers/video.controller.js:67:20)'
  },
  {
    id: '13',
    level: 'fatal',
    type: 'error',
    username: 'system',
    action: '数据库连接失败',
    ip: '127.0.0.1',
    userAgent: 'System',
    url: '/api/system/health',
    method: 'GET',
    status: 503,
    executionTime: 10,
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14小时前
    errorMessage: '无法连接到数据库服务器',
    errorStack: 'DatabaseConnectionError: 无法连接到数据库服务器\n    at DatabaseService.connect (/app/services/database.service.js:23:19)\n    at async Server.initialize (/app/server.js:56:12)'
  },
  // 更多日志...
  {
    id: '14',
    level: 'info',
    type: 'auth',
    username: 'user123',
    action: '首次登录成功',
    ip: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    url: '/api/auth/login',
    method: 'POST',
    status: 200,
    executionTime: 180,
    createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(), // 15小时前
    params: { username: 'user123' }
  },
  {
    id: '15',
    level: 'info',
    type: 'video',
    username: 'user123',
    action: '观看视频《前端开发实战教程》',
    ip: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    url: '/api/videos/1/play',
    method: 'GET',
    status: 200,
    executionTime: 50,
    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16小时前
    params: { videoId: '1' }
  },
  // 生成更多模拟数据...
  ...Array.from({ length: 50 }, (_, i) => {
    const id = i + 16
    const levels = ['info', 'warning', 'error']
    const types = ['video', 'user', 'system', 'auth']
    const actions = [
      '查看视频列表',
      '搜索视频',
      '更新用户资料',
      '重置密码',
      '添加分类',
      '修改分类',
      '删除分类',
      '查看统计数据',
      '导出数据报表',
      '调整系统参数'
    ]
    const usernames = ['admin', 'editor', 'reviewer', 'user123', 'user2', 'system']
    const ips = ['192.168.1.100', '192.168.1.101', '192.168.1.102', '192.168.1.103', '192.168.1.104']
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/115.0'
    ]
    
    return {
      id: String(id),
      level: levels[Math.floor(Math.random() * levels.length)],
      type: types[Math.floor(Math.random() * types.length)],
      username: usernames[Math.floor(Math.random() * usernames.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      ip: ips[Math.floor(Math.random() * ips.length)],
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      url: `/api/${types[Math.floor(Math.random() * types.length)]}/action`,
      method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
      status: [200, 201, 400, 401, 403, 404, 500][Math.floor(Math.random() * 7)],
      executionTime: Math.floor(Math.random() * 500),
      createdAt: new Date(Date.now() - (17 + i) * 60 * 60 * 1000).toISOString(),
      params: { id: Math.floor(Math.random() * 100) }
    }
  })
])

// 计算属性：过滤后的日志列表
const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    // 关键词搜索
    if (searchKeyword.value && 
        !log.action.toLowerCase().includes(searchKeyword.value.toLowerCase()) && 
        !log.username.toLowerCase().includes(searchKeyword.value.toLowerCase())) {
      return false
    }
    
    // 日志类型过滤
    if (logType.value && log.type !== logType.value) {
      return false
    }
    
    // 日志级别过滤
    if (logLevel.value && log.level !== logLevel.value) {
      return false
    }
    
    // 时间范围过滤
    if (dateRange.value && dateRange.value.length === 2) {
      const logDate = new Date(log.createdAt).toISOString().split('T')[0]
      const startDate = dateRange.value[0]
      const endDate = dateRange.value[1]
      if (logDate < startDate || logDate > endDate) {
        return false
      }
    }
    
    return true
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// 计算属性：分页后的日志列表
const paginatedLogs = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredLogs.value.slice(start, end)
})

// 计算属性：统计信息
const totalLogs = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return logs.value.filter(log => log.createdAt.startsWith(today)).length
})

const errorLogs = computed(() => {
  return filteredLogs.value.filter(log => ['error', 'fatal'].includes(log.level)).length
})

const warningLogs = computed(() => {
  return filteredLogs.value.filter(log => log.level === 'warning').length
})

const loginLogs = computed(() => {
  return filteredLogs.value.filter(log => log.type === 'auth' && 
    (log.action.includes('登录') || log.action.includes('login'))).length
})

// 方法：获取日志级别对应的标签类型
function getLevelType(level) {
  switch (level) {
    case 'info': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'danger'
    case 'fatal': return 'danger'
    default: return 'info'
  }
}

// 方法：获取日志级别文本
function getLevelText(level) {
  switch (level) {
    case 'info': return '信息'
    case 'warning': return '警告'
    case 'error': return '错误'
    case 'fatal': return '致命'
    default: return level
  }
}

// 方法：获取日志类型对应的标签类型
function getTypeType(type) {
  switch (type) {
    case 'auth': return 'primary'
    case 'video': return 'info'
    case 'user': return 'success'
    case 'system': return 'warning'
    case 'permission': return 'danger'
    case 'error': return 'danger'
    default: return 'info'
  }
}

// 方法：获取日志类型文本
function getTypeText(type) {
  switch (type) {
    case 'auth': return '登录/登出'
    case 'video': return '视频管理'
    case 'user': return '用户管理'
    case 'system': return '系统配置'
    case 'permission': return '权限变更'
    case 'error': return '异常错误'
    default: return type
  }
}

// 方法：格式化日期时间
function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 方法：获取简短的用户代理信息
function getShortUserAgent(userAgent) {
  if (!userAgent) return ''
  
  if (userAgent.includes('Chrome')) {
    return 'Chrome'
  } else if (userAgent.includes('Firefox')) {
    return 'Firefox'
  } else if (userAgent.includes('Safari')) {
    if (userAgent.includes('Mobile')) {
      return 'Mobile Safari'
    }
    return 'Safari'
  } else if (userAgent.includes('Edge')) {
    return 'Edge'
  } else if (userAgent.includes('MSIE')) {
    return 'Internet Explorer'
  } else {
    return userAgent.length > 20 ? userAgent.substring(0, 20) + '...' : userAgent
  }
}

// 方法：获取设备信息
function getDeviceInfo(userAgent) {
  if (!userAgent) return ''
  
  if (userAgent.includes('Mobile')) {
    return '移动设备'
  } else if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
    return '平板设备'
  } else if (userAgent.includes('Windows')) {
    return 'Windows 桌面'
  } else if (userAgent.includes('Macintosh')) {
    return 'Mac 桌面'
  } else if (userAgent.includes('System')) {
    return '系统服务'
  } else {
    return '未知设备'
  }
}

// 方法：处理菜单选择
function handleMenuSelect(key) {
  activeMenu.value = key
  console.log('选择菜单:', key)
  // 根据选择的菜单项跳转到相应页面
}

// 方法：处理搜索
function handleSearch() {
  pagination.currentPage = 1
  console.log('搜索日志:', searchKeyword.value)
}

// 方法：处理重置
function handleReset() {
  searchKeyword.value = ''
  logType.value = ''
  logLevel.value = ''
  dateRange.value = []
  pagination.currentPage = 1
}

// 方法：处理选择变更
function handleSelectionChange(selection) {
  selectedLogs.value = selection
}

// 方法：处理行点击
function handleRowClick(row) {
  handleViewLog(row)
}

// 方法：处理查看日志详情
function handleViewLog(log) {
  Object.assign(currentLog, log)
  logDetailVisible.value = true
}

// 方法：处理关闭日志详情
function handleCloseLogDetail() {
  logDetailVisible.value = false
  Object.keys(currentLog).forEach(key => delete currentLog[key])
}

// 方法：处理导出日志
function handleExportLogs() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    showSuccess('日志导出成功')
    // 实际项目中这里应该调用后端API导出日志
  }, 1000)
}

// 方法：处理清空日志
function handleClearLogs() {
  clearLogDialogVisible.value = true
}

// 方法：处理关闭清空日志对话框
function handleCloseClearLogDialog() {
  clearLogDialogVisible.value = false
  clearLogDateRange.value = []
  clearLogType.value = ''
}

// 方法：确认清空日志
function confirmClearLogs() {
  ElMessageBox.confirm(
    '此操作将永久删除符合条件的日志记录，是否继续？',
    '最终确认',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      // 实际项目中这里应该调用后端API清空日志
      // 这里仅做前端演示
      if (clearLogDateRange.value.length === 2 || clearLogType.value) {
        // 按条件清空
        showSuccess('已按条件清空日志')
      } else {
        // 全部清空
        logs.value = []
        showSuccess('已清空所有日志')
      }
      clearLogDialogVisible.value = false
      loading.value = false
    }, 1000)
  }).catch(() => {
    // 取消操作
  })
}

// 方法：处理分页大小变更
function handleSizeChange(size) {
  pagination.pageSize = size
  pagination.currentPage = 1
}

// 方法：处理当前页码变更
function handleCurrentChange(current) {
  pagination.currentPage = current
}

// 组件挂载时的处理
onMounted(() => {
  // 模拟数据加载
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.system-logs-container {
  padding: 20px;
  height: 100%;
}

.breadcrumb {
  margin-bottom: 15px;
}

.header-actions {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filter {
  margin-bottom: 20px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 100%;
}

.stats-content {
  text-align: center;
  padding: 10px 0;
}

.stats-number {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-primary-color);
  margin-bottom: 8px;
}

.stats-label {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logs-list {
  margin-top: 20px;
}

.log-row {
  cursor: pointer;
}

.log-row:hover {
  background-color: var(--el-bg-color-page);
}

.action-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-agent {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.detail-action {
  word-break: break-word;
  line-height: 1.5;
}

.detail-useragent {
  word-break: break-all;
  line-height: 1.5;
}

.error-message {
  color: var(--el-color-danger);
  word-break: break-word;
  line-height: 1.5;
}

.error-stack {
  color: var(--el-text-color-secondary);
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
}

.clear-log-content {
  text-align: center;
  padding: 20px 0;
}

.warning-icon {
  color: var(--el-color-warning);
  margin-bottom: 16px;
}

.warning-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.warning-subtext {
  color: var(--el-text-color-secondary);
  margin-bottom: 20px;
}

.date-picker,
.log-type-select {
  width: 80%;
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .header-content {
    flex-direction: column;
    gap: 10px;
    height: auto;
    padding: 10px;
  }
  
  .search-filter {
    margin-bottom: 15px;
  }
  
  .chart-container {
    height: 200px;
  }
  
  .date-picker,
  .log-type-select {
    width: 100%;
  }
}
</style>