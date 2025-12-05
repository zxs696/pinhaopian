<template>
  <el-dialog
    v-model="dialogVisible"
    title="安全提示"
    width="400px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    center
    class="session-invalid-dialog"
  >
    <div class="dialog-content">
      <div class="icon-container">
        <el-icon class="warning-icon" :size="48">
          <WarningFilled />
        </el-icon>
      </div>
      <h3 class="dialog-title">账号在其他设备登录</h3>
      <p class="dialog-message">
        您的账号已在其他设备上登录，为确保账户安全，当前会话已失效。请重新登录以继续使用。
      </p>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleConfirm" size="large">
          我知道了
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/modules/auth'

const authStore = useAuthStore()
const dialogVisible = ref(false)

// 显示对话框
const showDialog = () => {
  dialogVisible.value = true
}

// 处理确认按钮点击
const handleConfirm = () => {
  dialogVisible.value = false
  // 打开登录模态框
  const authStore = useAuthStore()
  authStore.setLoginModalVisible(true)
}

// 暴露方法给父组件使用
defineExpose({
  showDialog
})
</script>

<style scoped>
.session-invalid-dialog {
  --el-dialog-padding-primary: 20px;
}

.dialog-content {
  text-align: center;
  padding: 10px 0;
}

.icon-container {
  margin-bottom: 16px;
}

.warning-icon {
  color: #E6A23C;
}

.dialog-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.dialog-message {
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: center;
}
</style>