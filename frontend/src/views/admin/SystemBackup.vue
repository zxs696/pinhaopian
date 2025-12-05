<template>
  <div class="system-backup-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统备份</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreateBackup">创建备份</el-button>
            <el-button type="success" @click="handleRestoreBackup">恢复备份</el-button>
          </div>
        </div>
      </template>
      
      <div class="backup-info">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-card">
              <div class="info-title">系统状态</div>
              <div class="info-content">
                <el-tag type="success">运行正常</el-tag>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-card">
              <div class="info-title">上次备份时间</div>
              <div class="info-content">{{ lastBackupTime }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-card">
              <div class="info-title">备份文件数量</div>
              <div class="info-content">{{ backupCount }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <el-table :data="backupList" style="width: 100%; margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="备份名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="size" label="文件大小" width="120" />
        <el-table-column prop="type" label="备份类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button 
              v-if="scope.row.status === 'completed'" 
              size="small" 
              type="success" 
              @click="handleRestore(scope.row)"
            >
              恢复
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="handleDownload(scope.row)"
            >
              下载
            </el-button>
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
    
    <!-- 创建备份对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建备份" width="500px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="备份名称">
          <el-input v-model="createForm.name" placeholder="请输入备份名称"></el-input>
        </el-form-item>
        <el-form-item label="备份描述">
          <el-input 
            v-model="createForm.description" 
            type="textarea" 
            placeholder="请输入备份描述"
            :rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="备份类型">
          <el-select v-model="createForm.type" placeholder="请选择备份类型" style="width: 100%;">
            <el-option label="完整备份" value="full"></el-option>
            <el-option label="增量备份" value="incremental"></el-option>
            <el-option label="数据库备份" value="database"></el-option>
            <el-option label="文件备份" value="files"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCreateBackup">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 恢复备份对话框 -->
    <el-dialog v-model="restoreDialogVisible" title="恢复备份" width="500px">
      <div class="restore-warning">
        <el-alert
          title="警告"
          description="恢复备份将覆盖当前数据，请确保已做好数据备份！"
          type="warning"
          :closable="false"
          show-icon
        />
      </div>
      <div class="restore-info" v-if="selectedBackup">
        <p>备份名称：{{ selectedBackup.name }}</p>
        <p>备份时间：{{ selectedBackup.createTime }}</p>
        <p>备份类型：{{ getTypeText(selectedBackup.type) }}</p>
        <p>文件大小：{{ selectedBackup.size }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="restoreDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmRestoreBackup">确认恢复</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 备份详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="备份详情" width="600px">
      <div class="backup-detail" v-if="currentBackup">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="备份ID">{{ currentBackup.id }}</el-descriptions-item>
          <el-descriptions-item label="备份名称">{{ currentBackup.name }}</el-descriptions-item>
          <el-descriptions-item label="备份描述">{{ currentBackup.description }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ currentBackup.size }}</el-descriptions-item>
          <el-descriptions-item label="备份类型">
            <el-tag :type="getTypeTagType(currentBackup.type)">
              {{ getTypeText(currentBackup.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentBackup.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentBackup.status)">
              {{ getStatusText(currentBackup.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="currentBackup && currentBackup.status === 'completed'" 
            type="success" 
            @click="handleRestore(currentBackup)"
          >
            恢复
          </el-button>
          <el-button 
            v-if="currentBackup" 
            type="primary" 
            @click="handleDownload(currentBackup)"
          >
            下载
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
const backupList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const lastBackupTime = ref('2023-01-05 14:30:00')
const backupCount = ref(5)
const createDialogVisible = ref(false)
const restoreDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentBackup = ref(null)
const selectedBackup = ref(null)
const createForm = ref({
  name: '',
  description: '',
  type: 'full'
})

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    completed: 'success',
    processing: 'warning',
    failed: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    completed: '已完成',
    processing: '处理中',
    failed: '失败'
  }
  return statusMap[status] || '未知'
}

// 获取备份类型标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    full: 'primary',
    incremental: 'success',
    database: 'warning',
    files: 'info'
  }
  return typeMap[type] || 'info'
}

// 获取备份类型文本
const getTypeText = (type) => {
  const typeMap = {
    full: '完整备份',
    incremental: '增量备份',
    database: '数据库备份',
    files: '文件备份'
  }
  return typeMap[type] || '未知'
}

// 获取备份列表
const fetchBackupList = async () => {
  try {
    // 模拟数据
    const mockData = {
      data: [
        { 
          id: 1, 
          name: '系统完整备份_20230105', 
          description: '系统完整备份，包含所有数据和文件', 
          size: '2.5GB',
          type: 'full',
          createTime: '2023-01-05 14:30:00',
          status: 'completed'
        },
        { 
          id: 2, 
          name: '数据库备份_20230104', 
          description: '仅备份数据库', 
          size: '500MB',
          type: 'database',
          createTime: '2023-01-04 10:15:00',
          status: 'completed'
        },
        { 
          id: 3, 
          name: '增量备份_20230103', 
          description: '增量备份，仅包含变更数据', 
          size: '150MB',
          type: 'incremental',
          createTime: '2023-01-03 16:45:00',
          status: 'completed'
        },
        { 
          id: 4, 
          name: '文件备份_20230102', 
          description: '仅备份上传文件和媒体资源', 
          size: '800MB',
          type: 'files',
          createTime: '2023-01-02 09:20:00',
          status: 'completed'
        },
        { 
          id: 5, 
          name: '系统完整备份_20230101', 
          description: '系统完整备份，包含所有数据和文件', 
          size: '2.3GB',
          type: 'full',
          createTime: '2023-01-01 12:00:00',
          status: 'completed'
        }
      ],
      total: 5
    }
    
    backupList.value = mockData.data
    total.value = mockData.total
  } catch (error) {
    console.error('获取备份列表失败:', error)
    ElMessage.error('获取备份列表失败')
  }
}

// 创建备份
const handleCreateBackup = () => {
  createForm.value = {
    name: '',
    description: '',
    type: 'full'
  }
  createDialogVisible.value = true
}

// 确认创建备份
const confirmCreateBackup = async () => {
  if (!createForm.value.name) {
    ElMessage.warning('请输入备份名称')
    return
  }
  
  try {
    // 这里应该调用创建备份API
    ElMessage.success('备份创建任务已启动，请稍后查看备份列表')
    createDialogVisible.value = false
    fetchBackupList()
  } catch (error) {
    console.error('创建备份失败:', error)
    ElMessage.error('创建备份失败')
  }
}

// 恢复备份
const handleRestoreBackup = () => {
  if (backupList.value.length === 0) {
    ElMessage.warning('暂无可恢复的备份')
    return
  }
  
  // 默认选择最新的备份
  selectedBackup.value = backupList.value[0]
  restoreDialogVisible.value = true
}

// 确认恢复备份
const confirmRestoreBackup = async () => {
  try {
    // 这里应该调用恢复备份API
    ElMessage.success('备份恢复任务已启动，请稍后查看系统状态')
    restoreDialogVisible.value = false
  } catch (error) {
    console.error('恢复备份失败:', error)
    ElMessage.error('恢复备份失败')
  }
}

// 查看备份详情
const handleView = (row) => {
  currentBackup.value = row
  detailDialogVisible.value = true
}

// 恢复指定备份
const handleRestore = (row) => {
  selectedBackup.value = row
  detailDialogVisible.value = false
  restoreDialogVisible.value = true
}

// 下载备份
const handleDownload = (row) => {
  // 这里应该调用下载备份API
  ElMessage.success(`开始下载备份: ${row.name}`)
}

// 删除备份
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除备份"${row.name}"吗？删除后不可恢复！`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    try {
      // 这里应该调用删除备份API
      ElMessage.success('删除成功')
      fetchBackupList()
      detailDialogVisible.value = false
    } catch (error) {
      console.error('删除备份失败:', error)
      ElMessage.error('删除备份失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchBackupList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchBackupList()
}

// 初始化
onMounted(() => {
  fetchBackupList()
})
</script>

<style scoped>
.system-backup-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.backup-info {
  margin-bottom: 20px;
}

.info-card {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  height: 100%;
}

.info-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.info-content {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.restore-warning {
  margin-bottom: 20px;
}

.restore-info {
  margin-top: 20px;
}

.restore-info p {
  margin: 10px 0;
}

.backup-detail {
  margin-bottom: 20px;
}
</style>