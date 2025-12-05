<template>
  <div class="category-management-container">
    <!-- 删除重复的面包屑导航，由AdminLayout统一提供 -->
    <div class="header-actions">
      <button class="refresh-btn" @click="handleRefresh">
        <el-icon>
          <Refresh />
        </el-icon>
        刷新
      </button>
    </div>
    
    <div class="content-card">
      <div class="card-header">
        <button class="add-btn" @click="showAddDialog">
          <el-icon>
            <Plus />
          </el-icon>
          添加分类
        </button>
      </div>

      <div class="filter-section">
        <div class="search-container">
          <el-input v-model="searchKeyword" placeholder="搜索分类名称" class="search-input" prefix-icon="Search"
            @keyup.enter="handleSearch" />
        </div>
        <button class="search-btn" @click="handleSearch">搜索</button>
        <button class="reset-btn" @click="resetSearch">重置</button>
      </div>

      <div class="table-container">
        <el-table :data="filteredCategories" class="custom-table" @selection-change="handleSelectionChange"
          v-loading="loading">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="分类名称" min-width="150">
            <template #default="scope">
              <div class="category-item">
                <div class="category-icon-wrapper">
                  <img :src="scope.row.icon" class="category-icon" />
                </div>
                <span class="category-name">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="分类描述" min-width="200" />
          <el-table-column prop="videoCount" label="视频数量" width="120">
            <template #default="scope">
              <div class="video-count-tag">{{ scope.row.videoCount }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <div class="status-switch">
                <el-switch v-model="scope.row.status" active-value="active" inactive-value="inactive"
                  @change="handleStatusChange(scope.row)" />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sortOrder" label="排序" width="100">
            <template #default="scope">
              <div class="sort-input">
                <el-input-number v-model="scope.row.sortOrder" :min="1" :max="99"
                  @change="handleSortChange(scope.row)" size="small" />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180">
            <template #default="scope">
              <div class="time-display">{{ formatDate(scope.row.createTime) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <button class="edit-btn" @click="editCategory(scope.row)">编辑</button>
              <button class="delete-btn" @click="deleteCategory(scope.row)"
                :disabled="scope.row.videoCount > 0">删除</button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="table-footer" v-if="selectedCategories.length > 0">
        <div class="batch-actions">
          <span class="selected-count">已选择 {{ selectedCategories.length }} 个分类</span>
          <button class="batch-btn activate" @click="batchActivate">批量启用</button>
          <button class="batch-btn deactivate" @click="batchDeactivate">批量禁用</button>
          <button class="batch-btn delete" @click="batchDelete">批量删除</button>
        </div>
      </div>
    </div>

    <!-- 添加分类对话框 -->
    <el-dialog v-model="addVisible" title="添加分类" width="500px" :before-close="handleCloseAdd">
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入分类名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input v-model="addForm.description" type="textarea" :rows="3" placeholder="请输入分类描述" maxlength="200"
            show-word-limit />
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <el-input v-model="addForm.icon" placeholder="请输入图标URL" />
          <div class="icon-preview" v-if="addForm.icon">
            <el-avatar :size="60" :src="addForm.icon" />
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="addForm.sortOrder" :min="1" :max="99" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="addForm.status" active-value="active" inactive-value="inactive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseAdd">取消</el-button>
        <el-button type="primary" @click="submitAddForm">添加</el-button>
      </template>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog v-model="editVisible" title="编辑分类" width="500px" :before-close="handleCloseEdit">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入分类名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入分类描述" maxlength="200"
            show-word-limit />
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <el-input v-model="editForm.icon" placeholder="请输入图标URL" />
          <div class="icon-preview" v-if="editForm.icon">
            <el-avatar :size="60" :src="editForm.icon" />
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="editForm.sortOrder" :min="1" :max="99" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="editForm.status" active-value="active" inactive-value="inactive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseEdit">取消</el-button>
        <el-button type="primary" @click="submitEditForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 分类管理页面逻辑
import { ref, computed, reactive } from 'vue'
import { 
  Search, 
  Refresh, 
  Plus 
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccess, showWarning } from '../../utils/message.js'

const searchKeyword = ref('')
const loading = ref(false)
const selectedCategories = ref([])
const addVisible = ref(false)
const editVisible = ref(false)
const addFormRef = ref()
const editFormRef = ref()

// 添加分类表单
const addForm = reactive({
  name: '',
  description: '',
  icon: '/logo.png', // 默认图标
  sortOrder: 1,
  status: 'active'
})

// 编辑分类表单
const editForm = reactive({
  id: '',
  name: '',
  description: '',
  icon: '',
  sortOrder: 1,
  status: 'active'
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度在1到50个字符之间', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '分类描述不能超过200个字符', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请输入分类图标URL', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序号', trigger: 'blur' }
  ]
}

// 模拟分类数据
const categories = ref([
  {
    id: '1',
    name: '生活',
    description: '日常生活、美食、旅行等相关视频',
    icon: '/logo.png',
    videoCount: 128,
    status: 'active',
    sortOrder: 1,
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: '2',
    name: '科技',
    description: '科技产品、数码评测、编程教程等相关视频',
    icon: '/logo.png',
    videoCount: 256,
    status: 'active',
    sortOrder: 2,
    createTime: '2024-01-01 10:05:00'
  },
  {
    id: '3',
    name: '娱乐',
    description: '电影、音乐、游戏、综艺等娱乐内容',
    icon: '/logo.png',
    videoCount: 342,
    status: 'active',
    sortOrder: 3,
    createTime: '2024-01-01 10:10:00'
  },
  {
    id: '4',
    name: '教育',
    description: '各类知识、技能、教程等教育内容',
    icon: '/logo.png',
    videoCount: 178,
    status: 'active',
    sortOrder: 4,
    createTime: '2024-01-01 10:15:00'
  },
  {
    id: '5',
    name: '音乐',
    description: '音乐作品、演唱会、乐器教学等内容',
    icon: '/logo.png',
    videoCount: 95,
    status: 'active',
    sortOrder: 5,
    createTime: '2024-01-01 10:20:00'
  },
  {
    id: '6',
    name: '其他',
    description: '其他类型的视频内容',
    icon: '/logo.png',
    videoCount: 67,
    status: 'active',
    sortOrder: 6,
    createTime: '2024-01-01 10:25:00'
  }
])

// 计算过滤后的分类列表
const filteredCategories = computed(() => {
  let result = [...categories.value]
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(category => 
      category.name.toLowerCase().includes(keyword) || 
      category.description.toLowerCase().includes(keyword)
    )
  }
  
  // 按排序号排序
  result.sort((a, b) => a.sortOrder - b.sortOrder)
  
  return result
})



function handleSearch() {
  console.log('搜索关键词:', searchKeyword.value)
}

function resetSearch() {
  searchKeyword.value = ''
}

function handleSelectionChange(selection) {
  selectedCategories.value = selection
}

function handleRefresh() {
  loading.value = true
  // 模拟加载数据
  setTimeout(() => {
    loading.value = false
    showSuccess('数据已刷新')
  }, 500)
}

function showAddDialog() {
  // 重置添加表单
  Object.assign(addForm, {
    name: '',
    description: '',
    icon: '/logo.png',
    sortOrder: 1,
    status: 'active'
  })
  addVisible.value = true
}

function handleCloseAdd() {
  if (addFormRef.value) {
    addFormRef.value.resetFields()
  }
  addVisible.value = false
}

function submitAddForm() {
  addFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟添加分类
      const newCategory = {
        id: Date.now().toString(),
        ...addForm,
        videoCount: 0,
        createTime: new Date().toLocaleString('zh-CN')
      }
      categories.value.push(newCategory)
      handleCloseAdd()
      showSuccess('分类添加成功')
    } else {
      console.log('表单验证失败')
      return false
    }
  })
}

function editCategory(category) {
  // 填充编辑表单
  Object.assign(editForm, { ...category })
  editVisible.value = true
}

function handleCloseEdit() {
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  editVisible.value = false
}

function submitEditForm() {
  editFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟更新分类
      const index = categories.value.findIndex(c => c.id === editForm.id)
      if (index !== -1) {
        // 保留视频数量和创建时间
        const original = categories.value[index]
        categories.value[index] = {
          ...editForm,
          videoCount: original.videoCount,
          createTime: original.createTime
        }
        handleCloseEdit()
        showSuccess('分类更新成功')
      }
    } else {
      console.log('表单验证失败')
      return false
    }
  })
}

function deleteCategory(category) {
  if (category.videoCount > 0) {
    showWarning('该分类下还有视频，无法删除')
    return
  }
  
  ElMessageBox.confirm(`确定要删除分类 "${category.name}" 吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const index = categories.value.findIndex(c => c.id === category.id)
    if (index !== -1) {
      categories.value.splice(index, 1)
      showSuccess('分类删除成功')
    }
  }).catch(() => {
    // 取消操作
  })
}

function handleStatusChange(category) {
  showSuccess(`分类 "${category.name}" 状态已更新为${category.status === 'active' ? '启用' : '禁用'}`)
}

function handleSortChange(category) {
  console.log('排序更新:', category.name, '新排序:', category.sortOrder)
}

function batchActivate() {
  ElMessageBox.confirm(`确定要启用选中的 ${selectedCategories.value.length} 个分类吗？`, '批量启用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedCategories.value.forEach(category => {
      const index = categories.value.findIndex(c => c.id === category.id)
      if (index !== -1) {
        categories.value[index].status = 'active'
      }
    })
    selectedCategories.value = []
    showSuccess('批量启用成功')
  }).catch(() => {
    // 取消操作
  })
}

function batchDeactivate() {
  ElMessageBox.confirm(`确定要禁用选中的 ${selectedCategories.value.length} 个分类吗？`, '批量禁用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedCategories.value.forEach(category => {
      const index = categories.value.findIndex(c => c.id === category.id)
      if (index !== -1) {
        categories.value[index].status = 'inactive'
      }
    })
    selectedCategories.value = []
    showSuccess('批量禁用成功')
  }).catch(() => {
    // 取消操作
  })
}

function batchDelete() {
  const categoriesWithVideos = selectedCategories.value.filter(cat => cat.videoCount > 0)
  if (categoriesWithVideos.length > 0) {
    showWarning('部分分类下还有视频，无法删除')
    return
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedCategories.value.length} 个分类吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    selectedCategories.value.forEach(category => {
      const index = categories.value.findIndex(c => c.id === category.id)
      if (index !== -1) {
        categories.value.splice(index, 1)
      }
    })
    selectedCategories.value = []
    showSuccess('批量删除成功')
  }).catch(() => {
    // 取消操作
  })
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
// 导入主题变量
@use "@/assets/styles/theme" as theme;

.category-management-container {
  padding: 20px;
  height: 100%;
  background-color: var(--color-background);
}

.breadcrumb {
  margin-bottom: 15px;
}

.header-actions {
  margin-bottom: 20px;
}

.content-card {
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: var(--transition);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-icon {
  object-fit: cover;
}

.category-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-hover);
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-count-tag {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  padding: 4px 8px;
  border-radius: var(--border-radius);
  font-size: 12px;
  font-weight: 500;
}

.status-switch {
  display: flex;
  align-items: center;
}

.sort-input {
  display: flex;
  align-items: center;
}

.time-display {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.table-footer {
  margin-top: 20px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  
  .selected-count {
    color: var(--color-text-secondary);
    font-size: 14px;
  }
}

.icon-preview {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

// 按钮样式
.refresh-btn, .add-btn, .search-btn, .reset-btn, .edit-btn, .delete-btn, .batch-btn {
  padding: 8px 16px;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}

.add-btn {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  
  &:hover {
    background-color: var(--color-primary-light);
    border-color: var(--color-primary-light);
  }
}

.delete-btn, .batch-btn.delete {
  &:hover {
    border-color: var(--color-danger);
    color: var(--color-danger);
  }
}

.batch-btn.activate {
  &:hover {
    border-color: var(--color-success);
    color: var(--color-success);
  }
}

.batch-btn.deactivate {
  &:hover {
    border-color: var(--color-warning);
    color: var(--color-warning);
  }
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .batch-actions {
    justify-content: center;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>