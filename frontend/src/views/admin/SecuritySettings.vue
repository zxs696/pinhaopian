<template>
  <div class="security-settings-container">
    <!-- 删除重复的面包屑导航，由AdminLayout统一提供 -->
    <div class="header-actions">
      <el-button type="primary" @click="handleSaveAll">
                <el-icon><Check /></el-icon>
                保存所有设置
              </el-button>
            </div>
          <el-card>
            <template #header>
              <div class="card-header">
                <span>安全设置</span>
                <el-tag type="info">系统安全配置管理</el-tag>
              </div>
            </template>
            
            <el-tabs v-model="activeTab" class="security-tabs">
              <!-- 登录安全 -->
              <el-tab-pane label="登录安全" name="login-security">
                <el-form :model="loginSecurity" :rules="loginSecurityRules" ref="loginSecurityForm">
                  <el-form-item label="登录失败次数限制" prop="loginAttempts">
                    <el-input-number 
                      v-model="loginSecurity.loginAttempts" 
                      :min="3" 
                      :max="20" 
                      label="限制次数"
                    />
                    <div class="form-hint">连续登录失败超过该次数后，账号将被临时锁定</div>
                  </el-form-item>
                  
                  <el-form-item label="账号锁定时长（分钟）" prop="lockoutDuration">
                    <el-input-number 
                      v-model="loginSecurity.lockoutDuration" 
                      :min="5" 
                      :max="1440" 
                      label="锁定分钟数"
                    />
                    <div class="form-hint">账号被锁定后的时长，默认为30分钟</div>
                  </el-form-item>
                  
                  <el-form-item label="验证码设置">
                    <el-checkbox-group v-model="loginSecurity.captchaSettings">
                      <el-checkbox value="登录失败后显示验证码">登录失败后显示验证码</el-checkbox>
                      <el-checkbox value="始终显示验证码">始终显示验证码</el-checkbox>
                      <el-checkbox value="高风险IP强制验证码">高风险IP强制验证码</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  
                  <el-form-item label="双因素认证">
                    <el-switch v-model="loginSecurity.twoFactorEnabled" />
                    <div class="form-hint">启用后，管理员登录需要额外验证</div>
                  </el-form-item>
                  
                  <el-form-item label="会话超时时间（分钟）" prop="sessionTimeout">
                    <el-input-number 
                      v-model="loginSecurity.sessionTimeout" 
                      :min="5" 
                      :max="1440" 
                      label="超时分钟数"
                    />
                    <div class="form-hint">用户无操作自动登出的时间</div>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <!-- 内容安全 -->
              <el-tab-pane label="内容安全" name="content-security">
                <el-form :model="contentSecurity" :rules="contentSecurityRules" ref="contentSecurityForm">
                  <el-form-item label="视频审核策略">
                    <el-radio-group v-model="contentSecurity.reviewStrategy">
                      <el-radio value="auto">自动审核（AI识别）</el-radio>
                      <el-radio value="manual">人工审核</el-radio>
                      <el-radio value="hybrid">混合审核（AI+人工）</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  
                  <el-form-item label="敏感词过滤">
                    <el-switch v-model="contentSecurity.enableWordFilter" />
                  </el-form-item>
                  
                  <el-form-item label="敏感词列表" v-if="contentSecurity.enableWordFilter">
                    <el-input
                      v-model="contentSecurity.sensitiveWords"
                      type="textarea"
                      :rows="6"
                      placeholder="每行输入一个敏感词"
                    />
                    <div class="form-hint">多个敏感词请用换行符分隔</div>
                  </el-form-item>
                  
                  <el-form-item label="视频时长限制（秒）" prop="maxVideoDuration">
                    <el-input-number 
                      v-model="contentSecurity.maxVideoDuration" 
                      :min="10" 
                      :max="3600" 
                      label="最大秒数"
                    />
                    <div class="form-hint">用户可上传的单个视频最大时长</div>
                  </el-form-item>
                  
                  <el-form-item label="视频大小限制（MB）" prop="maxVideoSize">
                    <el-input-number 
                      v-model="contentSecurity.maxVideoSize" 
                      :min="10" 
                      :max="5000" 
                      label="最大MB"
                    />
                    <div class="form-hint">用户可上传的单个视频最大文件大小</div>
                  </el-form-item>
                  
                  <el-form-item label="内容水印">
                    <el-switch v-model="contentSecurity.enableWatermark" />
                  </el-form-item>
                  
                  <el-form-item label="水印设置" v-if="contentSecurity.enableWatermark">
                    <el-form-item label="水印文字" prop="watermarkText">
                      <el-input v-model="contentSecurity.watermarkText" placeholder="请输入水印文字" />
                    </el-form-item>
                    <el-form-item label="水印位置">
                      <el-select v-model="contentSecurity.watermarkPosition">
                        <el-option label="左上角" value="top-left" />
                        <el-option label="右上角" value="top-right" />
                        <el-option label="左下角" value="bottom-left" />
                        <el-option label="右下角" value="bottom-right" />
                        <el-option label="居中" value="center" />
                      </el-select>
                    </el-form-item>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <!-- IP黑白名单 -->
              <el-tab-pane label="IP管理" name="ip-management">
                <el-form :model="ipSettings" ref="ipSettingsForm">
                  <el-form-item label="IP限制模式">
                    <el-radio-group v-model="ipSettings.restrictionMode">
                      <el-radio value="none">无限制</el-radio>
                      <el-radio value="whitelist">仅允许白名单</el-radio>
                      <el-radio value="blacklist">黑名单排除</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  
                  <el-form-item label="白名单IP列表" v-if="ipSettings.restrictionMode === 'whitelist'">
                    <el-input
                      v-model="ipSettings.whitelistIps"
                      type="textarea"
                      :rows="6"
                      placeholder="每行输入一个IP地址或IP段（如192.168.1.0/24）"
                    />
                    <div class="form-hint">多个IP请用换行符分隔，支持CIDR格式</div>
                  </el-form-item>
                  
                  <el-form-item label="黑名单IP列表" v-if="ipSettings.restrictionMode === 'blacklist'">
                    <el-input
                      v-model="ipSettings.blacklistIps"
                      type="textarea"
                      :rows="6"
                      placeholder="每行输入一个IP地址或IP段（如192.168.1.0/24）"
                    />
                    <div class="form-hint">多个IP请用换行符分隔，支持CIDR格式</div>
                  </el-form-item>
                  
                  <el-form-item label="管理员登录IP限制">
                    <el-switch v-model="ipSettings.restrictAdminIp" />
                  </el-form-item>
                  
                  <el-form-item label="管理员IP白名单" v-if="ipSettings.restrictAdminIp">
                    <el-input
                      v-model="ipSettings.adminIps"
                      type="textarea"
                      :rows="4"
                      placeholder="每行输入一个IP地址"
                    />
                    <div class="form-hint">仅允许这些IP地址登录管理员账号</div>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <!-- 系统日志 -->
              <el-tab-pane label="系统日志" name="system-logs">
                <div class="log-section">
                  <div class="log-filters">
                    <el-select v-model="logFilters.logType" placeholder="日志类型" class="filter-select">
                      <el-option label="所有类型" value="" />
                      <el-option label="登录日志" value="login" />
                      <el-option label="操作日志" value="operation" />
                      <el-option label="错误日志" value="error" />
                      <el-option label="安全警告" value="warning" />
                    </el-select>
                    <el-date-picker
                      v-model="logFilters.dateRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      class="filter-date"
                    />
                    <el-input
                      v-model="logFilters.keyword"
                      placeholder="搜索关键词"
                      class="filter-search"
                      prefix-icon="Search"
                    />
                    <el-button type="primary" @click="searchLogs">搜索</el-button>
                    <el-button @click="clearLogFilters">重置</el-button>
                    <el-button type="danger" @click="exportLogs">导出日志</el-button>
                  </div>
                  
                  <el-table 
                    :data="logsData" 
                    style="width: 100%"
                    v-loading="loadingLogs"
                  >
                    <el-table-column prop="id" label="ID" width="80" />
                    <el-table-column prop="type" label="类型" width="100">
                      <template #default="scope">
                        <el-tag :type="getLogTypeTag(scope.row.type)">
                          {{ getLogTypeName(scope.row.type) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="message" label="内容" min-width="300" />
                    <el-table-column prop="operator" label="操作者" width="120" />
                    <el-table-column prop="ip" label="IP地址" width="150" />
                    <el-table-column prop="timestamp" label="时间" width="180">
                      <template #default="scope">
                        {{ formatDate(scope.row.timestamp) }}
                      </template>
                    </el-table-column>
                  </el-table>
                  
                  <el-pagination
                    v-model:current-page="logPagination.currentPage"
                    v-model:page-size="logPagination.pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="logsData.length"
                    class="log-pagination"
                  />
                </div>
              </el-tab-pane>
              
              <!-- 备份恢复 -->
              <el-tab-pane label="备份恢复" name="backup-restore">
                <div class="backup-section">
                  <el-card class="backup-card">
                    <template #header>
                      <div class="backup-header">
                        <span>数据库备份</span>
                        <el-button type="primary" @click="createBackup">立即备份</el-button>
                      </div>
                    </template>
                    <div class="backup-settings">
                      <el-form-item label="自动备份">
                        <el-switch v-model="backupSettings.autoBackup" />
                      </el-form-item>
                      
                      <el-form-item label="备份频率" v-if="backupSettings.autoBackup">
                        <el-radio-group v-model="backupSettings.frequency">
                          <el-radio value="daily">每日</el-radio>
                          <el-radio value="weekly">每周</el-radio>
                          <el-radio value="monthly">每月</el-radio>
                        </el-radio-group>
                      </el-form-item>
                      
                      <el-form-item label="保留备份数量" v-if="backupSettings.autoBackup">
                        <el-input-number 
                          v-model="backupSettings.retentionCount" 
                          :min="1" 
                          :max="100" 
                          label="备份数"
                        />
                        <div class="form-hint">超过数量后会自动删除最旧的备份</div>
                      </el-form-item>
                    </div>
                  </el-card>
                  
                  <el-card class="restore-card">
                    <template #header>
                      <div class="restore-header">
                        <span>备份列表</span>
                      </div>
                    </template>
                    
                    <el-table :data="backupList" style="width: 100%">
                      <el-table-column prop="id" label="ID" width="80" />
                      <el-table-column prop="filename" label="文件名" min-width="200" />
                      <el-table-column prop="size" label="大小" width="100" />
                      <el-table-column prop="createdAt" label="创建时间" width="180">
                        <template #default="scope">
                          {{ formatDate(scope.row.createdAt) }}
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="200" fixed="right">
                        <template #default="scope">
                          <el-button type="primary" size="small" @click="restoreBackup(scope.row)">恢复</el-button>
                          <el-button type="warning" size="small" @click="downloadBackup(scope.row)">下载</el-button>
                          <el-button type="danger" size="small" @click="deleteBackup(scope.row)">删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-card>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>

    
    <!-- 确认对话框 -->
    <el-dialog
      v-model="confirmVisible"
      :title="confirmTitle"
      width="400px"
      :before-close="handleCloseConfirm"
    >
      <div class="confirm-content">
        {{ confirmMessage }}
      </div>
      <template #footer>
        <el-button @click="handleCloseConfirm">取消</el-button>
        <el-button :type="confirmType" @click="confirmAction">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 备份进度对话框 -->
    <el-dialog
      v-model="backupProgressVisible"
      title="备份进度"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-content">
        <el-progress 
          :percentage="backupProgress" 
          :status="backupProgressStatus"
        />
        <div class="progress-text">{{ backupProgressText }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
// 安全设置页面逻辑
import { ref, reactive } from 'vue'
import { 
  Check
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccess } from '../../utils/message.js'


const activeTab = ref('login-security')
const loadingLogs = ref(false)

// 对话框状态
const confirmVisible = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmType = ref('primary')
const confirmAction = ref(() => {})
const handleCloseConfirm = () => {
  confirmVisible.value = false
  confirmAction.value = () => {}
}

// 备份进度对话框
const backupProgressVisible = ref(false)
const backupProgress = ref(0)
const backupProgressStatus = ref('')
const backupProgressText = ref('')

// 登录安全设置
const loginSecurity = reactive({
  loginAttempts: 5,
  lockoutDuration: 30,
  captchaSettings: ['登录失败后显示验证码'],
  twoFactorEnabled: false,
  sessionTimeout: 60
})

const loginSecurityRules = {
  loginAttempts: [
    { required: true, message: '请设置登录失败次数限制', trigger: 'blur' },
    { type: 'number', min: 3, max: 20, message: '次数范围应在3-20之间', trigger: 'blur' }
  ],
  lockoutDuration: [
    { required: true, message: '请设置账号锁定时长', trigger: 'blur' },
    { type: 'number', min: 5, max: 1440, message: '时长范围应在5-1440分钟之间', trigger: 'blur' }
  ],
  sessionTimeout: [
    { required: true, message: '请设置会话超时时间', trigger: 'blur' },
    { type: 'number', min: 5, max: 1440, message: '时长范围应在5-1440分钟之间', trigger: 'blur' }
  ]
}

const loginSecurityForm = ref()

// 内容安全设置
const contentSecurity = reactive({
  reviewStrategy: 'hybrid',
  enableWordFilter: true,
  sensitiveWords: '违禁词1\n违禁词2\n敏感词',
  maxVideoDuration: 600,
  maxVideoSize: 500,
  enableWatermark: true,
  watermarkText: '视频管理系统',
  watermarkPosition: 'bottom-right'
})

const contentSecurityRules = {
  maxVideoDuration: [
    { required: true, message: '请设置视频时长限制', trigger: 'blur' },
    { type: 'number', min: 10, max: 3600, message: '时长范围应在10-3600秒之间', trigger: 'blur' }
  ],
  maxVideoSize: [
    { required: true, message: '请设置视频大小限制', trigger: 'blur' },
    { type: 'number', min: 10, max: 5000, message: '大小范围应在10-5000MB之间', trigger: 'blur' }
  ],
  watermarkText: [
    { required: true, message: '请设置水印文字', trigger: 'blur' },
    { min: 1, max: 20, message: '水印文字长度应在1-20个字符之间', trigger: 'blur' }
  ]
}

const contentSecurityForm = ref()

// IP设置
const ipSettings = reactive({
  restrictionMode: 'none',
  whitelistIps: '192.168.1.1\n192.168.1.0/24',
  blacklistIps: '',
  restrictAdminIp: false,
  adminIps: '127.0.0.1'
})

const ipSettingsForm = ref()

// 日志过滤
const logFilters = reactive({
  logType: '',
  dateRange: [],
  keyword: ''
})

const logPagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 模拟日志数据
const logsData = ref([
  {
    id: '1001',
    type: 'login',
    message: '管理员成功登录系统',
    operator: 'admin',
    ip: '127.0.0.1',
    timestamp: '2024-01-14 10:30:15'
  },
  {
    id: '1002',
    type: 'operation',
    message: '更新了用户管理页面设置',
    operator: 'admin',
    ip: '127.0.0.1',
    timestamp: '2024-01-14 10:25:30'
  },
  {
    id: '1003',
    type: 'warning',
    message: '检测到异常登录尝试',
    operator: 'unknown',
    ip: '203.0.113.42',
    timestamp: '2024-01-14 09:45:12'
  },
  {
    id: '1004',
    type: 'error',
    message: '数据库连接超时',
    operator: 'system',
    ip: '127.0.0.1',
    timestamp: '2024-01-14 08:30:05'
  },
  {
    id: '1005',
    type: 'login',
    message: '用户登录失败（密码错误）',
    operator: 'zhangwei',
    ip: '198.51.100.78',
    timestamp: '2024-01-14 08:15:42'
  },
  {
    id: '1006',
    type: 'operation',
    message: '删除了过期的视频内容',
    operator: 'admin',
    ip: '127.0.0.1',
    timestamp: '2024-01-14 07:45:20'
  },
  {
    id: '1007',
    type: 'warning',
    message: '磁盘空间不足，建议清理',
    operator: 'system',
    ip: '127.0.0.1',
    timestamp: '2024-01-14 07:00:00'
  }
])

// 备份设置
const backupSettings = reactive({
  autoBackup: true,
  frequency: 'daily',
  retentionCount: 7
})

// 模拟备份列表
const backupList = ref([
  {
    id: '1',
    filename: 'backup_20240114_100000.sql',
    size: '25.6 MB',
    createdAt: '2024-01-14 10:00:00'
  },
  {
    id: '2',
    filename: 'backup_20240113_100000.sql',
    size: '24.8 MB',
    createdAt: '2024-01-13 10:00:00'
  },
  {
    id: '3',
    filename: 'backup_20240112_100000.sql',
    size: '23.1 MB',
    createdAt: '2024-01-12 10:00:00'
  }
])



function handleSaveAll() {
  // 验证所有表单
  const validations = []
  
  if (loginSecurityForm.value) {
    validations.push(new Promise((resolve, reject) => {
      loginSecurityForm.value.validate((valid) => {
        if (valid) resolve(true)
        else reject(new Error('登录安全设置验证失败'))
      })
    }))
  }
  
  if (contentSecurityForm.value) {
    validations.push(new Promise((resolve, reject) => {
      contentSecurityForm.value.validate((valid) => {
        if (valid) resolve(true)
        else reject(new Error('内容安全设置验证失败'))
      })
    }))
  }
  
  Promise.all(validations).then(() => {
    // 模拟保存操作
    setTimeout(() => {
      showSuccess('所有设置已成功保存')
    }, 500)
  }).catch((error) => {
    console.error('验证失败:', error.message)
  })
}

function searchLogs() {
  loadingLogs.value = true
  // 模拟搜索操作
  setTimeout(() => {
    loadingLogs.value = false
    console.log('搜索日志:', logFilters)
  }, 500)
}

function clearLogFilters() {
  logFilters.logType = ''
  logFilters.dateRange = []
  logFilters.keyword = ''
  logPagination.currentPage = 1
}

function exportLogs() {
  showSuccess('日志导出成功')
}

function getLogTypeTag(type) {
  const typeMap = {
    'login': 'primary',
    'operation': 'success',
    'error': 'danger',
    'warning': 'warning'
  }
  return typeMap[type] || 'info'
}

function getLogTypeName(type) {
  const typeMap = {
    'login': '登录',
    'operation': '操作',
    'error': '错误',
    'warning': '警告'
  }
  return typeMap[type] || type
}

function createBackup() {
  confirmTitle.value = '确认备份'
  confirmMessage.value = '确定要立即创建数据库备份吗？这可能需要一些时间。'
  confirmType.value = 'primary'
  confirmAction.value = () => {
    confirmVisible.value = false
    // 模拟备份过程
    backupProgressVisible.value = true
    backupProgress.value = 0
    backupProgressStatus.value = 'primary'
    backupProgressText.value = '正在准备备份...'
    
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      backupProgress.value = progress
      
      if (progress <= 30) {
        backupProgressText.value = '正在读取数据库...'
      } else if (progress <= 70) {
        backupProgressText.value = '正在备份数据...'
      } else {
        backupProgressText.value = '正在保存备份文件...'
      }
      
      if (progress >= 100) {
        clearInterval(interval)
        backupProgressStatus.value = 'success'
        backupProgressText.value = '备份完成！'
        
        setTimeout(() => {
          backupProgressVisible.value = false
          showSuccess('数据库备份成功')
          // 添加新备份到列表
          backupList.value.unshift({
            id: String(backupList.value.length + 1),
            filename: `backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.sql`,
            size: '26.3 MB',
            createdAt: new Date().toLocaleString('zh-CN')
          })
        }, 1000)
      }
    }, 300)
  }
  confirmVisible.value = true
}

function restoreBackup(backup) {
  confirmTitle.value = '确认恢复'
  confirmMessage.value = `确定要从备份 ${backup.filename} 恢复数据库吗？这将覆盖当前数据！`
  confirmType.value = 'warning'
  confirmAction.value = () => {
    confirmVisible.value = false
    ElMessageBox.confirm(
      '恢复操作不可撤销，确定继续吗？',
      '最终确认',
      {
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
        type: 'danger'
      }
    ).then(() => {
      // 模拟恢复操作
      setTimeout(() => {
        showSuccess('数据库恢复成功')
      }, 1000)
    }).catch(() => {
      // 取消恢复
    })
  }
  confirmVisible.value = true
}

function downloadBackup(backup) {
  console.log('下载备份:', backup.filename)
  showSuccess('备份文件已开始下载')
}

function deleteBackup(backup) {
  confirmTitle.value = '确认删除'
  confirmMessage.value = `确定要删除备份 ${backup.filename} 吗？`
  confirmType.value = 'danger'
  confirmAction.value = () => {
    confirmVisible.value = false
    // 模拟删除操作
    const index = backupList.value.findIndex(item => item.id === backup.id)
    if (index !== -1) {
      backupList.value.splice(index, 1)
      showSuccess('备份文件已删除')
    }
  }
  confirmVisible.value = true
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.security-settings-container {
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

.security-tabs {
  margin-top: 20px;
}

.form-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 日志样式 */
.log-section {
  margin-top: 20px;
}

.log-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-select {
  width: 150px;
}

.filter-date {
  width: 300px;
}

.filter-search {
  width: 200px;
}

.log-pagination {
  margin-top: 20px;
  text-align: right;
}

/* 备份恢复样式 */
.backup-section {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.backup-card,
.restore-card {
  flex: 1;
  min-width: 400px;
}

.backup-header,
.restore-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.backup-settings {
  margin-top: 20px;
}

/* 确认对话框 */
.confirm-content {
  padding: 20px 0;
}

.progress-content {
  padding: 20px 0;
}

.progress-text {
  margin-top: 15px;
  text-align: center;
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .log-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select,
  .filter-date,
  .filter-search {
    width: 100%;
  }
  
  .backup-section {
    flex-direction: column;
  }
  
  .backup-card,
  .restore-card {
    min-width: auto;
  }
}
</style>