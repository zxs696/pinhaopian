<template>
  <div class="system-config-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleSaveConfig">保存配置</el-button>
            <el-button @click="handleResetConfig">重置配置</el-button>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="card">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicConfig" label-width="120px">
            <el-form-item label="网站名称">
              <el-input v-model="basicConfig.siteName"></el-input>
            </el-form-item>
            <el-form-item label="网站描述">
              <el-input 
                v-model="basicConfig.siteDescription" 
                type="textarea" 
                :rows="3"
              ></el-input>
            </el-form-item>
            <el-form-item label="网站关键词">
              <el-input v-model="basicConfig.siteKeywords"></el-input>
            </el-form-item>
            <el-form-item label="网站Logo">
              <el-upload
                class="logo-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeLogoUpload"
                :http-request="handleLogoUpload"
              >
                <img v-if="basicConfig.siteLogo" :src="basicConfig.siteLogo" class="logo" />
                <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="网站备案号">
              <el-input v-model="basicConfig.icpNumber"></el-input>
            </el-form-item>
            <el-form-item label="联系邮箱">
              <el-input v-model="basicConfig.contactEmail"></el-input>
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="basicConfig.contactPhone"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 上传设置 -->
        <el-tab-pane label="上传设置" name="upload">
          <el-form :model="uploadConfig" label-width="120px">
            <el-form-item label="最大上传大小">
              <el-input-number 
                v-model="uploadConfig.maxUploadSize" 
                :min="1" 
                :max="1024"
                controls-position="right"
              />
              <span style="margin-left: 10px;">MB</span>
            </el-form-item>
            <el-form-item label="允许上传类型">
              <el-checkbox-group v-model="uploadConfig.allowedTypes">
                <el-checkbox label="mp4">MP4视频</el-checkbox>
                <el-checkbox label="avi">AVI视频</el-checkbox>
                <el-checkbox label="mov">MOV视频</el-checkbox>
                <el-checkbox label="wmv">WMV视频</el-checkbox>
                <el-checkbox label="flv">FLV视频</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="视频质量设置">
              <el-radio-group v-model="uploadConfig.videoQuality">
                <el-radio label="low">低质量</el-radio>
                <el-radio label="medium">中等质量</el-radio>
                <el-radio label="high">高质量</el-radio>
                <el-radio label="original">原始质量</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="自动转码">
              <el-switch v-model="uploadConfig.autoTranscode"></el-switch>
            </el-form-item>
            <el-form-item label="转码格式">
              <el-select v-model="uploadConfig.transcodeFormat" placeholder="请选择转码格式">
                <el-option label="MP4" value="mp4"></el-option>
                <el-option label="WebM" value="webm"></el-option>
                <el-option label="AVI" value="avi"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form :model="securityConfig" label-width="120px">
            <el-form-item label="启用验证码">
              <el-switch v-model="securityConfig.enableCaptcha"></el-switch>
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-switch v-model="securityConfig.enableLoginLock"></el-switch>
            </el-form-item>
            <el-form-item label="锁定阈值">
              <el-input-number 
                v-model="securityConfig.loginLockThreshold" 
                :min="3" 
                :max="10"
                controls-position="right"
              />
              <span style="margin-left: 10px;">次</span>
            </el-form-item>
            <el-form-item label="锁定时间">
              <el-input-number 
                v-model="securityConfig.loginLockTime" 
                :min="5" 
                :max="60"
                controls-position="right"
              />
              <span style="margin-left: 10px;">分钟</span>
            </el-form-item>
            <el-form-item label="IP白名单">
              <el-input 
                v-model="securityConfig.ipWhitelist" 
                type="textarea" 
                :rows="3"
                placeholder="每行一个IP地址或IP段"
              ></el-input>
            </el-form-item>
            <el-form-item label="IP黑名单">
              <el-input 
                v-model="securityConfig.ipBlacklist" 
                type="textarea" 
                :rows="3"
                placeholder="每行一个IP地址或IP段"
              ></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 邮件设置 -->
        <el-tab-pane label="邮件设置" name="email">
          <el-form :model="emailConfig" label-width="120px">
            <el-form-item label="SMTP服务器">
              <el-input v-model="emailConfig.smtpServer"></el-input>
            </el-form-item>
            <el-form-item label="SMTP端口">
              <el-input-number 
                v-model="emailConfig.smtpPort" 
                :min="1" 
                :max="65535"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="发件人邮箱">
              <el-input v-model="emailConfig.senderEmail"></el-input>
            </el-form-item>
            <el-form-item label="发件人名称">
              <el-input v-model="emailConfig.senderName"></el-input>
            </el-form-item>
            <el-form-item label="邮箱用户名">
              <el-input v-model="emailConfig.username"></el-input>
            </el-form-item>
            <el-form-item label="邮箱密码">
              <el-input v-model="emailConfig.password" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="启用SSL">
              <el-switch v-model="emailConfig.enableSsl"></el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleTestEmail">测试邮件发送</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 缓存设置 -->
        <el-tab-pane label="缓存设置" name="cache">
          <el-form :model="cacheConfig" label-width="120px">
            <el-form-item label="缓存类型">
              <el-select v-model="cacheConfig.cacheType" placeholder="请选择缓存类型">
                <el-option label="内存缓存" value="memory"></el-option>
                <el-option label="Redis缓存" value="redis"></el-option>
                <el-option label="文件缓存" value="file"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Redis主机" v-if="cacheConfig.cacheType === 'redis'">
              <el-input v-model="cacheConfig.redisHost"></el-input>
            </el-form-item>
            <el-form-item label="Redis端口" v-if="cacheConfig.cacheType === 'redis'">
              <el-input-number 
                v-model="cacheConfig.redisPort" 
                :min="1" 
                :max="65535"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="Redis密码" v-if="cacheConfig.cacheType === 'redis'">
              <el-input v-model="cacheConfig.redisPassword" type="password" show-password></el-input>
            </el-form-item>
            <el-form-item label="缓存过期时间">
              <el-input-number 
                v-model="cacheConfig.cacheExpireTime" 
                :min="60" 
                :max="86400"
                controls-position="right"
              />
              <span style="margin-left: 10px;">秒</span>
            </el-form-item>
            <el-form-item label="清除缓存">
              <el-button type="warning" @click="handleClearCache">清除所有缓存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 数据
const activeTab = ref('basic')
const basicConfig = ref({
  siteName: '拼好片',
  siteDescription: '一个优秀的视频分享平台',
  siteKeywords: '视频,分享,社交',
  siteLogo: '',
  icpNumber: '',
  contactEmail: 'admin@pinhaopian.com',
  contactPhone: ''
})

const uploadConfig = ref({
  maxUploadSize: 100,
  allowedTypes: ['mp4', 'avi', 'mov'],
  videoQuality: 'medium',
  autoTranscode: true,
  transcodeFormat: 'mp4'
})

const securityConfig = ref({
  enableCaptcha: true,
  enableLoginLock: true,
  loginLockThreshold: 5,
  loginLockTime: 30,
  ipWhitelist: '',
  ipBlacklist: ''
})

const emailConfig = ref({
  smtpServer: '',
  smtpPort: 587,
  senderEmail: '',
  senderName: '',
  username: '',
  password: '',
  enableSsl: true
})

const cacheConfig = ref({
  cacheType: 'memory',
  redisHost: 'localhost',
  redisPort: 6379,
  redisPassword: '',
  cacheExpireTime: 3600
})

// 获取配置
const fetchConfig = async () => {
  try {
    // 这里应该调用获取配置API
    // const response = await getConfig()
    // basicConfig.value = response.basic
    // uploadConfig.value = response.upload
    // securityConfig.value = response.security
    // emailConfig.value = response.email
    // cacheConfig.value = response.cache
  } catch (error) {
    console.error('获取配置失败:', error)
    ElMessage.error('获取配置失败')
  }
}

// 保存配置
const handleSaveConfig = async () => {
  try {
    // 这里应该调用保存配置API
    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  }
}

// 重置配置
const handleResetConfig = () => {
  ElMessageBox.confirm('确定要重置所有配置吗？此操作不可恢复！', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    fetchConfig()
    ElMessage.success('配置已重置')
  }).catch(() => {
    // 用户取消操作
  })
}

// Logo上传前的校验
const beforeLogoUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传Logo图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传Logo图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 处理Logo上传
const handleLogoUpload = (options) => {
  const { file } = options
  // 这里应该调用上传API
  // 模拟上传成功
  setTimeout(() => {
    basicConfig.value.siteLogo = URL.createObjectURL(file)
    ElMessage.success('Logo上传成功')
  }, 1000)
}

// 测试邮件发送
const handleTestEmail = async () => {
  try {
    // 这里应该调用测试邮件API
    ElMessage.success('测试邮件发送成功，请检查收件箱')
  } catch (error) {
    console.error('测试邮件发送失败:', error)
    ElMessage.error('测试邮件发送失败')
  }
}

// 清除缓存
const handleClearCache = async () => {
  try {
    // 这里应该调用清除缓存API
    ElMessage.success('缓存清除成功')
  } catch (error) {
    console.error('清除缓存失败:', error)
    ElMessage.error('清除缓存失败')
  }
}

// 初始化
onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.system-config-container {
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

.logo-uploader .logo {
  width: 178px;
  height: 178px;
  display: block;
}

.logo-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.logo-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.el-icon.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>