<template>
  <div class="permission-management-container">
    <div class="management-actions">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索权限名称或描述" 
          @keyup.enter="searchPermissions"
        >
        <button class="search-btn" @click="searchPermissions">
          <i class="icon-search"></i>
        </button>
      </div>
      
      <div class="action-buttons">
        <button class="add-btn" @click="showAddDialog">
          <i class="icon-plus"></i> 添加权限
        </button>
        <button class="refresh-btn" @click="refreshPermissions">
          <i class="icon-refresh"></i> 刷新
        </button>
      </div>
    </div>
    
    <div class="permission-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'list' }" 
        @click="activeTab = 'list'"
      >
        权限列表
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'role-permissions' }" 
        @click="activeTab = 'role-permissions'"
      >
        角色权限分配
      </div>
    </div>
    
    <!-- 权限列表 -->
    <div v-if="activeTab === 'list'" class="permission-list">
      <div class="list-header">
        <div class="filter-options">
          <select v-model="permissionType" @change="filterPermissions">
            <option value="">全部类型</option>
            <option value="menu">菜单权限</option>
            <option value="button">按钮权限</option>
            <option value="api">API权限</option>
          </select>
          <select v-model="statusFilter" @change="filterPermissions">
            <option value="">全部状态</option>
            <option value="1">启用</option>
            <option value="0">禁用</option>
          </select>
        </div>
      </div>
      
      <div class="permission-table">
        <table>
          <thead>
            <tr>
              <th width="50">ID</th>
              <th width="200">权限名称</th>
              <th width="100">权限类型</th>
              <th width="150">权限标识</th>
              <th>描述</th>
              <th width="100">状态</th>
              <th width="150">创建时间</th>
              <th width="150">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="permission in filteredPermissions" :key="permission.id">
              <td>{{ permission.id }}</td>
              <td>{{ permission.name }}</td>
              <td>
                <span class="type-tag" :class="permission.type">
                  {{ getTypeLabel(permission.type) }}
                </span>
              </td>
              <td>{{ permission.code }}</td>
              <td>{{ permission.description }}</td>
              <td>
                <span class="status-tag" :class="permission.status ? 'enabled' : 'disabled'">
                  {{ permission.status ? '启用' : '禁用' }}
                </span>
              </td>
              <td>{{ formatTime(permission.createTime) }}</td>
              <td>
                <div class="action-buttons-cell">
                  <button class="edit-btn" @click="editPermission(permission)">编辑</button>
                  <button class="delete-btn" @click="deletePermission(permission.id)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination">
        <div class="pagination-info">
          显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalItems) }} 条，共 {{ totalItems }} 条
        </div>
        <div class="pagination-controls">
          <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
        </div>
      </div>
    </div>
    
    <!-- 角色权限分配 -->
    <div v-if="activeTab === 'role-permissions'" class="role-permissions">
      <div class="role-selector">
        <label>选择角色:</label>
        <select v-model="selectedRoleId" @change="loadRolePermissions">
          <option value="">请选择角色</option>
          <option v-for="role in roles" :key="role.id" :value="role.id">
            {{ role.name }}
          </option>
        </select>
      </div>
      
      <div v-if="selectedRoleId" class="permissions-tree">
        <div class="tree-header">
          <h3>角色权限分配</h3>
          <div class="tree-actions">
            <button class="expand-all-btn" @click="expandAll">全部展开</button>
            <button class="collapse-all-btn" @click="collapseAll">全部收起</button>
            <button class="save-btn" @click="saveRolePermissions">保存权限</button>
          </div>
        </div>
        
        <div class="tree-container">
          <div class="tree-node" v-for="node in permissionTree" :key="node.id">
            <div class="node-content" @click="toggleNode(node)">
              <input 
                type="checkbox" 
                :checked="isNodeSelected(node)" 
                @change="toggleNodeSelection(node)"
                @click.stop
              >
              <span class="node-icon" :class="{ expanded: node.expanded }">
                <i class="icon-chevron-right"></i>
              </span>
              <span class="node-label">{{ node.name }}</span>
              <span class="node-type">{{ getTypeLabel(node.type) }}</span>
            </div>
            
            <div v-if="node.expanded && node.children" class="node-children">
              <div 
                class="tree-node child-node" 
                v-for="child in node.children" 
                :key="child.id"
              >
                <div class="node-content" @click="toggleNode(child)">
                  <input 
                    type="checkbox" 
                    :checked="isNodeSelected(child)" 
                    @change="toggleNodeSelection(child)"
                    @click.stop
                  >
                  <span class="node-icon" :class="{ expanded: child.expanded }">
                    <i class="icon-chevron-right"></i>
                  </span>
                  <span class="node-label">{{ child.name }}</span>
                  <span class="node-type">{{ getTypeLabel(child.type) }}</span>
                </div>
                
                <div v-if="child.expanded && child.children" class="node-children">
                  <div 
                    class="tree-node grandchild-node" 
                    v-for="grandchild in child.children" 
                    :key="grandchild.id"
                  >
                    <div class="node-content">
                      <input 
                        type="checkbox" 
                        :checked="isNodeSelected(grandchild)" 
                        @change="toggleNodeSelection(grandchild)"
                      >
                      <span class="node-label">{{ grandchild.name }}</span>
                      <span class="node-type">{{ getTypeLabel(grandchild.type) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑权限对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ isEditing ? '编辑权限' : '添加权限' }}</h3>
          <button class="close-btn" @click="closeDialog">
            <i class="icon-close"></i>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>权限名称</label>
            <input type="text" v-model="permissionForm.name" placeholder="请输入权限名称">
          </div>
          <div class="form-group">
            <label>权限类型</label>
            <select v-model="permissionForm.type">
              <option value="menu">菜单权限</option>
              <option value="button">按钮权限</option>
              <option value="api">API权限</option>
            </select>
          </div>
          <div class="form-group">
            <label>权限标识</label>
            <input type="text" v-model="permissionForm.code" placeholder="请输入权限标识">
          </div>
          <div class="form-group">
            <label>父级权限</label>
            <select v-model="permissionForm.parentId">
              <option value="0">无（顶级权限）</option>
              <option v-for="parent in parentPermissions" :key="parent.id" :value="parent.id">
                {{ parent.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>权限描述</label>
            <textarea v-model="permissionForm.description" placeholder="请输入权限描述"></textarea>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="permissionForm.status">
              <option value="1">启用</option>
              <option value="0">禁用</option>
            </select>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeDialog">取消</button>
          <button class="confirm-btn" @click="savePermission">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 标签页
const activeTab = ref('list')

// 搜索和筛选
const searchKeyword = ref('')
const permissionType = ref('')
const statusFilter = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 权限数据
const permissions = ref([])
const filteredPermissions = ref([])

// 角色权限分配
const selectedRoleId = ref('')
const roles = ref([])
const permissionTree = ref([])
const selectedPermissions = ref([])

// 对话框
const showDialog = ref(false)
const isEditing = ref(false)
const permissionForm = ref({
  id: null,
  name: '',
  type: 'menu',
  code: '',
  parentId: 0,
  description: '',
  status: 1
})

// 计算属性
const totalItems = computed(() => filteredPermissions.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
const parentPermissions = computed(() => {
  return permissions.value.filter(p => p.type === 'menu')
})

// 页面加载时初始化
onMounted(() => {
  loadPermissions()
  loadRoles()
})

// 加载权限列表
const loadPermissions = async () => {
  try {
    // 这里应该调用API获取实际数据
    // 暂时使用模拟数据
    permissions.value = [
      { id: 1, name: '首页', type: 'menu', code: 'home', parentId: 0, description: '系统首页', status: 1, createTime: new Date('2023-01-01') },
      { id: 2, name: '工作台', type: 'menu', code: 'workbench', parentId: 1, description: '工作台页面', status: 1, createTime: new Date('2023-01-02') },
      { id: 3, name: '仪表盘', type: 'menu', code: 'dashboard', parentId: 0, description: '数据仪表盘', status: 1, createTime: new Date('2023-01-03') },
      { id: 4, name: '分析页', type: 'menu', code: 'analysis', parentId: 3, description: '数据分析页面', status: 1, createTime: new Date('2023-01-04') },
      { id: 5, name: '统计页', type: 'menu', code: 'statistics', parentId: 3, description: '数据统计页面', status: 1, createTime: new Date('2023-01-05') },
      { id: 6, name: '用户管理', type: 'menu', code: 'users', parentId: 0, description: '用户管理页面', status: 1, createTime: new Date('2023-01-06') },
      { id: 7, name: '角色管理', type: 'menu', code: 'roles', parentId: 6, description: '角色管理页面', status: 1, createTime: new Date('2023-01-07') },
      { id: 8, name: '权限管理', type: 'menu', code: 'permissions', parentId: 6, description: '权限管理页面', status: 1, createTime: new Date('2023-01-08') },
      { id: 9, name: '菜单管理', type: 'menu', code: 'menus', parentId: 6, description: '菜单管理页面', status: 1, createTime: new Date('2023-01-09') },
      { id: 10, name: '添加用户', type: 'button', code: 'user:add', parentId: 6, description: '添加用户按钮', status: 1, createTime: new Date('2023-01-10') },
      { id: 11, name: '编辑用户', type: 'button', code: 'user:edit', parentId: 6, description: '编辑用户按钮', status: 1, createTime: new Date('2023-01-11') },
      { id: 12, name: '删除用户', type: 'button', code: 'user:delete', parentId: 6, description: '删除用户按钮', status: 1, createTime: new Date('2023-01-12') },
      { id: 13, name: '用户列表API', type: 'api', code: '/api/users', parentId: 6, description: '获取用户列表API', status: 1, createTime: new Date('2023-01-13') },
    ]
    
    filterPermissions()
  } catch (error) {
    console.error('加载权限列表失败:', error)
  }
}

// 加载角色列表
const loadRoles = async () => {
  try {
    // 这里应该调用API获取实际数据
    // 暂时使用模拟数据
    roles.value = [
      { id: 1, name: '管理员' },
      { id: 2, name: '审核员' },
      { id: 3, name: '普通用户' }
    ]
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

// 加载角色权限
const loadRolePermissions = async () => {
  if (!selectedRoleId.value) return
  
  try {
    // 这里应该调用API获取实际数据
    // 暂时使用模拟数据
    selectedPermissions.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    
    // 构建权限树
    buildPermissionTree()
  } catch (error) {
    console.error('加载角色权限失败:', error)
  }
}

// 构建权限树
const buildPermissionTree = () => {
  const tree = []
  const map = {}
  
  // 创建映射
  permissions.value.forEach(permission => {
    map[permission.id] = {
      ...permission,
      children: [],
      expanded: false
    }
  })
  
  // 构建树结构
  permissions.value.forEach(permission => {
    if (permission.parentId === 0) {
      tree.push(map[permission.id])
    } else if (map[permission.parentId]) {
      map[permission.parentId].children.push(map[permission.id])
    }
  })
  
  permissionTree.value = tree
}

// 筛选权限
const filterPermissions = () => {
  let result = [...permissions.value]
  
  // 搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(keyword) || 
      p.description.toLowerCase().includes(keyword)
    )
  }
  
  // 类型筛选
  if (permissionType.value) {
    result = result.filter(p => p.type === permissionType.value)
  }
  
  // 状态筛选
  if (statusFilter.value !== '') {
    result = result.filter(p => p.status === parseInt(statusFilter.value))
  }
  
  filteredPermissions.value = result
  currentPage.value = 1
}

// 搜索权限
const searchPermissions = () => {
  filterPermissions()
}

// 刷新权限列表
const refreshPermissions = () => {
  loadPermissions()
}

// 显示添加权限对话框
const showAddDialog = () => {
  isEditing.value = false
  permissionForm.value = {
    id: null,
    name: '',
    type: 'menu',
    code: '',
    parentId: 0,
    description: '',
    status: 1
  }
  showDialog.value = true
}

// 编辑权限
const editPermission = (permission) => {
  isEditing.value = true
  permissionForm.value = { ...permission }
  showDialog.value = true
}

// 删除权限
const deletePermission = async (id) => {
  if (!confirm('确定要删除此权限吗？')) return
  
  try {
    // 这里应该调用API删除权限
    // 暂时只更新本地数据
    permissions.value = permissions.value.filter(p => p.id !== id)
    filterPermissions()
  } catch (error) {
    console.error('删除权限失败:', error)
  }
}

// 保存权限
const savePermission = async () => {
  try {
    // 这里应该调用API保存权限
    // 暂时只更新本地数据
    if (isEditing.value) {
      const index = permissions.value.findIndex(p => p.id === permissionForm.value.id)
      if (index !== -1) {
        permissions.value[index] = { ...permissionForm.value }
      }
    } else {
      const newId = Math.max(...permissions.value.map(p => p.id)) + 1
      permissions.value.push({
        ...permissionForm.value,
        id: newId,
        createTime: new Date()
      })
    }
    
    filterPermissions()
    closeDialog()
  } catch (error) {
    console.error('保存权限失败:', error)
  }
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
}

// 切换节点展开状态
const toggleNode = (node) => {
  node.expanded = !node.expanded
}

// 全部展开
const expandAll = () => {
  const expandNodes = (nodes) => {
    nodes.forEach(node => {
      node.expanded = true
      if (node.children) {
        expandNodes(node.children)
      }
    })
  }
  expandNodes(permissionTree.value)
}

// 全部收起
const collapseAll = () => {
  const collapseNodes = (nodes) => {
    nodes.forEach(node => {
      node.expanded = false
      if (node.children) {
        collapseNodes(node.children)
      }
    })
  }
  collapseNodes(permissionTree.value)
}

// 检查节点是否被选中
const isNodeSelected = (node) => {
  return selectedPermissions.value.includes(node.id)
}

// 切换节点选中状态
const toggleNodeSelection = (node) => {
  const index = selectedPermissions.value.indexOf(node.id)
  if (index === -1) {
    selectedPermissions.value.push(node.id)
    // 选中父节点时，也选中所有子节点
    if (node.children) {
      selectChildren(node.children)
    }
  } else {
    selectedPermissions.value.splice(index, 1)
    // 取消选中父节点时，也取消所有子节点
    if (node.children) {
      deselectChildren(node.children)
    }
  }
}

// 选中子节点
const selectChildren = (children) => {
  children.forEach(child => {
    if (!selectedPermissions.value.includes(child.id)) {
      selectedPermissions.value.push(child.id)
    }
    if (child.children) {
      selectChildren(child.children)
    }
  })
}

// 取消选中子节点
const deselectChildren = (children) => {
  children.forEach(child => {
    const index = selectedPermissions.value.indexOf(child.id)
    if (index !== -1) {
      selectedPermissions.value.splice(index, 1)
    }
    if (child.children) {
      deselectChildren(child.children)
    }
  })
}

// 保存角色权限
const saveRolePermissions = async () => {
  try {
    // 这里应该调用API保存角色权限
    console.log('保存角色权限:', selectedRoleId.value, selectedPermissions.value)
    alert('权限保存成功')
  } catch (error) {
    console.error('保存角色权限失败:', error)
  }
}

// 分页控制
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// 获取类型标签
const getTypeLabel = (type) => {
  const labels = {
    menu: '菜单',
    button: '按钮',
    api: 'API'
  }
  return labels[type] || type
}

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped>
.permission-management-container {
  padding: 20px;
}

.management-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ddd;
  overflow: hidden;
}

.search-box input {
  border: none;
  padding: 8px 12px;
  outline: none;
  width: 250px;
}

.search-btn {
  background: none;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.add-btn,
.refresh-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.add-btn {
  background: #409eff;
  color: white;
}

.refresh-btn {
  background: #f0f0f0;
  color: #666;
}

.add-btn i,
.refresh-btn i {
  margin-right: 5px;
}

.permission-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tab-item {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab-item.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filter-options {
  display: flex;
  gap: 10px;
}

.filter-options select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.permission-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.permission-table table {
  width: 100%;
  border-collapse: collapse;
}

.permission-table th,
.permission-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.permission-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #333;
}

.permission-table tr:hover {
  background-color: #f5f7fa;
}

.type-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.type-tag.menu {
  background-color: #409eff;
}

.type-tag.button {
  background-color: #67c23a;
}

.type-tag.api {
  background-color: #e6a23c;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-tag.enabled {
  background-color: #f0f9ff;
  color: #67c23a;
}

.status-tag.disabled {
  background-color: #fef0f0;
  color: #f56c6c;
}

.action-buttons-cell {
  display: flex;
  gap: 5px;
}

.edit-btn,
.delete-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn {
  background-color: #ecf5ff;
  color: #409eff;
}

.delete-btn {
  background-color: #fef0f0;
  color: #f56c6c;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-controls button {
  padding: 4px 8px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-controls button:not(:disabled):hover {
  background-color: #f5f7fa;
  border-color: #409eff;
  color: #409eff;
}

.role-selector {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.role-selector label {
  margin-right: 10px;
  font-weight: 500;
}

.role-selector select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  width: 200px;
}

.permissions-tree {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tree-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tree-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.tree-actions {
  display: flex;
  gap: 10px;
}

.expand-all-btn,
.collapse-all-btn,
.save-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.expand-all-btn,
.collapse-all-btn {
  background: #f0f0f0;
  color: #666;
}

.save-btn {
  background: #409eff;
  color: white;
}

.tree-container {
  padding: 15px 20px;
  max-height: 500px;
  overflow-y: auto;
}

.tree-node {
  margin-bottom: 5px;
}

.child-node {
  margin-left: 20px;
}

.grandchild-node {
  margin-left: 40px;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
}

.node-content:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
}

.node-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 5px;
  transition: transform 0.2s;
}

.node-icon.expanded {
  transform: rotate(90deg);
}

.node-label {
  flex: 1;
}

.node-type {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: white;
  margin-left: 10px;
}

.node-type.menu {
  background-color: #409eff;
}

.node-type.button {
  background-color: #67c23a;
}

.node-type.api {
  background-color: #e6a23c;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #fff;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 16px;
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.dialog-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.confirm-btn {
  background: #409eff;
  color: white;
}

@media (max-width: 768px) {
  .management-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .permission-tabs {
    overflow-x: auto;
  }
  
  .permission-table {
    overflow-x: auto;
  }
  
  .tree-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .dialog {
    width: 95%;
  }
}
</style>