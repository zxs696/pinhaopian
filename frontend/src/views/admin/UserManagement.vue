<template>
  <div class="user-management-container">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-actions">
      <el-button type="warning" @click="exportUserData">
        <el-icon><download /></el-icon>
        导出数据
      </el-button>
      <el-button type="primary" @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          <el-card>
            <template #header>
              <div class="card-header">
                <span>用户管理</span>
                <span class="user-count">（共 {{ users.length }} 个用户）</span>
              </div>
            </template>
            
            <div class="filter-section">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索用户名或邮箱"
                class="search-input"
                prefix-icon="Search"
                @keyup.enter="handleSearch"
              />
              <el-select v-model="filterRole" placeholder="选择角色" class="role-select">
                <el-option label="所有角色" value="" />
                <el-option label="管理员" value="admin" />
                <el-option label="普通用户" value="user" />
                <el-option label="审核员" value="reviewer" />
              </el-select>
              <el-select v-model="filterStatus" placeholder="选择状态" class="status-select">
                <el-option label="所有状态" value="" />
                <el-option label="正常" value="active" />
                <el-option label="禁用" value="disabled" />
                <el-option label="未激活" value="inactive" />
              </el-select>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="注册开始日期"
                end-placeholder="注册结束日期"
                class="date-picker"
              />
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetFilters">重置</el-button>
            </div>
            
            <el-table 
              :data="paginatedUsers" 
              style="width: 100%"
              @selection-change="handleSelectionChange"
              v-loading="loading"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="用户ID" width="100" />
              <el-table-column prop="username" label="用户名" min-width="150">
                <template #default="scope">
                  <div class="user-item">
                    <el-avatar :size="40" :src="scope.row.avatar" class="user-avatar" />
                    <div class="user-info">
                      <div>{{ scope.row.username }}</div>
                      <div class="user-email">{{ scope.row.email }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="role" label="角色" width="100">
                <template #default="scope">
                  <el-tag :type="getRoleType(scope.row.role)">
                    {{ getRoleName(scope.row.role) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="videoCount" label="发布视频" width="120">
                <template #default="scope">
                  <el-tag size="small">{{ scope.row.videoCount }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="viewCount" label="观看次数" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-switch 
                    v-model="scope.row.status" 
                    active-value="active" 
                    inactive-value="disabled"
                    @change="handleStatusChange(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="registrationDate" label="注册日期" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.registrationDate) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewUser(scope.row)">查看</el-button>
                  <el-button type="warning" size="small" @click="editUser(scope.row)">编辑</el-button>
                  <el-button 
                    :type="scope.row.status === 'active' ? 'danger' : 'success'" 
                    size="small" 
                    @click="toggleUserStatus(scope.row)"
                  >
                    {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="table-footer">
              <div class="batch-actions" v-if="selectedUsers.length > 0">
                <span>已选择 {{ selectedUsers.length }} 个用户</span>
                <el-button type="success" @click="batchActivate">批量启用</el-button>
                <el-button type="danger" @click="batchDisable">批量禁用</el-button>
              </div>
              <div class="pagination">
                <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="filteredUsers.length"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </el-card>
    
    <!-- 查看用户对话框 -->
    <el-dialog
      v-model="viewVisible"
      title="用户详情"
      width="60%"
      :before-close="handleCloseView"
    >
      <div v-if="viewingUser" class="user-detail">
        <div class="detail-header">
          <el-avatar :size="80" :src="viewingUser.avatar" class="detail-avatar" />
          <div class="detail-info">
            <h3>{{ viewingUser.username }}</h3>
            <p>{{ viewingUser.email }}</p>
            <div class="user-stats">
              <el-statistic :value="viewingUser.videoCount" label="发布视频" />
              <el-statistic :value="viewingUser.viewCount" label="观看次数" />
              <el-statistic :value="viewingUser.followerCount" label="粉丝数" />
            </div>
          </div>
        </div>
        <el-divider />
        <div class="detail-content">
          <el-descriptions border :column="2">
            <el-descriptions-item label="用户ID">{{ viewingUser.id }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ getRoleName(viewingUser.role) }}</el-descriptions-item>
            <el-descriptions-item label="用户状态">{{ getStatusName(viewingUser.status) }}</el-descriptions-item>
            <el-descriptions-item label="注册日期">{{ formatDate(viewingUser.registrationDate) }}</el-descriptions-item>
            <el-descriptions-item label="最后登录时间">{{ viewingUser.lastLoginTime ? formatDate(viewingUser.lastLoginTime) : '从未登录' }}</el-descriptions-item>
            <el-descriptions-item label="账号等级">{{ viewingUser.level }}</el-descriptions-item>
            <el-descriptions-item label="简介" :span="2">{{ viewingUser.bio || '暂无简介' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCloseView">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editVisible"
      title="编辑用户信息"
      width="60%"
      :before-close="handleCloseEdit"
    >
      <div v-if="editingUser" class="edit-form">
        <el-form :model="editingUser" :rules="rules" ref="editFormRef" label-width="120px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editingUser.username" placeholder="请输入用户名" maxlength="50" show-word-limit />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editingUser.email" placeholder="请输入邮箱" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="editingUser.role" placeholder="请选择角色">
              <el-option label="管理员" value="admin" />
              <el-option label="普通用户" value="user" />
              <el-option label="审核员" value="reviewer" />
            </el-select>
          </el-form-item>
          <el-form-item label="用户状态">
            <el-select v-model="editingUser.status" placeholder="请选择状态">
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="disabled" />
              <el-option label="未激活" value="inactive" />
            </el-select>
          </el-form-item>
          <el-form-item label="用户简介" prop="bio">
            <el-input
              v-model="editingUser.bio"
              type="textarea"
              :rows="4"
              placeholder="请输入用户简介"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="重置密码">
            <el-button type="danger" @click="resetPassword">重置为默认密码</el-button>
            <div class="hint-text">默认密码: 123456</div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="handleCloseEdit">取消</el-button>
        <el-button type="primary" @click="submitEditForm">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 用户管理页面逻辑
import { ref, computed, reactive } from 'vue'
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
import { showSuccess, showWarning, showError } from '../../utils/message.js'

const activeMenu = ref('user-management')
const searchKeyword = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const dateRange = ref([])
const loading = ref(false)
const selectedUsers = ref([])
const viewVisible = ref(false)
const editVisible = ref(false)
const viewingUser = ref(null)
const editingUser = ref(null)
const editFormRef = ref()

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在3到50个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'blur' }
  ]
}

// 模拟用户数据
const users = ref([
  {
    id: '1001',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    avatar: '/logo.png',
    videoCount: 0,
    viewCount: 1560,
    followerCount: 12,
    registrationDate: '2024-01-01 00:00:00',
    lastLoginTime: '2024-01-14 10:30:00',
    level: 'VIP5',
    bio: '系统管理员'
  },
  {
    id: '1002',
    username: 'zhangwei',
    email: 'zhangwei@example.com',
    role: 'user',
    status: 'active',
    avatar: '/logo.png',
    videoCount: 28,
    viewCount: 35600,
    followerCount: 256,
    registrationDate: '2024-01-02 14:23:00',
    lastLoginTime: '2024-01-13 18:45:00',
    level: 'VIP3',
    bio: '热爱摄影和旅行的视频创作者'
  },
  {
    id: '1003',
    username: 'lisi',
    email: 'lisi@example.com',
    role: 'reviewer',
    status: 'active',
    avatar: '/logo.png',
    videoCount: 5,
    viewCount: 12300,
    followerCount: 45,
    registrationDate: '2024-01-03 09:15:00',
    lastLoginTime: '2024-01-14 09:20:00',
    level: 'VIP2',
    bio: '内容审核员'
  },
  {
    id: '1004',
    username: 'wangwu',
    email: 'wangwu@example.com',
    role: 'user',
    status: 'active',
    avatar: '/logo.png',
    videoCount: 15,
    viewCount: 28900,
    followerCount: 178,
    registrationDate: '2024-01-04 16:40:00',
    lastLoginTime: '2024-01-12 21:30:00',
    level: 'VIP2',
    bio: '科技爱好者，分享数码产品评测'
  },
  {
    id: '1005',
    username: 'zhaoliu',
    email: 'zhaoliu@example.com',
    role: 'user',
    status: 'disabled',
    avatar: '/logo.png',
    videoCount: 8,
    viewCount: 9800,
    followerCount: 32,
    registrationDate: '2024-01-05 11:25:00',
    lastLoginTime: '2024-01-08 14:10:00',
    level: 'VIP1',
    bio: '美食爱好者'
  },
  {
    id: '1006',
    username: 'sunqi',
    email: 'sunqi@example.com',
    role: 'user',
    status: 'inactive',
    avatar: '/logo.png',
    videoCount: 0,
    viewCount: 120,
    followerCount: 0,
    registrationDate: '2024-01-10 19:30:00',
    lastLoginTime: null,
    level: '普通用户',
    bio: ''
  },
  {
    id: '1007',
    username: 'zhouba',
    email: 'zhouba@example.com',
    role: 'user',
    status: 'active',
    avatar: '/logo.png',
    videoCount: 42,
    viewCount: 67800,
    followerCount: 890,
    registrationDate: '2024-01-07 08:50:00',
    lastLoginTime: '2024-01-14 11:45:00',
    level: 'VIP4',
    bio: '音乐制作人，分享音乐创作和乐器教学'
  },
  {
    id: '1008',
    username: 'wujiu',
    email: 'wujiu@example.com',
    role: 'user',
    status: 'active',
    avatar: '/logo.png',
    videoCount: 12,
    viewCount: 18900,
    followerCount: 123,
    registrationDate: '2024-01-08 15:20:00',
    lastLoginTime: '2024-01-13 20:15:00',
    level: 'VIP2',
    bio: '教育工作者，分享教学经验和学习方法'
  }
])

// 计算过滤后的用户列表
const filteredUsers = computed(() => {
  let result = [...users.value]
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(user => 
      user.username.toLowerCase().includes(keyword) || 
      user.email.toLowerCase().includes(keyword)
    )
  }
  
  // 角色过滤
  if (filterRole.value) {
    result = result.filter(user => user.role === filterRole.value)
  }
  
  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(user => user.status === filterStatus.value)
  }
  
  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    endDate.setHours(23, 59, 59, 999)
    
    result = result.filter(user => {
      const regDate = new Date(user.registrationDate)
      return regDate >= startDate && regDate <= endDate
    })
  }
  
  // 按注册日期倒序排序
  result.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
  
  return result
})

// 分页后的用户列表
const paginatedUsers = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredUsers.value.slice(start, end)
})

function handleMenuSelect(key) {
  activeMenu.value = key
  console.log('选择菜单:', key)
  // 根据选择的菜单项跳转到相应页面
}

function handleSearch() {
  console.log('搜索关键词:', searchKeyword.value)
  console.log('选择角色:', filterRole.value)
  console.log('选择状态:', filterStatus.value)
  console.log('日期范围:', dateRange.value)
  pagination.value.currentPage = 1
}

function resetFilters() {
  searchKeyword.value = ''
  filterRole.value = ''
  filterStatus.value = ''
  dateRange.value = []
  pagination.value.currentPage = 1
}

function handleSelectionChange(selection) {
  selectedUsers.value = selection
}

function handleRefresh() {
  loading.value = true
  // 模拟加载数据
  setTimeout(() => {
    loading.value = false
    showSuccess('数据已刷新')
  }, 500)
}

function exportUserData() {
  showSuccess('用户数据导出成功')
  console.log('导出用户数据')
}

function viewUser(user) {
  viewingUser.value = { ...user }
  viewVisible.value = true
}

function handleCloseView() {
  viewVisible.value = false
  viewingUser.value = null
}

function editUser(user) {
  editingUser.value = { ...user }
  editVisible.value = true
}

function handleCloseEdit() {
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  editVisible.value = false
  editingUser.value = null
}

function submitEditForm() {
  editFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟更新用户信息
      const index = users.value.findIndex(u => u.id === editingUser.value.id)
      if (index !== -1) {
        // 保留不可编辑的字段
        const original = users.value[index]
        users.value[index] = {
          ...editingUser.value,
          videoCount: original.videoCount,
          viewCount: original.viewCount,
          followerCount: original.followerCount,
          registrationDate: original.registrationDate,
          lastLoginTime: original.lastLoginTime,
          level: original.level,
          avatar: original.avatar
        }
        handleCloseEdit()
        showSuccess('用户信息已更新')
      }
    } else {
      console.log('表单验证失败')
      return false
    }
  })
}

function resetPassword() {
  ElMessageBox.confirm('确定要重置此用户的密码为默认密码吗？', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    showSuccess('密码已重置为: 123456')
  }).catch(() => {
    // 取消操作
  })
}

function toggleUserStatus(user) {
  const newStatus = user.status === 'active' ? 'disabled' : 'active'
  const action = newStatus === 'active' ? '启用' : '禁用'
  
  ElMessageBox.confirm(`确定要${action}用户 "${user.username}" 吗？`, '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value[index].status = newStatus
      showSuccess(`用户已${action}`)
    }
  }).catch(() => {
    // 取消操作
  })
}

function handleStatusChange(user) {
  console.log('用户状态更新:', user.username, '新状态:', user.status)
}

function batchActivate() {
  ElMessageBox.confirm(`确定要启用选中的 ${selectedUsers.value.length} 个用户吗？`, '批量启用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedUsers.value.forEach(user => {
      const index = users.value.findIndex(u => u.id === user.id)
      if (index !== -1) {
        users.value[index].status = 'active'
      }
    })
    selectedUsers.value = []
    showSuccess('批量启用成功')
  }).catch(() => {
    // 取消操作
  })
}

function batchDisable() {
  ElMessageBox.confirm(`确定要禁用选中的 ${selectedUsers.value.length} 个用户吗？`, '批量禁用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedUsers.value.forEach(user => {
      const index = users.value.findIndex(u => u.id === user.id)
      if (index !== -1) {
        users.value[index].status = 'disabled'
      }
    })
    selectedUsers.value = []
    showSuccess('批量禁用成功')
  }).catch(() => {
    // 取消操作
  })
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

function getRoleName(role) {
  const roleMap = {
    'admin': '管理员',
    'user': '普通用户',
    'reviewer': '审核员'
  }
  return roleMap[role] || role
}

function getRoleType(role) {
  const typeMap = {
    'admin': 'danger',
    'user': 'primary',
    'reviewer': 'warning'
  }
  return typeMap[role] || 'info'
}

function getStatusName(status) {
  const statusMap = {
    'active': '正常',
    'disabled': '禁用',
    'inactive': '未激活'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.user-management-container {
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

.user-count {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.search-input {
  width: 300px;
}

.role-select,
.status-select {
  width: 150px;
}

.date-picker {
  width: 300px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-email {
  font-size: 12px;
  color: var(--el-text-color-secondary);
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

/* 用户详情样式 */
.user-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.detail-avatar {
  object-fit: cover;
}

.detail-info {
  flex: 1;
}

.detail-info h3 {
  margin: 0 0 5px 0;
  font-size: 24px;
}

.user-stats {
  display: flex;
  gap: 30px;
  margin-top: 15px;
}

.detail-content {
  margin-top: 20px;
}

.edit-form {
  max-height: 70vh;
  overflow-y: auto;
}

.hint-text {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input,
  .role-select,
  .status-select,
  .date-picker {
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
  
  .user-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>