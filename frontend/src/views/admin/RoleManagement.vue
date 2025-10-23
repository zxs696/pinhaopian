<template>
    <div class="role-management-container">
        <div class="breadcrumb">
                            <el-breadcrumb separator="/">
                                <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
                                <el-breadcrumb-item>角色管理</el-breadcrumb-item>
                            </el-breadcrumb>
                        </div>
                        <div class="header-actions">
                            <el-button type="primary" @click="handleAddRole">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                                新增角色
                            </el-button>
                        </div>
                    <el-card>
                        <template #header>
                            <div class="card-header">
                                <span>角色管理</span>
                                <el-tag type="info">用户权限角色配置</el-tag>
                            </div>
                        </template>

                        <!-- 搜索过滤区域 -->
                        <div class="search-filter">
                            <el-input v-model="searchKeyword" placeholder="搜索角色名称" class="search-input"
                                prefix-icon="Search" />
                            <el-button type="primary" @click="handleSearch">搜索</el-button>
                            <el-button @click="handleReset">重置</el-button>
                            <el-button type="danger" @click="handleDeleteSelected"
                                :disabled="selectedRoles.length === 0">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                                批量删除
                                <template #suffix>
                                    <el-badge :value="selectedRoles.length" class="item" />
                                </template>
                            </el-button>
                        </div>

                        <!-- 角色列表 -->
                        <el-table v-loading="loading" :data="filteredRoles" style="width: 100%"
                            @selection-change="handleSelectionChange" @row-contextmenu="handleRowContextMenu">
                            <el-table-column type="selection" width="55" :selectable="isSelectable" />
                            <el-table-column prop="id" label="角色ID" width="80" />
                            <el-table-column prop="name" label="角色名称" min-width="150">
                                <template #default="scope">
                                    <span class="role-name">{{ scope.row.name }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="description" label="角色描述" min-width="200" />
                            <el-table-column prop="status" label="状态" width="100">
                                <template #default="scope">
                                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                                        {{ scope.row.status === 1 ? '启用' : '禁用' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="createdAt" label="创建时间" width="180">
                                <template #default="scope">
                                    {{ formatDate(scope.row.createdAt) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="updatedAt" label="更新时间" width="180">
                                <template #default="scope">
                                    {{ formatDate(scope.row.updatedAt) }}
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="250" fixed="right">
                                <template #default="scope">
                                    <el-button type="primary" size="small" @click="handleEditRole(scope.row)">
                                        <el-icon>
                                            <Edit />
                                        </el-icon>
                                        编辑
                                    </el-button>
                                    <el-button type="success" size="small" @click="handlePermission(scope.row)">
                                        <el-icon>
                                            <Key />
                                        </el-icon>
                                        权限设置
                                    </el-button>
                                    <el-button :type="scope.row.status === 1 ? 'warning' : 'success'" size="small"
                                        @click="handleToggleStatus(scope.row)">
                                        <el-icon>{{ scope.row.status === 1 ? 'SwitchButton' : 'Play' }}</el-icon>
                                        {{ scope.row.status === 1 ? '禁用' : '启用' }}
                                    </el-button>
                                    <el-button type="danger" size="small" @click="handleDeleteRole(scope.row)"
                                        :disabled="isDefaultRole(scope.row)">
                                        <el-icon>
                                            <Delete />
                                        </el-icon>
                                        删除
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <!-- 分页 -->
                        <el-pagination v-model:current-page="pagination.currentPage"
                            v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]"
                            layout="total, sizes, prev, pager, next, jumper" :total="filteredRoles.length"
                            class="pagination" />
                    </el-card>

                    <!-- 角色分配表格 -->
                    <el-card class="assign-card" v-if="showAssign">
                        <template #header>
                            <div class="card-header">
                                <span>{{ currentRole.name }} - 人员分配</span>
                                <el-button type="primary" @click="handleAddUserToRole">
                                    <el-icon>
                                        <Plus />
                                    </el-icon>
                                    添加成员
                                </el-button>
                            </div>
                        </template>

                        <div class="assign-search">
                            <el-input v-model="assignSearchKeyword" placeholder="搜索用户名或账号" class="search-input"
                                prefix-icon="Search" />
                            <el-button type="primary" @click="handleAssignSearch">搜索</el-button>
                            <el-button @click="handleAssignReset">重置</el-button>
                        </div>

                        <el-table v-loading="assignLoading" :data="assignedUsers" style="width: 100%"
                            @selection-change="handleAssignSelectionChange">
                            <el-table-column type="selection" width="55" />
                            <el-table-column prop="id" label="用户ID" width="80" />
                            <el-table-column prop="username" label="用户名" width="120" />
                            <el-table-column prop="nickname" label="昵称" min-width="150" />
                            <el-table-column prop="email" label="邮箱" min-width="200" />
                            <el-table-column prop="mobile" label="手机号" min-width="120" />
                            <el-table-column label="操作" width="120" fixed="right">
                                <template #default="scope">
                                    <el-button type="danger" size="small" @click="handleRemoveUserFromRole(scope.row)">
                                        <el-icon>
                                            <Remove />
                                        </el-icon>
                                        移除
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div class="assign-actions">
                            <el-button type="danger" @click="handleRemoveSelectedUsers"
                                :disabled="selectedAssignedUsers.length === 0">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                                批量移除
                                <template #suffix>
                                    <el-badge :value="selectedAssignedUsers.length" class="item" />
                                </template>
                            </el-button>
                            <el-button @click="showAssign = false">返回角色列表</el-button>
                        </div>
                    </el-card>


        <!-- 添加/编辑角色对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :before-close="handleCloseDialog">
            <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入角色名称" :disabled="isDefaultRole(formData)" />
                </el-form-item>
                <el-form-item label="角色描述" prop="description">
                    <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入角色描述" />
                </el-form-item>
                <el-form-item label="角色状态">
                    <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="handleCloseDialog">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>

        <!-- 权限设置对话框 -->
        <el-dialog v-model="permissionDialogVisible" title="权限设置" width="800px"
            :before-close="handleClosePermissionDialog">
            <div class="permission-dialog">
                <div class="permission-header">
                    <h3>{{ permissionRole.name }} - 权限配置</h3>
                    <div class="permission-actions">
                        <el-button size="small" type="primary" @click="handleSelectAllPermissions">
                            全选
                        </el-button>
                        <el-button size="small" @click="handleDeselectAllPermissions">
                            取消全选
                        </el-button>
                        <el-button size="small" type="success" @click="handleSavePermissions">
                            <el-icon>
                                <Save />
                            </el-icon>
                            保存权限
                        </el-button>
                    </div>
                </div>

                <div class="permission-content">
                    <el-tree v-loading="permissionLoading" :data="permissionsTree" show-checkbox node-key="id"
                        :default-expanded-keys="expandedKeys" :default-checked-keys="checkedKeys"
                        :props="permissionTreeProps" @check-change="handlePermissionChange" class="permission-tree" />
                </div>
            </div>
        </el-dialog>

        <!-- 添加用户到角色对话框 -->
        <el-dialog v-model="addUserDialogVisible" title="添加用户到角色" width="600px"
            :before-close="handleCloseAddUserDialog">
            <div class="add-user-dialog">
                <div class="add-user-search">
                    <el-input v-model="addUserSearchKeyword" placeholder="搜索用户名或账号" class="search-input"
                        prefix-icon="Search" />
                    <el-button type="primary" @click="handleAddUserSearch">搜索</el-button>
                    <el-button @click="handleAddUserReset">重置</el-button>
                </div>

                <el-table v-loading="addUserLoading" :data="availableUsers" style="width: 100%"
                    @selection-change="handleAddUserSelectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="id" label="用户ID" width="80" />
                    <el-table-column prop="username" label="用户名" width="120" />
                    <el-table-column prop="nickname" label="昵称" min-width="150" />
                    <el-table-column prop="email" label="邮箱" min-width="200" />
                </el-table>

                <div class="add-user-footer">
                    <el-pagination v-model:current-page="addUserPagination.currentPage"
                        v-model:page-size="addUserPagination.pageSize" :page-sizes="[10, 20, 50, 100]"
                        layout="total, sizes, prev, pager, next, jumper" :total="availableUsers.length"
                        class="add-user-pagination" />
                </div>
            </div>
            <template #footer>
                <el-button @click="handleCloseAddUserDialog">取消</el-button>
                <el-button type="primary" @click="handleAddSelectedUsers" :disabled="selectedAddUsers.length === 0">
                    添加选中用户
                    <template #suffix>
                        <el-badge :value="selectedAddUsers.length" class="item" />
                    </template>
                </el-button>
            </template>
        </el-dialog>

        <!-- 右键菜单 -->
        <el-dropdown v-model="contextMenuVisible" trigger="contextmenu" :show-timeout="0" :hide-on-click="false">
            <el-dropdown-menu>
                <el-dropdown-item @click="handleContextEdit">
                    <el-icon>
                        <Edit />
                    </el-icon>
                    编辑
                </el-dropdown-item>
                <el-dropdown-item @click="handleContextPermission">
                    <el-icon>
                        <Key />
                    </el-icon>
                    权限设置
                </el-dropdown-item>
                <el-dropdown-item @click="handleContextToggleStatus">
                    <el-icon>{{ contextMenuRole.status === 1 ? 'SwitchButton' : 'Play' }}</el-icon>
                    {{ contextMenuRole.status === 1 ? '禁用' : '启用' }}
                </el-dropdown-item>
                <el-dropdown-item @click="handleContextDelete" :disabled="isDefaultRole(contextMenuRole)" divided
                    :class="{ 'text-danger': !isDefaultRole(contextMenuRole) }">
                    <el-icon>
                        <Delete />
                    </el-icon>
                    删除
                </el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  Plus,
  Search,
  Delete,
  Edit,
  Key,
  SwitchButton,
  Play,
  Remove,
  Save
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccess, showWarning } from '../../utils/message.js'


const loading = ref(false)
const assignLoading = ref(false)
const permissionLoading = ref(false)
const addUserLoading = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const addUserDialogVisible = ref(false)
const showAssign = ref(false)
const contextMenuVisible = ref(false)
const contextMenuRole = reactive({})
const currentRole = reactive({})
const permissionRole = reactive({})
const selectedRoles = ref([])
const selectedAssignedUsers = ref([])
const selectedAddUsers = ref([])
const searchKeyword = ref('')
const assignSearchKeyword = ref('')
const addUserSearchKeyword = ref('')
const formRef = ref(null)
const expandedKeys = ref([])
const checkedKeys = ref([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

const addUserPagination = reactive({
  currentPage: 1,
  pageSize: 10
})

const formData = reactive({
  id: '',
  name: '',
  description: '',
  status: 1
})

const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 50, message: '角色名称长度应在1-50个字符之间', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '角色描述不能超过200个字符', trigger: 'blur' }
  ]
}

const permissionTreeProps = {
  children: 'children',
  label: 'name'
}

// 模拟角色数据
const roles = ref([
  {
    id: '1',
    name: '超级管理员',
    description: '系统最高权限角色',
    status: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    isDefault: true
  },
  {
    id: '2',
    name: '管理员',
    description: '拥有系统管理权限',
    status: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    isDefault: true
  },
  {
    id: '3',
    name: '编辑',
    description: '内容编辑权限',
    status: 1,
    createdAt: '2024-01-10 10:30:00',
    updatedAt: '2024-01-10 10:30:00',
    isDefault: false
  },
  {
    id: '4',
    name: '审核员',
    description: '视频审核权限',
    status: 1,
    createdAt: '2024-01-12 15:45:00',
    updatedAt: '2024-01-12 15:45:00',
    isDefault: false
  },
  {
    id: '5',
    name: '普通用户',
    description: '普通注册用户',
    status: 1,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    isDefault: true
  }
])

// 模拟权限树数据
const permissionsTree = ref([
  {
    id: 'dashboard',
    name: '仪表盘',
    children: [
      { id: 'dashboard:view', name: '查看仪表盘' }
    ]
  },
  {
    id: 'video',
    name: '视频管理',
    children: [
      { id: 'video:list', name: '查看视频列表' },
      { id: 'video:add', name: '添加视频' },
      { id: 'video:edit', name: '编辑视频' },
      { id: 'video:delete', name: '删除视频' },
      { id: 'video:review', name: '审核视频' }
    ]
  },
  {
    id: 'user',
    name: '用户管理',
    children: [
      { id: 'user:list', name: '查看用户列表' },
      { id: 'user:add', name: '添加用户' },
      { id: 'user:edit', name: '编辑用户' },
      { id: 'user:delete', name: '删除用户' },
      { id: 'user:resetpwd', name: '重置密码' }
    ]
  },
  {
    id: 'category',
    name: '分类管理',
    children: [
      { id: 'category:list', name: '查看分类列表' },
      { id: 'category:add', name: '添加分类' },
      { id: 'category:edit', name: '编辑分类' },
      { id: 'category:delete', name: '删除分类' }
    ]
  },
  {
    id: 'role',
    name: '角色管理',
    children: [
      { id: 'role:list', name: '查看角色列表' },
      { id: 'role:add', name: '添加角色' },
      { id: 'role:edit', name: '编辑角色' },
      { id: 'role:delete', name: '删除角色' },
      { id: 'role:assign', name: '分配权限' }
    ]
  },
  {
    id: 'security',
    name: '安全设置',
    children: [
      { id: 'security:login', name: '登录安全设置' },
      { id: 'security:content', name: '内容安全设置' },
      { id: 'security:ip', name: 'IP管理' },
      { id: 'security:log', name: '系统日志' },
      { id: 'security:backup', name: '备份恢复' }
    ]
  }
])

// 模拟用户数据
const users = ref([
  { id: '1', username: 'admin', nickname: '超级管理员', email: 'admin@example.com', mobile: '13800138000' },
  { id: '2', username: 'manager', nickname: '管理员', email: 'manager@example.com', mobile: '13800138001' },
  { id: '3', username: 'editor', nickname: '内容编辑', email: 'editor@example.com', mobile: '13800138002' },
  { id: '4', username: 'reviewer', nickname: '审核员', email: 'reviewer@example.com', mobile: '13800138003' },
  { id: '5', username: 'user1', nickname: '测试用户1', email: 'user1@example.com', mobile: '13800138004' },
  { id: '6', username: 'user2', nickname: '测试用户2', email: 'user2@example.com', mobile: '13800138005' }
])

// 模拟角色用户关联数据
const roleUsers = reactive({
  '1': [users.value[0]],
  '2': [users.value[1]],
  '3': [users.value[2]],
  '4': [users.value[3]],
  '5': [users.value[4], users.value[5]]
})

// 计算属性：过滤后的角色列表
const filteredRoles = computed(() => {
  if (!searchKeyword.value) {
    return roles.value
  }
  return roles.value.filter(role => 
    role.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    role.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 计算属性：角色分配的用户列表
const assignedUsers = computed(() => {
  if (!currentRole.id) return []
  
  let userList = roleUsers[currentRole.id] || []
  if (!assignSearchKeyword.value) {
    return userList
  }
  
  return userList.filter(user => 
    user.username.toLowerCase().includes(assignSearchKeyword.value.toLowerCase()) ||
    user.nickname.toLowerCase().includes(assignSearchKeyword.value.toLowerCase()) ||
    user.email.toLowerCase().includes(assignSearchKeyword.value.toLowerCase()) ||
    user.mobile.includes(assignSearchKeyword.value)
  )
})

// 计算属性：可添加到角色的用户列表（未分配的用户）
const availableUsers = computed(() => {
  if (!currentRole.id) return []
  
  const assignedUserIds = (roleUsers[currentRole.id] || []).map(user => user.id)
  let userList = users.value.filter(user => !assignedUserIds.includes(user.id))
  
  if (!addUserSearchKeyword.value) {
    return userList
  }
  
  return userList.filter(user => 
    user.username.toLowerCase().includes(addUserSearchKeyword.value.toLowerCase()) ||
    user.nickname.toLowerCase().includes(addUserSearchKeyword.value.toLowerCase()) ||
    user.email.toLowerCase().includes(addUserSearchKeyword.value.toLowerCase())
  )
})

// 方法：检查是否为默认角色（不可删除）
function isDefaultRole(role) {
  return role && role.isDefault
}

// 方法：检查角色是否可选择（默认角色不可选择）
function isSelectable(row) {
  return !row.isDefault
}

// 方法：格式化日期
function formatDate(dateString) {
  return new Date(dateString).toLocaleString('zh-CN')
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
  console.log('搜索角色:', searchKeyword.value)
}

// 方法：处理重置
function handleReset() {
  searchKeyword.value = ''
  pagination.currentPage = 1
}

// 方法：处理选择变更
function handleSelectionChange(selection) {
  selectedRoles.value = selection
}

// 方法：处理添加角色
function handleAddRole() {
  dialogTitle.value = '添加角色'
  formData.id = ''
  formData.name = ''
  formData.description = ''
  formData.status = 1
  dialogVisible.value = true
}

// 方法：处理编辑角色
function handleEditRole(role) {
  dialogTitle.value = '编辑角色'
  formData.id = role.id
  formData.name = role.name
  formData.description = role.description
  formData.status = role.status
  dialogVisible.value = true
}

// 方法：处理提交表单
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      if (formData.id) {
        // 编辑现有角色
        const index = roles.value.findIndex(role => role.id === formData.id)
        if (index !== -1) {
          roles.value[index] = {
            ...roles.value[index],
            name: formData.name,
            description: formData.description,
            status: formData.status,
            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
          showSuccess('角色编辑成功')
        }
      } else {
        // 添加新角色
        const newRole = {
          id: String(Date.now()),
          name: formData.name,
          description: formData.description,
          status: formData.status,
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          isDefault: false
        }
        roles.value.push(newRole)
        showSuccess('角色添加成功')
      }
      dialogVisible.value = false
    }
  })
}

// 方法：处理关闭对话框
function handleCloseDialog() {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

// 方法：处理删除角色
function handleDeleteRole(role) {
  if (isDefaultRole(role)) {
    showWarning('默认角色不可删除')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除角色 "${role.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    const index = roles.value.findIndex(r => r.id === role.id)
    if (index !== -1) {
      roles.value.splice(index, 1)
      // 清理相关的角色用户关联
      if (roleUsers[role.id]) {
        delete roleUsers[role.id]
      }
      showSuccess('角色删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 方法：处理批量删除
function handleDeleteSelected() {
  if (selectedRoles.value.length === 0) {
    showWarning('请选择要删除的角色')
    return
  }
  
  const defaultRoles = selectedRoles.value.filter(role => role.isDefault)
  if (defaultRoles.length > 0) {
    showWarning('选择的角色中包含默认角色，默认角色不可删除')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRoles.value.length} 个角色吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    selectedRoles.value.forEach(role => {
      const index = roles.value.findIndex(r => r.id === role.id)
      if (index !== -1) {
        roles.value.splice(index, 1)
        // 清理相关的角色用户关联
        if (roleUsers[role.id]) {
          delete roleUsers[role.id]
        }
      }
    })
    selectedRoles.value = []
    showSuccess('角色批量删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 方法：处理角色状态切换
function handleToggleStatus(role) {
  const newStatus = role.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '启用' : '禁用'
  
  ElMessageBox.confirm(
    `确定要${statusText}角色 "${role.name}" 吗？`,
    `${statusText}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: newStatus === 1 ? 'success' : 'warning'
    }
  ).then(() => {
    const index = roles.value.findIndex(r => r.id === role.id)
    if (index !== -1) {
      roles.value[index].status = newStatus
      roles.value[index].updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
      showSuccess(`角色${statusText}成功`)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 方法：处理权限设置
function handlePermission(role) {
  Object.assign(permissionRole, role)
  
  // 模拟加载权限数据（实际应该从后端获取）
  permissionLoading.value = true
  setTimeout(() => {
    // 模拟权限数据，根据角色ID设置默认选中
    if (role.id === '1') {
      // 超级管理员拥有所有权限
      checkedKeys.value = collectAllPermissionIds(permissionsTree.value)
    } else if (role.id === '2') {
      // 管理员拥有大部分权限
      checkedKeys.value = [
        'dashboard:view',
        'video:list', 'video:add', 'video:edit', 'video:delete', 'video:review',
        'user:list', 'user:add', 'user:edit', 'user:delete', 'user:resetpwd',
        'category:list', 'category:add', 'category:edit', 'category:delete',
        'role:list', 'role:add', 'role:edit', 'role:delete', 'role:assign',
        'security:login', 'security:content', 'security:ip'
      ]
    } else if (role.id === '3') {
      // 编辑拥有内容编辑权限
      checkedKeys.value = [
        'dashboard:view',
        'video:list', 'video:add', 'video:edit',
        'category:list', 'category:add', 'category:edit'
      ]
    } else if (role.id === '4') {
      // 审核员拥有审核权限
      checkedKeys.value = [
        'dashboard:view',
        'video:list', 'video:review'
      ]
    } else {
      // 普通用户没有后台权限
      checkedKeys.value = []
    }
    
    // 展开所有节点
    expandedKeys.value = collectAllParentIds(permissionsTree.value)
    permissionLoading.value = false
    permissionDialogVisible.value = true
  }, 300)
}

// 方法：收集所有权限ID
function collectAllPermissionIds(tree) {
  let ids = []
  tree.forEach(node => {
    if (node.children && node.children.length > 0) {
      ids = ids.concat(collectAllPermissionIds(node.children))
    } else {
      ids.push(node.id)
    }
  })
  return ids
}

// 方法：收集所有父节点ID
function collectAllParentIds(tree) {
  let ids = []
  tree.forEach(node => {
    if (node.children && node.children.length > 0) {
      ids.push(node.id)
      ids = ids.concat(collectAllParentIds(node.children))
    }
  })
  return ids
}

// 方法：处理权限变更
function handlePermissionChange() {
  // 权限变更时的处理逻辑
}

// 方法：处理全选权限
function handleSelectAllPermissions() {
  checkedKeys.value = collectAllPermissionIds(permissionsTree.value)
}

// 方法：处理取消全选权限
function handleDeselectAllPermissions() {
  checkedKeys.value = []
}

// 方法：处理保存权限
function handleSavePermissions() {
  console.log('保存权限:', permissionRole.name, checkedKeys.value)
  showSuccess('权限设置保存成功')
  permissionDialogVisible.value = false
}

// 方法：处理关闭权限对话框
function handleClosePermissionDialog() {
  permissionDialogVisible.value = false
  checkedKeys.value = []
  expandedKeys.value = []
}

// 方法：处理角色用户分配
function handleUserAssignment(role) {
  Object.assign(currentRole, role)
  showAssign.value = true
}

// 方法：处理搜索分配用户
function handleAssignSearch() {
  console.log('搜索分配用户:', assignSearchKeyword.value)
}

// 方法：处理重置分配搜索
function handleAssignReset() {
  assignSearchKeyword.value = ''
}

// 方法：处理分配用户选择变更
function handleAssignSelectionChange(selection) {
  selectedAssignedUsers.value = selection
}

// 方法：处理添加用户到角色
function handleAddUserToRole() {
  addUserSearchKeyword.value = ''
  selectedAddUsers.value = []
  addUserDialogVisible.value = true
}

// 方法：处理搜索添加用户
function handleAddUserSearch() {
  console.log('搜索添加用户:', addUserSearchKeyword.value)
}

// 方法：处理重置添加用户搜索
function handleAddUserReset() {
  addUserSearchKeyword.value = ''
}

// 方法：处理添加用户选择变更
function handleAddUserSelectionChange(selection) {
  selectedAddUsers.value = selection
}

// 方法：处理添加选中用户
function handleAddSelectedUsers() {
  if (selectedAddUsers.value.length === 0) {
    showWarning('请选择要添加的用户')
    return
  }
  
  // 确保角色用户数组存在
  if (!roleUsers[currentRole.id]) {
    roleUsers[currentRole.id] = []
  }
  
  // 添加新用户
  selectedAddUsers.value.forEach(user => {
    if (!roleUsers[currentRole.id].some(u => u.id === user.id)) {
      roleUsers[currentRole.id].push(user)
    }
  })
  
  showSuccess(`成功添加 ${selectedAddUsers.value.length} 个用户到角色`)
  addUserDialogVisible.value = false
  selectedAddUsers.value = []
}

// 方法：处理关闭添加用户对话框
function handleCloseAddUserDialog() {
  addUserDialogVisible.value = false
  selectedAddUsers.value = []
}

// 方法：处理从角色移除用户
function handleRemoveUserFromRole(user) {
  ElMessageBox.confirm(
    `确定要将用户 "${user.nickname}" 从角色中移除吗？`,
    '移除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    if (roleUsers[currentRole.id]) {
      const index = roleUsers[currentRole.id].findIndex(u => u.id === user.id)
      if (index !== -1) {
        roleUsers[currentRole.id].splice(index, 1)
        showSuccess('用户移除成功')
      }
    }
  }).catch(() => {
    // 取消操作
  })
}

// 方法：处理批量移除用户
function handleRemoveSelectedUsers() {
  if (selectedAssignedUsers.value.length === 0) {
    showWarning('请选择要移除的用户')
    return
  }
  
  ElMessageBox.confirm(
    `确定要移除选中的 ${selectedAssignedUsers.value.length} 个用户吗？`,
    '批量移除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    if (roleUsers[currentRole.id]) {
      selectedAssignedUsers.value.forEach(user => {
        const index = roleUsers[currentRole.id].findIndex(u => u.id === user.id)
        if (index !== -1) {
          roleUsers[currentRole.id].splice(index, 1)
        }
      })
      selectedAssignedUsers.value = []
      showSuccess('用户批量移除成功')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 方法：处理行右键菜单
function handleRowContextMenu(row, column, event) {
  event.preventDefault()
  Object.assign(contextMenuRole, row)
  contextMenuVisible.value = true
}

// 方法：处理右键菜单编辑
function handleContextEdit() {
  contextMenuVisible.value = false
  handleEditRole(contextMenuRole)
}

// 方法：处理右键菜单权限设置
function handleContextPermission() {
  contextMenuVisible.value = false
  handlePermission(contextMenuRole)
}

// 方法：处理右键菜单状态切换
function handleContextToggleStatus() {
  contextMenuVisible.value = false
  handleToggleStatus(contextMenuRole)
}

// 方法：处理右键菜单删除
function handleContextDelete() {
  contextMenuVisible.value = false
  handleDeleteRole(contextMenuRole)
}

// 组件挂载时的处理
onMounted(() => {
  // 初始化数据加载逻辑
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
})

// 对话框标题需要是响应式的
const dialogTitle = ref('添加角色')
</script>

<style scoped>
.role-management-container {
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
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.role-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* 分配用户相关样式 */
.assign-card {
  margin-top: 20px;
}

.assign-search {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.assign-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 权限对话框样式 */
.permission-dialog {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color);
}

.permission-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.permission-actions {
  display: flex;
  gap: 8px;
}

.permission-content {
  flex: 1;
  overflow-y: auto;
}

.permission-tree {
  min-height: 400px;
}

/* 添加用户对话框样式 */
.add-user-dialog {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.add-user-search {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.add-user-footer {
  margin-top: 10px;
}

.add-user-pagination {
  text-align: right;
}

/* 右键菜单样式 */
.text-danger {
  color: var(--el-color-danger) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .search-filter,
  .assign-search,
  .add-user-search {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .permission-dialog {
    height: 400px;
  }
  
  .add-user-dialog {
    height: 300px;
  }
}
</style>