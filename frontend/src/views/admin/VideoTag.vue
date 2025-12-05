<template>
  <div class="video-tag-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>视频标签管理</span>
          <el-button type="primary" @click="handleAdd">新增标签</el-button>
        </div>
      </template>
      
      <el-table :data="tagList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="标签名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="videoCount" label="关联视频数" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
    
    <!-- 新增/编辑标签对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入标签描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 数据
const tagList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()

// 表单数据
const form = reactive({
  id: null,
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 获取标签列表
const fetchTagList = async () => {
  try {
    // 模拟数据
    const mockData = {
      data: [
        { id: 1, name: '搞笑', description: '搞笑类视频', videoCount: 120, createTime: '2023-01-01 12:00:00' },
        { id: 2, name: '美食', description: '美食类视频', videoCount: 85, createTime: '2023-01-02 12:00:00' },
        { id: 3, name: '旅行', description: '旅行类视频', videoCount: 63, createTime: '2023-01-03 12:00:00' },
        { id: 4, name: '科技', description: '科技类视频', videoCount: 47, createTime: '2023-01-04 12:00:00' },
        { id: 5, name: '音乐', description: '音乐类视频', videoCount: 92, createTime: '2023-01-05 12:00:00' }
      ],
      total: 5
    }
    
    tagList.value = mockData.data
    total.value = mockData.total
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
  }
}

// 新增标签
const handleAdd = () => {
  dialogTitle.value = '新增标签'
  form.id = null
  form.name = ''
  form.description = ''
  dialogVisible.value = true
}

// 编辑标签
const handleEdit = (row) => {
  dialogTitle.value = '编辑标签'
  form.id = row.id
  form.name = row.name
  form.description = row.description
  dialogVisible.value = true
}

// 删除标签
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除标签 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里应该调用删除API
      ElMessage.success('删除成功')
      fetchTagList()
    } catch (error) {
      console.error('删除标签失败:', error)
      ElMessage.error('删除标签失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 这里应该调用新增/编辑API
        ElMessage.success(form.id ? '编辑成功' : '新增成功')
        dialogVisible.value = false
        fetchTagList()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败')
      }
    }
  })
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchTagList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchTagList()
}

// 初始化
onMounted(() => {
  fetchTagList()
})
</script>

<style scoped>
.video-tag-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>