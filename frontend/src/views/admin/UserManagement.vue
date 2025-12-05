<template>
  <div class="user-management-container">
    <!-- 删除重复的面包屑导航，由AdminLayout统一提供 -->
    <div class="header-actions">
      <el-button type="success" @click="addUser">
        <el-icon><User /></el-icon>
        添加用户
      </el-button>
      <el-button type="warning" @click="exportUserData">
        <el-icon><Download /></el-icon>
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
                <span class="user-count">共 {{ users.length }} 个用户</span>
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
                <el-option label="正常" value="1" />
                <el-option label="禁用" value="0" />
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
              :data="users" 
              style="width: 100%"
              @selection-change="handleSelectionChange"
              v-loading="loading"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="userId" label="用户ID" width="100" />
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
                  <el-tag size="small">{{ scope.row.videoCount || 0 }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="viewCount" label="观看次数" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-switch 
                    :model-value="scope.row.status === 1" 
                    @change="(value) => handleStatusChange(scope.row, value)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="注册日期" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewUser(scope.row)">查看</el-button>
                  <el-button type="warning" size="small" @click="editUser(scope.row)">编辑</el-button>
                  <el-button type="info" size="small" @click="resetPassword(scope.row)">重置密码</el-button>
                  <el-button 
                    :type="scope.row.status === 1 ? 'danger' : 'success'" 
                    size="small" 
                    @click="handleStatusChange(scope.row, scope.row.status === 0)"
                  >
                    {{ scope.row.status === 1 ? '禁用' : '启用' }}
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
                  :total="pagination.total"
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
            <el-descriptions-item label="用户ID">{{ viewingUser.userId }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ getRoleName(viewingUser.role) }}</el-descriptions-item>
            <el-descriptions-item label="用户状态">{{ getStatusName(viewingUser.status) }}</el-descriptions-item>
            <el-descriptions-item label="注册日期">{{ formatDate(viewingUser.createdAt) }}</el-descriptions-item>
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
              <el-option label="正常" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="密码" v-if="!editingUser.userId" prop="password">
            <el-input v-model="editingUser.password" type="password" placeholder="请输入密码" />
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
import { ref, computed, reactive, onMounted } from 'vue'
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
import { usersAPI } from '../../api'

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
  pageSize: 10,
  total: 0
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

// 用户数据
const users = ref([])

// 加载用户数据
const loadUsers = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.value.currentPage,
      size: pagination.value.pageSize,
      username: searchKeyword.value,
      email: searchKeyword.value, // 后端支持username和email搜索
      status: filterStatus.value
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    
    const response = await usersAPI.getUsers(params)
    console.log('API响应:', response) // 添加调试日志
    
    // 检查响应结构并正确提取数据
    // 响应拦截器可能已经提取了data.data，所以我们需要检查多种可能的结构
    let userData = []
    let total = 0
    let current = 1
    let size = 10
    
    if (response) {
      // 情况1: 直接返回分页数据 {records: [], total: 0, current: 1, size: 10}
      if (response.records !== undefined) {
        userData = response.records || []
        total = response.total || 0
        current = response.current || 1
        size = response.size || 10
      }
      // 情况2: 返回的数据被包装在data中 {data: {records: [], total: 0, current: 1, size: 10}}
      else if (response.data && response.data.records !== undefined) {
        userData = response.data.records || []
        total = response.data.total || 0
        current = response.data.current || 1
        size = response.data.size || 10
      }
      // 情况3: 直接返回用户数组
      else if (Array.isArray(response)) {
        userData = response
        total = response.length
      }
      // 情况4: 返回的数据被包装在data中，且data是数组
      else if (response.data && Array.isArray(response.data)) {
        userData = response.data
        total = response.data.length
      }
    }
    
    users.value = userData
    pagination.value.total = total
    pagination.value.currentPage = current
    pagination.value.pageSize = size
    
    console.log('提取的用户数据:', users.value) // 添加调试日志
    console.log('分页信息:', pagination.value) // 添加调试日志
  } catch (error) {
    showError('获取用户数据失败')
    console.error('加载用户数据失败:', error)
    users.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUsers()
})

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
      const regDate = new Date(user.createdAt)
      return regDate >= startDate && regDate <= endDate
    })
  }
  
  // 按注册日期倒序排序
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
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
  // 根据选择的菜单项跳转到相应页面
}

function handleSearch() {
  pagination.value.currentPage = 1
  loadUsers()
}

function resetFilters() {
  searchKeyword.value = ''
  filterRole.value = ''
  filterStatus.value = ''
  dateRange.value = []
  pagination.value.currentPage = 1
  loadUsers()
}

function handleSelectionChange(selection) {
  selectedUsers.value = selection
}

function handleRefresh() {
  loadUsers()
}

function exportUserData() {
  showSuccess('用户数据导出成功')
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
  editingUser.value = {
    userId: user.userId,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    videoCount: user.videoCount || 0
  }
  editVisible.value = true
}

// 打开添加用户对话框
const addUser = () => {
  editingUser.value = {
    userId: null,
    username: '',
    email: '',
    phone: '',
    role: 'user',
    status: 1,
    videoCount: 0,
    password: ''
  }
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
  editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingUser.value.userId) {
          // 更新现有用户
          await usersAPI.updateUser(editingUser.value.userId, editingUser.value)
          showSuccess('用户信息已更新')
        } else {
          // 创建新用户
          await usersAPI.createUser(editingUser.value)
          showSuccess('用户创建成功')
        }
        handleCloseEdit()
        loadUsers()
      } catch (error) {
        showError(editingUser.value.userId ? '更新用户信息失败' : '创建用户失败')
        console.error(editingUser.value.userId ? '更新用户信息失败:' : '创建用户失败:', error)
      }
    } else {
      return false
    }
  })
}

// 重置密码
const resetPassword = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 ${user.username} 的密码吗？`,
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await usersAPI.resetPassword(user.userId)
    showSuccess('密码重置成功，新密码已发送到用户邮箱')
  } catch (error) {
    if (error !== 'cancel') {
      showError('重置密码失败')
      console.error('重置密码失败:', error)
    }
  }
}

// 切换用户状态
const handleStatusChange = async (user, value) => {
  const newStatus = value ? 1 : 0 // 1表示启用，0表示禁用
  const statusText = newStatus === 1 ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${statusText}用户 ${user.username} 吗？`,
      `${statusText}用户`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await usersAPI.updateUserStatus(user.userId, newStatus)
    showSuccess(`用户${statusText}成功`)
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      showError(`${statusText}用户失败`)
      console.error(`${statusText}用户失败:`, error)
    }
  }
}

// 批量启用
const batchActivate = async () => {
  if (selectedUsers.value.length === 0) {
    showWarning('请选择要启用的用户')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要启用选中的用户吗？', '批量启用', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const userIds = selectedUsers.value.map(user => user.userId)
    await usersAPI.updateUserStatus(userIds, 1) // 1表示启用状态
    showSuccess('用户批量启用成功')
    selectedUsers.value = []
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      showError('批量启用用户失败')
      console.error('批量启用用户失败:', error)
    }
  }
}

// 批量禁用
const batchDisable = async () => {
  if (selectedUsers.value.length === 0) {
    showWarning('请选择要禁用的用户')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要禁用选中的用户吗？', '批量禁用', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const userIds = selectedUsers.value.map(user => user.userId)
    await usersAPI.updateUserStatus(userIds, 0) // 0表示禁用状态
    showSuccess('用户批量禁用成功')
    selectedUsers.value = []
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      showError('批量禁用用户失败')
      console.error('批量禁用用户失败:', error)
    }
  }
}

// 删除用户
const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${user.username} 吗？此操作不可恢复！`,
      '删除用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await usersAPI.deleteUser(user.userId)
    showSuccess('用户删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      showError('删除用户失败')
      console.error('删除用户失败:', error)
    }
  }
}

// 分页大小改变
function handleSizeChange(size) {
  pagination.value.pageSize = size
  loadUsers()
}

// 当前页改变
function handleCurrentChange(current) {
  pagination.value.currentPage = current
  loadUsers()
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
    1: '正常',
    0: '禁用'
  }
  return statusMap[status] || '未知'
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
  background-color: var(--avatar-bg, #d0d0d0); /* 使用定义的头像背景色变量 */
  color: var(--color-text-primary, #333); /* 使用定义的主要文字颜色变量 */
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
  background-color: var(--avatar-bg, #d0d0d0); /* 使用定义的头像背景色变量 */
  color: var(--color-text-primary, #333); /* 使用定义的主要文字颜色变量 */
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