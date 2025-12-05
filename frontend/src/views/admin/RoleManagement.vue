<template>
    <div class="role-management-container">
        <!-- 删除重复的面包屑导航，由AdminLayout统一提供 -->
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
                            <el-table-column prop="roleId" label="角色ID" width="80" />
                            <el-table-column prop="roleName" label="角色名称" min-width="150">
                                <template #default="scope">
                                    <span class="role-name">{{ scope.row.roleName }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="roleCode" label="角色代码" min-width="120" />
                            <el-table-column prop="description" label="角色描述" min-width="200" />
                            <el-table-column prop="status" label="状态" width="100">
                                <template #default="scope">
                                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                                        {{ scope.row.status === 1 ? '启用' : '禁用' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="createTime" label="创建时间" width="180">
                                <template #default="scope">
                                    {{ formatDate(scope.row.createTime) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="updateTime" label="更新时间" width="180">
                                <template #default="scope">
                                    {{ formatDate(scope.row.updateTime) }}
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="400" fixed="right">
                                <template #default="scope">
                                    <div class="action-buttons">
                                        <el-button type="primary" size="small" @click="handleEditRole(scope.row)">
                                            <el-icon>
                                                <Edit />
                                            </el-icon>
                                            编辑
                                        </el-button>
                                        <el-button type="success" size="small" @click="handlePermission(scope.row)" style="margin-left: 5px;">
                                            <el-icon>
                                                <Key />
                                            </el-icon>
                                            权限设置
                                        </el-button>
                                        <el-button :type="scope.row.status === 1 ? 'warning' : 'success'" size="small"
                                            @click="handleToggleStatus(scope.row)" style="margin-left: 5px;">
                                            <el-icon>
                                                <component :is="scope.row.status === 1 ? SwitchButton : VideoPause" />
                                            </el-icon>
                                            {{ scope.row.status === 1 ? '禁用' : '启用' }}
                                        </el-button>
                                        <el-button type="danger" size="small" @click="handleDeleteRole(scope.row)"
                                            :disabled="isDefaultRole(scope.row)" style="margin-left: 5px;">
                                            <el-icon>
                                                <Delete />
                                            </el-icon>
                                            删除
                                        </el-button>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>

                        <!-- 分页 -->
                        <el-pagination v-model:current-page="pagination.currentPage"
                            v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]"
                            layout="total, sizes, prev, pager, next, jumper" :total="rolesTotal"
                            @size-change="handleSizeChange" @current-change="handleCurrentChange"
                            class="pagination" />
                    </el-card>

                    <!-- 角色分配表格 -->
                    <el-card class="assign-card" v-if="showAssign">
                        <template #header>
                            <div class="card-header">
                                <span>{{ currentRole.roleName }} - 人员分配</span>
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
                            <el-table-column prop="userId" label="用户ID" width="80" />
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
                <el-form-item label="角色代码" prop="code">
                    <el-input v-model="formData.code" placeholder="请输入角色代码" :disabled="!!formData.id" />
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
                    <h3>{{ permissionRole.roleName }} - 权限配置</h3>
                    <div class="permission-actions">
                        <el-button size="small" type="primary" @click="handleSelectAllPermissions">
                            全选
                        </el-button>
                        <el-button size="small" @click="handleDeselectAllPermissions">
                            取消全选
                        </el-button>
                        <el-button size="small" type="success" @click="handleSavePermissions">
                            <el-icon>
                                <Check />
                            </el-icon>
                            保存权限
                        </el-button>
                    </div>
                </div>

                <div class="permission-content">
                    <el-tree v-loading="permissionLoading" :data="permissionsTree" show-checkbox node-key="permissionId"
    :default-expanded-keys="expandedKeys" :default-checked-keys="checkedKeys"
    :props="permissionTreeProps" @check-change="handlePermissionChange" class="permission-tree" />
                    <!-- 添加调试信息 -->
                    <div v-if="!permissionLoading && (!permissionsTree || permissionsTree.length === 0)" class="empty-tree">
                        权限树数据为空
                    </div>
                    <div v-if="permissionsTree && permissionsTree.length > 0" class="tree-info">
                        权限树节点数: {{ permissionsTree.length }}
                    </div>
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
        <el-dropdown
            :model-value="contextMenuVisible"
            trigger="manual"
            :show-timeout="0"
            :hide-on-click="false"
            ref="dropdownRef"
        >
            <span class="hidden-trigger" style="display: none;"></span>
            <template #dropdown>
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
                        <el-icon>{{ contextMenuRole.status === 1 ? SwitchButton : VideoPause }}</el-icon>
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
            </template>
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
  VideoPause,
  Remove,
  Check
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccess, showWarning } from '../../utils/message.js'
import { 
  getRolesList, 
  getAllRoles, 
  addRole, 
  updateRole, 
  deleteRole, 
  batchDeleteRoles,
  getRolePermissions,
  assignRolePermissions,
  getRoleUsers,
  addUsersToRole,
  removeUsersFromRole
} from '../../api/modules/roles.js'
import { getPermissionsTree } from '../../api/modules/permissions.js'
import { usersAPI } from '../../api/modules/users.js'


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
const dropdownRef = ref(null)
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
  code: '',
  description: '',
  status: 1
})

const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 50, message: '角色名称长度应在1-50个字符之间', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { min: 1, max: 50, message: '角色代码长度应在1-50个字符之间', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '角色描述不能超过200个字符', trigger: 'blur' }
  ]
}

const permissionTreeProps = {
  children: 'children',
  label: 'permissionName'
}

// 角色数据
const roles = ref([])
const rolesTotal = ref(0)

// 权限树数据
const permissionsTree = ref([])

// 用户数据
const users = ref([])

// 角色用户关联数据
const roleUsers = reactive({})

// 计算属性：过滤后的角色列表
const filteredRoles = computed(() => {
  if (!searchKeyword.value) {
    return roles.value
  }
  return roles.value.filter(role => 
    role.roleName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    role.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 计算属性：角色分配的用户列表
const assignedUsers = computed(() => {
  if (!currentRole.roleId) return []
  
  let userList = roleUsers[currentRole.roleId] || []
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
  if (!currentRole.roleId) return []
  
  const assignedUserIds = (roleUsers[currentRole.roleId] || []).map(user => user.userId)
  let userList = users.value.filter(user => !assignedUserIds.includes(user.userId))
  
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
  // 根据选择的菜单项跳转到相应页面
}

// 方法：获取角色列表
async function fetchRoles() {
  loading.value = true
  try {
    const params = {
      current: pagination.currentPage,
      size: pagination.pageSize
    }
    
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    
    const response = await getRolesList(params)
    roles.value = response.records || []
    rolesTotal.value = response.total || 0
  } catch (error) {
    showWarning('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 方法：获取权限树
async function fetchPermissionsTree() {
  try {
    const response = await getPermissionsTree()
    permissionsTree.value = response || []
  } catch (error) {
    showWarning('获取权限树失败')
  }
}

// 方法：获取用户列表
async function fetchUsers() {
  try {
    const response = await usersAPI.getUsers({ current: 1, size: 1000 })
    users.value = response.records || []
  } catch (error) {
    showWarning('获取用户列表失败')
  }
}

// 方法：获取角色用户关联
async function fetchRoleUsers(roleId) {
  if (!roleId) return
  
  try {
    const response = await getRoleUsers(roleId)
    roleUsers[roleId] = response || []
  } catch (error) {
    showWarning('获取角色用户失败')
  }
}

// 方法：获取角色权限
async function fetchRolePermissions(roleId) {
  if (!roleId) return
  
  try {
    const response = await getRolePermissions(roleId)
    return response || []
  } catch (error) {
    showWarning('获取角色权限失败')
    return []
  }
}

// 方法：处理搜索
function handleSearch() {
  pagination.currentPage = 1
  fetchRoles()
}

// 方法：处理重置
function handleReset() {
  searchKeyword.value = ''
  pagination.currentPage = 1
  fetchRoles()
}

// 方法：处理分页大小变化
function handleSizeChange(size) {
  pagination.pageSize = size
  pagination.currentPage = 1
  fetchRoles()
}

// 方法：处理当前页变化
function handleCurrentChange(page) {
  pagination.currentPage = page
  fetchRoles()
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
  formData.code = ''
  formData.description = ''
  formData.status = 1
  dialogVisible.value = true
}

// 方法：处理编辑角色
function handleEditRole(role) {
  dialogTitle.value = '编辑角色'
  formData.id = role.roleId
  formData.name = role.roleName
  formData.code = role.roleCode
  formData.description = role.description
  formData.status = role.status
  dialogVisible.value = true
}

// 方法：处理提交表单
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  try {
    const roleData = {
      roleName: formData.name,
      roleCode: formData.code,
      description: formData.description,
      status: formData.status
    }
    
    if (formData.id) {
      // 编辑现有角色
      await updateRole(formData.id, roleData)
      showSuccess('角色编辑成功')
    } else {
      // 添加新角色
      await addRole(roleData)
      showSuccess('角色添加成功')
    }
    
    dialogVisible.value = false
    fetchRoles() // 重新获取角色列表
  } catch (error) {
    console.error('保存角色失败:', error)
    showWarning('保存角色失败')
  }
}

// 方法：处理关闭对话框
function handleCloseDialog() {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

// 方法：处理删除角色
async function handleDeleteRole(role) {
  if (isDefaultRole(role)) {
    showWarning('默认角色不可删除')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.roleName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    await deleteRole(role.roleId)
    showSuccess('角色删除成功')
    fetchRoles() // 重新获取角色列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      showWarning('删除角色失败')
    }
  }
}

// 方法：处理批量删除
async function handleDeleteSelected() {
  if (selectedRoles.value.length === 0) {
    showWarning('请选择要删除的角色')
    return
  }
  
  const defaultRoles = selectedRoles.value.filter(role => isDefaultRole(role))
  if (defaultRoles.length > 0) {
    showWarning('选择的角色中包含默认角色，默认角色不可删除')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRoles.value.length} 个角色吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    const roleIds = selectedRoles.value.map(role => role.roleId)
    await batchDeleteRoles(roleIds)
    showSuccess('角色批量删除成功')
    selectedRoles.value = []
    fetchRoles() // 重新获取角色列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除角色失败:', error)
      showWarning('批量删除角色失败')
    }
  }
}

// 方法：处理角色状态切换
async function handleToggleStatus(role) {
  if (isDefaultRole(role)) {
    showWarning('默认角色不可修改状态')
    return
  }
  
  const newStatus = role.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${statusText}角色 "${role.roleName}" 吗？`,
      `${statusText}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: newStatus === 1 ? 'success' : 'warning'
      }
    )
    
    // 调用API更新状态
    await updateRoleStatus(role.roleId, newStatus)
    
    // 更新本地数据
    const index = roles.value.findIndex(r => r.roleId === role.roleId)
    if (index !== -1) {
      roles.value[index].status = newStatus
      roles.value[index].updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
      showSuccess(`角色${statusText}成功`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改角色状态失败:', error)
      showWarning('修改角色状态失败')
    }
  }
}

// 方法：处理权限设置
async function handlePermission(role) {
  Object.assign(permissionRole, role)
  permissionDialogVisible.value = true
  permissionLoading.value = true
  
  try {
    // 获取角色的权限
    const rolePermissions = await getRolePermissions(role.roleId)
    
    // 获取权限树
    await fetchPermissionsTree()
    
    // 展开所有父节点
    expandedKeys.value = collectAllParentIds(permissionsTree.value)
    
    // 根据角色权限设置选中状态
    if (rolePermissions && rolePermissions.length > 0) {
      checkedKeys.value = rolePermissions
    } else {
      checkedKeys.value = []
    }
    
    permissionLoading.value = false
  } catch (error) {
    showWarning('获取角色权限失败')
    permissionLoading.value = false
  }
}

// 方法：收集所有权限ID
function collectAllPermissionIds(tree) {
  let ids = []
  tree.forEach(node => {
    if (node.children && node.children.length > 0) {
      ids = ids.concat(collectAllPermissionIds(node.children))
    } else {
      ids.push(node.permissionId)
    }
  })
  return ids
}

// 方法：收集所有父节点ID
function collectAllParentIds(tree) {
  let ids = []
  tree.forEach(node => {
    if (node.children && node.children.length > 0) {
      ids.push(node.permissionId)
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
async function handleSavePermissions() {
  if (!permissionRole.roleId) return
  
  try {
    // 调用API保存角色权限
    await assignRolePermissions(permissionRole.roleId, checkedKeys.value)
    
    showSuccess('权限设置保存成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('保存角色权限失败:', error)
    showWarning('保存角色权限失败')
  }
}

// 方法：处理关闭权限对话框
function handleClosePermissionDialog() {
  permissionDialogVisible.value = false
  checkedKeys.value = []
  expandedKeys.value = []
}

// 方法：处理角色用户分配
async function handleUserAssignment(role) {
  Object.assign(currentRole, role)
  showAssign.value = true
  assignLoading.value = true
  
  try {
    // 获取角色用户关联
    await fetchRoleUsers(role.roleId)
    
    // 获取用户列表
    await fetchUsers()
    
    assignLoading.value = false
  } catch (error) {
    console.error('获取角色用户关联失败:', error)
    showWarning('获取角色用户关联失败')
    assignLoading.value = false
  }
}

// 方法：处理搜索分配用户
function handleAssignSearch() {
  // 搜索分配用户的处理逻辑
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
  // 搜索添加用户的处理逻辑
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
async function handleAddSelectedUsers() {
  if (selectedAddUsers.value.length === 0) {
    showWarning('请选择要添加的用户')
    return
  }
  
  try {
    const userIds = selectedAddUsers.value.map(user => user.userId)
    await addUsersToRole(currentRole.roleId, userIds)
    
    showSuccess(`成功添加 ${selectedAddUsers.value.length} 个用户到角色`)
    selectedAddUsers.value = []
    addUserDialogVisible.value = false
    
    // 重新获取角色用户关联
    await fetchRoleUsers(currentRole.roleId)
  } catch (error) {
    console.error('添加用户到角色失败:', error)
    showWarning('添加用户到角色失败')
  }
}

// 方法：处理关闭添加用户对话框
function handleCloseAddUserDialog() {
  addUserDialogVisible.value = false
  selectedAddUsers.value = []
}

// 方法：处理从角色移除用户
async function handleRemoveUserFromRole(user) {
  try {
    await ElMessageBox.confirm(
      `确定要将用户 "${user.nickname}" 从角色中移除吗？`,
      '移除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await removeUsersFromRole(currentRole.roleId, [user.userId])
    showSuccess('用户移除成功')
    
    // 重新获取角色用户关联
    await fetchRoleUsers(currentRole.roleId)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除用户失败:', error)
      showWarning('移除用户失败')
    }
  }
}

// 方法：处理批量移除用户
async function handleRemoveSelectedUsers() {
  if (selectedAssignedUsers.value.length === 0) {
    showWarning('请选择要移除的用户')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要移除选中的 ${selectedAssignedUsers.value.length} 个用户吗？`,
      '批量移除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const userIds = selectedAssignedUsers.value.map(user => user.userId)
    await removeUsersFromRole(currentRole.roleId, userIds)
    
    showSuccess(`成功移除 ${selectedAssignedUsers.value.length} 个用户`)
    selectedAssignedUsers.value = []
    
    // 重新获取角色用户关联
    await fetchRoleUsers(currentRole.roleId)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量移除用户失败:', error)
      showWarning('批量移除用户失败')
    }
  }
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
  // 初始化数据加载
  fetchRoles()
  fetchPermissionsTree()
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

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 5px;
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

.empty-tree {
  padding: 20px;
  text-align: center;
  color: var(--el-color-warning);
  background-color: var(--el-color-warning-light-9);
  border-radius: 4px;
  margin-top: 10px;
}

.tree-info {
  padding: 10px;
  text-align: center;
  color: var(--el-color-success);
  background-color: var(--el-color-success-light-9);
  border-radius: 4px;
  margin-top: 10px;
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