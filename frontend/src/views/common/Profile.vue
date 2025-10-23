<template>
  <div class="profile-container">
    <el-container class="main-container">
      <el-main>
        <div class="profile-header">
          <el-card class="profile-card">
            <div class="profile-info">
              <el-avatar :size="80" src="/logo.png" />
              <div class="user-details">
                <h2>{{ userInfo.username || '用户名' }}</h2>
                <p class="user-role">{{ userInfo.role || '普通用户' }}</p>
              </div>
            </div>
          </el-card>
        </div>
        
        <div class="profile-content">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息">
              <el-form :model="userInfo" label-width="120px">
                <el-form-item label="用户名">
                  <el-input v-model="userInfo.username" disabled />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="userInfo.email" placeholder="未设置邮箱" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="userInfo.phone" placeholder="未设置手机号" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveProfile">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            
            <el-tab-pane label="我的收藏">
              <div class="empty-state">
                <el-empty description="暂无收藏内容" />
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="观看历史">
              <div class="empty-state">
                <el-empty description="暂无观看历史" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
// 个人资料页逻辑
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../store/modules/auth'
import { showSuccess } from '../../utils/message.js'

const authStore = useAuthStore()
const activeTab = ref('0')
const userInfo = ref({
  username: '',
  email: '',
  phone: '',
  role: ''
})

onMounted(() => {
  // 加载用户信息
  loadUserInfo()
})

function loadUserInfo() {
  // 从auth store获取用户信息
  if (authStore.user) {
    userInfo.value = {
      ...authStore.user,
      email: authStore.user.email || '',
      phone: authStore.user.phone || ''
    }
  } else {
    // 模拟用户信息
    userInfo.value = {
      username: '游客用户',
      role: '普通用户'
    }
  }
}

function saveProfile() {
  // 保存个人资料
  showSuccess('保存成功')
  console.log('保存用户信息:', userInfo.value)
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
}

.profile-card {
  margin-bottom: 32px;
}

.profile-info {
  display: flex;
  align-items: center;
}

.user-details {
  margin-left: 24px;
}

.user-details h2 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.user-role {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.profile-content {
  max-width: 800px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    text-align: center;
  }
  
  .user-details {
    margin-left: 0;
    margin-top: 16px;
  }
}
</style>