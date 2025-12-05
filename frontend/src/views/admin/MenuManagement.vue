<template>
  <div class="menu-management-container">
    <div class="management-actions">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索菜单名称" 
          @keyup.enter="searchMenus"
        >
        <button class="search-btn" @click="searchMenus">
          <i class="icon-search"></i>
        </button>
      </div>
      
      <div class="action-buttons">
        <button class="add-btn" @click="showAddDialog">
          <i class="icon-plus"></i> 添加菜单
        </button>
        <button class="expand-all-btn" @click="expandAll">全部展开</button>
        <button class="collapse-all-btn" @click="collapseAll">全部收起</button>
        <button class="refresh-btn" @click="refreshMenus">
          <i class="icon-refresh"></i> 刷新
        </button>
      </div>
    </div>
    
    <div class="menu-tree-container">
      <div class="tree-header">
        <h3>菜单结构</h3>
        <div class="tree-actions">
          <button class="save-order-btn" @click="saveMenuOrder">保存排序</button>
        </div>
      </div>
      
      <div class="menu-tree">
        <div 
          class="tree-node" 
          v-for="node in menuTree" 
          :key="node.id"
          :class="{ 'dragging': isDragging && draggedNode?.id === node.id }"
          draggable="true"
          @dragstart="handleDragStart(node, $event)"
          @dragover="handleDragOver($event)"
          @drop="handleDrop(node, $event)"
          @dragend="handleDragEnd"
        >
          <div class="node-content">
            <div class="node-controls">
              <span class="node-icon" :class="{ expanded: node.expanded }" @click="toggleNode(node)">
                <i class="icon-chevron-right"></i>
              </span>
              <div class="drag-handle">
                <i class="icon-drag"></i>
              </div>
            </div>
            
            <div class="node-info">
              <div class="node-icon-display">
                <i :class="node.icon || 'icon-folder'"></i>
              </div>
              <div class="node-text">
                <div class="node-name">{{ node.name }}</div>
                <div class="node-path">{{ node.path }}</div>
              </div>
            </div>
            
            <div class="node-status">
              <span class="status-tag" :class="node.status ? 'enabled' : 'disabled'">
                {{ node.status ? '显示' : '隐藏' }}
              </span>
            </div>
            
            <div class="node-actions">
              <button class="edit-btn" @click="editMenu(node)">编辑</button>
              <button class="add-child-btn" @click="addChildMenu(node)">添加子菜单</button>
              <button class="delete-btn" @click="deleteMenu(node.id)">删除</button>
            </div>
          </div>
          
          <div v-if="node.expanded && node.children" class="node-children">
            <div 
              class="tree-node child-node" 
              v-for="child in node.children" 
              :key="child.id"
              :class="{ 'dragging': isDragging && draggedNode?.id === child.id }"
              draggable="true"
              @dragstart="handleDragStart(child, $event)"
              @dragover="handleDragOver($event)"
              @drop="handleDrop(child, $event)"
              @dragend="handleDragEnd"
            >
              <div class="node-content">
                <div class="node-controls">
                  <span class="node-icon" :class="{ expanded: child.expanded }" @click="toggleNode(child)">
                    <i class="icon-chevron-right"></i>
                  </span>
                  <div class="drag-handle">
                    <i class="icon-drag"></i>
                  </div>
                </div>
                
                <div class="node-info">
                  <div class="node-icon-display">
                    <i :class="child.icon || 'icon-folder'"></i>
                  </div>
                  <div class="node-text">
                    <div class="node-name">{{ child.name }}</div>
                    <div class="node-path">{{ child.path }}</div>
                  </div>
                </div>
                
                <div class="node-status">
                  <span class="status-tag" :class="child.status ? 'enabled' : 'disabled'">
                    {{ child.status ? '显示' : '隐藏' }}
                  </span>
                </div>
                
                <div class="node-actions">
                  <button class="edit-btn" @click="editMenu(child)">编辑</button>
                  <button class="add-child-btn" @click="addChildMenu(child)">添加子菜单</button>
                  <button class="delete-btn" @click="deleteMenu(child.id)">删除</button>
                </div>
              </div>
              
              <div v-if="child.expanded && child.children" class="node-children">
                <div 
                  class="tree-node grandchild-node" 
                  v-for="grandchild in child.children" 
                  :key="grandchild.id"
                  :class="{ 'dragging': isDragging && draggedNode?.id === grandchild.id }"
                  draggable="true"
                  @dragstart="handleDragStart(grandchild, $event)"
                  @dragover="handleDragOver($event)"
                  @drop="handleDrop(grandchild, $event)"
                  @dragend="handleDragEnd"
                >
                  <div class="node-content">
                    <div class="node-controls">
                      <div class="drag-handle">
                        <i class="icon-drag"></i>
                      </div>
                    </div>
                    
                    <div class="node-info">
                      <div class="node-icon-display">
                        <i :class="grandchild.icon || 'icon-file'"></i>
                      </div>
                      <div class="node-text">
                        <div class="node-name">{{ grandchild.name }}</div>
                        <div class="node-path">{{ grandchild.path }}</div>
                      </div>
                    </div>
                    
                    <div class="node-status">
                      <span class="status-tag" :class="grandchild.status ? 'enabled' : 'disabled'">
                        {{ grandchild.status ? '显示' : '隐藏' }}
                      </span>
                    </div>
                    
                    <div class="node-actions">
                      <button class="edit-btn" @click="editMenu(grandchild)">编辑</button>
                      <button class="delete-btn" @click="deleteMenu(grandchild.id)">删除</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑菜单对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ isEditing ? '编辑菜单' : '添加菜单' }}</h3>
          <button class="close-btn" @click="closeDialog">
            <i class="icon-close"></i>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>菜单名称</label>
            <input type="text" v-model="menuForm.name" placeholder="请输入菜单名称">
          </div>
          <div class="form-group">
            <label>菜单路径</label>
            <input type="text" v-model="menuForm.path" placeholder="请输入菜单路径">
          </div>
          <div class="form-group">
            <label>组件路径</label>
            <input type="text" v-model="menuForm.component" placeholder="请输入组件路径">
          </div>
          <div class="form-group">
            <label>菜单图标</label>
            <div class="icon-selector">
              <input type="text" v-model="menuForm.icon" placeholder="请输入图标类名">
              <div class="icon-preview">
                <i :class="menuForm.icon || 'icon-file'"></i>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>父级菜单</label>
            <select v-model="menuForm.parentId">
              <option value="0">无（顶级菜单）</option>
              <option v-for="parent in parentMenus" :key="parent.id" :value="parent.id">
                {{ getNestedMenuName(parent) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>排序号</label>
            <input type="number" v-model="menuForm.orderNum" placeholder="请输入排序号">
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="menuForm.status">
              <option value="1">显示</option>
              <option value="0">隐藏</option>
            </select>
          </div>
          <div class="form-group">
            <label>是否外链</label>
            <select v-model="menuForm.isExternal">
              <option value="0">否</option>
              <option value="1">是</option>
            </select>
          </div>
          <div class="form-group" v-if="menuForm.isExternal === '1'">
            <label>外链地址</label>
            <input type="text" v-model="menuForm.externalUrl" placeholder="请输入外链地址">
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="menuForm.remark" placeholder="请输入备注信息"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeDialog">取消</button>
          <button class="confirm-btn" @click="saveMenu">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 搜索关键词
const searchKeyword = ref('')

// 菜单数据
const menus = ref([])
const menuTree = ref([])

// 对话框
const showDialog = ref(false)
const isEditing = ref(false)
const menuForm = ref({
  id: null,
  name: '',
  path: '',
  component: '',
  icon: '',
  parentId: 0,
  orderNum: 0,
  status: 1,
  isExternal: 0,
  externalUrl: '',
  remark: ''
})

// 拖拽相关
const isDragging = ref(false)
const draggedNode = ref(null)

// 计算属性
const parentMenus = computed(() => {
  return menus.value.filter(m => m.parentId === 0)
})

// 页面加载时初始化
onMounted(() => {
  loadMenus()
})

// 加载菜单列表
const loadMenus = async () => {
  try {
    // 这里应该调用API获取实际数据
    // 暂时使用模拟数据
    menus.value = [
      { 
        id: 1, 
        name: '首页', 
        path: '/home', 
        component: 'Home', 
        icon: 'icon-home', 
        parentId: 0, 
        orderNum: 1, 
        status: 1, 
        isExternal: 0, 
        externalUrl: '', 
        remark: '系统首页' 
      },
      { 
        id: 2, 
        name: '工作台', 
        path: '/workbench', 
        component: 'Workbench', 
        icon: 'icon-dashboard', 
        parentId: 1, 
        orderNum: 1, 
        status: 1, 
        isExternal: 0, 
        externalUrl: '', 
        remark: '工作台页面' 
      },
      { 
        id: 3, 
        name: '仪表盘', 
        path: '/dashboard', 
        component: 'Dashboard', 
        icon: 'icon-chart', 
        parentId: 0, 
        orderNum: 2, 
        status: 1, 
        isExternal: 0, 
        externalUrl: '', 
        remark: '数据仪表盘' 
      },
      { 
        id: 4, 
        name: '分析页', 
        path: '/analysis', 
        component: 'Analysis', 
        icon: 'icon-line-chart', 
        parentId: 3, 
        orderNum: 1, 
        status: 1, 
        isExternal: 0, 
        externalUrl: '', 
        remark: '数据分析页面' 
      },
      { 
        id: 5, 
        name: '统计页', 
        path: '/statistics', 
        component: 'Statistics', 
        icon: 'icon-bar-chart', 
        parentId: 3, 
        orderNum: 2, 
        status: 1, 
        isExternal: 0, 
        externalUrl: '', 
        remark: '数据统计页面' 
      },
      { 
        id: 6, 
        name: '用户管理', 
        path: '/users', 
        component: 'UserManagement', 
        icon: 'icon-users', 
        parentId: 0, 
        orderNum: 3, 
        status: 1, 
        isExternal: 0, 
        externalUrl: '', 
        remark: '用户管理页面' 
      },
      { 
        id: 7, 
        name: '角色管理', 
        path: '/roles', 
        component: 'RoleManagement', 
        icon: 'icon-user-group', 
        parentId: 6, 
        orderNum: 1, 
        status: 1, 
        isExternal: 0, 
        externalUrl: '', 
        remark: '角色管理页面' 
      },
      { 
        id: 8, 
        name: '权限管理', 
        path: '/permissions', 
        component: 'PermissionManagement', 
        icon: 'icon-key', 
        parentId: 6, 
        orderNum: 2, 
        status: 1, 
        isExternal: 0, 
        externalUrl: '', 
        remark: '权限管理页面' 
      },
      { 
        id: 9, 
        name: '菜单管理', 
        path: '/menus', 
        component: 'MenuManagement', 
        icon: 'icon-menu', 
        parentId: 6, 
        orderNum: 3, 
        status: 1, 
        isExternal: 0, 
        externalUrl: '', 
        remark: '菜单管理页面' 
      }
    ]
    
    // 构建菜单树
    buildMenuTree()
  } catch (error) {
    console.error('加载菜单列表失败:', error)
  }
}

// 构建菜单树
const buildMenuTree = () => {
  const tree = []
  const map = {}
  
  // 创建映射
  menus.value.forEach(menu => {
    map[menu.id] = {
      ...menu,
      children: [],
      expanded: false
    }
  })
  
  // 构建树结构
  menus.value.forEach(menu => {
    if (menu.parentId === 0) {
      tree.push(map[menu.id])
    } else if (map[menu.parentId]) {
      map[menu.parentId].children.push(map[menu.id])
    }
  })
  
  // 按orderNum排序
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => a.orderNum - b.orderNum)
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children)
      }
    })
  }
  
  sortNodes(tree)
  menuTree.value = tree
}

// 搜索菜单
const searchMenus = () => {
  if (!searchKeyword.value) {
    buildMenuTree()
    return
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  const filteredMenus = menus.value.filter(m => 
    m.name.toLowerCase().includes(keyword)
  )
  
  // 构建过滤后的菜单树
  const tree = []
  const map = {}
  
  // 创建映射
  filteredMenus.forEach(menu => {
    map[menu.id] = {
      ...menu,
      children: [],
      expanded: true
    }
  })
  
  // 构建树结构
  filteredMenus.forEach(menu => {
    if (menu.parentId === 0 || !map[menu.parentId]) {
      tree.push(map[menu.id])
    } else if (map[menu.parentId]) {
      map[menu.parentId].children.push(map[menu.id])
    }
  })
  
  menuTree.value = tree
}

// 刷新菜单
const refreshMenus = () => {
  loadMenus()
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
  expandNodes(menuTree.value)
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
  collapseNodes(menuTree.value)
}

// 显示添加菜单对话框
const showAddDialog = () => {
  isEditing.value = false
  menuForm.value = {
    id: null,
    name: '',
    path: '',
    component: '',
    icon: '',
    parentId: 0,
    orderNum: 0,
    status: 1,
    isExternal: 0,
    externalUrl: '',
    remark: ''
  }
  showDialog.value = true
}

// 添加子菜单
const addChildMenu = (parent) => {
  isEditing.value = false
  menuForm.value = {
    id: null,
    name: '',
    path: '',
    component: '',
    icon: '',
    parentId: parent.id,
    orderNum: 0,
    status: 1,
    isExternal: 0,
    externalUrl: '',
    remark: ''
  }
  showDialog.value = true
}

// 编辑菜单
const editMenu = (menu) => {
  isEditing.value = true
  menuForm.value = { ...menu }
  showDialog.value = true
}

// 删除菜单
const deleteMenu = async (id) => {
  if (!confirm('确定要删除此菜单吗？删除后子菜单也将被删除。')) return
  
  try {
    // 这里应该调用API删除菜单
    // 暂时只更新本地数据
    const deleteNode = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          nodes.splice(i, 1)
          return true
        }
        if (nodes[i].children && deleteNode(nodes[i].children)) {
          return true
        }
      }
      return false
    }
    
    deleteNode(menuTree.value)
    
    // 同时更新原始数据
    const deleteFromMenus = (menus) => {
      for (let i = 0; i < menus.length; i++) {
        if (menus[i].id === id) {
          menus.splice(i, 1)
          return true
        }
        if (deleteFromMenus(menus.filter(m => m.parentId === menus[i].id))) {
          return true
        }
      }
      return false
    }
    
    deleteFromMenus(menus.value)
  } catch (error) {
    console.error('删除菜单失败:', error)
  }
}

// 保存菜单
const saveMenu = async () => {
  try {
    // 这里应该调用API保存菜单
    // 暂时只更新本地数据
    if (isEditing.value) {
      const index = menus.value.findIndex(m => m.id === menuForm.value.id)
      if (index !== -1) {
        menus.value[index] = { ...menuForm.value }
      }
    } else {
      const newId = Math.max(...menus.value.map(m => m.id)) + 1
      menus.value.push({
        ...menuForm.value,
        id: newId
      })
    }
    
    buildMenuTree()
    closeDialog()
  } catch (error) {
    console.error('保存菜单失败:', error)
  }
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
}

// 获取嵌套菜单名称
const getNestedMenuName = (menu) => {
  let prefix = ''
  if (menu.parentId !== 0) {
    const parent = menus.value.find(m => m.id === menu.parentId)
    if (parent) {
      prefix = getNestedMenuName(parent) + ' > '
    }
  }
  return prefix + menu.name
}

// 拖拽相关方法
const handleDragStart = (node, event) => {
  isDragging.value = true
  draggedNode.value = node
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

const handleDrop = (targetNode, event) => {
  event.preventDefault()
  
  if (!draggedNode.value || draggedNode.value.id === targetNode.id) {
    return
  }
  
  // 检查是否是拖拽到自己的子节点
  const isDescendant = (node, targetId) => {
    if (node.id === targetId) return true
    if (node.children) {
      return node.children.some(child => isDescendant(child, targetId))
    }
    return false
  }
  
  if (isDescendant(draggedNode.value, targetNode.id)) {
    return
  }
  
  // 执行移动操作
  moveNode(draggedNode.value, targetNode)
}

const handleDragEnd = () => {
  isDragging.value = false
  draggedNode.value = null
}

const moveNode = (sourceNode, targetNode) => {
  // 从原位置移除
  const removeFromParent = (nodes, nodeId) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === nodeId) {
        return nodes.splice(i, 1)[0]
      }
      if (nodes[i].children) {
        const removed = removeFromParent(nodes[i].children, nodeId)
        if (removed) return removed
      }
    }
    return null
  }
  
  const removedNode = removeFromParent(menuTree.value, sourceNode.id)
  if (!removedNode) return
  
  // 更新父级ID
  removedNode.parentId = targetNode.id
  
  // 添加到新位置
  const addToParent = (nodes, targetId, node) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === targetId) {
        if (!nodes[i].children) {
          nodes[i].children = []
        }
        nodes[i].children.push(node)
        return true
      }
      if (nodes[i].children && addToParent(nodes[i].children, targetId, node)) {
        return true
      }
    }
    return false
  }
  
  addToParent(menuTree.value, targetNode.id, removedNode)
  
  // 更新原始数据
  const sourceIndex = menus.value.findIndex(m => m.id === sourceNode.id)
  if (sourceIndex !== -1) {
    menus.value[sourceIndex].parentId = targetNode.id
  }
}

// 保存菜单排序
const saveMenuOrder = async () => {
  try {
    // 这里应该调用API保存菜单排序
    console.log('保存菜单排序')
    alert('菜单排序保存成功')
  } catch (error) {
    console.error('保存菜单排序失败:', error)
  }
}
</script>

<style scoped>
.menu-management-container {
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
.expand-all-btn,
.collapse-all-btn,
.refresh-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.add-btn {
  background: #409eff;
  color: white;
}

.expand-all-btn,
.collapse-all-btn,
.refresh-btn {
  background: #f0f0f0;
  color: #666;
}

.add-btn i,
.expand-all-btn i,
.collapse-all-btn i,
.refresh-btn i {
  margin-right: 5px;
}

.menu-tree-container {
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

.save-order-btn {
  padding: 6px 12px;
  background: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.menu-tree {
  padding: 15px 20px;
  max-height: 600px;
  overflow-y: auto;
}

.tree-node {
  margin-bottom: 5px;
}

.tree-node.dragging {
  opacity: 0.5;
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
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.node-content:hover {
  background-color: #f5f7fa;
}

.node-controls {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.node-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.node-icon.expanded {
  transform: rotate(90deg);
}

.drag-handle {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  margin-left: 5px;
  color: #999;
}

.node-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.node-icon-display {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: #409eff;
}

.node-text {
  flex: 1;
}

.node-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.node-path {
  font-size: 12px;
  color: #999;
}

.node-status {
  margin-right: 15px;
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

.node-actions {
  display: flex;
  gap: 5px;
}

.edit-btn,
.add-child-btn,
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

.add-child-btn {
  background-color: #f0f9ff;
  color: #67c23a;
}

.delete-btn {
  background-color: #fef0f0;
  color: #f56c6c;
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
  width: 600px;
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

.icon-selector {
  display: flex;
  align-items: center;
}

.icon-selector input {
  flex: 1;
  margin-right: 10px;
}

.icon-preview {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
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
  
  .action-buttons {
    flex-wrap: wrap;
  }
  
  .node-content {
    flex-wrap: wrap;
  }
  
  .node-actions {
    width: 100%;
    margin-top: 5px;
    justify-content: flex-end;
  }
  
  .dialog {
    width: 95%;
  }
}
</style>