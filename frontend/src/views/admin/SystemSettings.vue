<template>
  <div class="system-settings-container">
    <!-- 删除重复的面包屑导航，由AdminLayout统一提供 -->
    <div class="header-actions">
      <el-button type="primary" @click="handleRefresh">
        <el-icon>
          <Refresh />
        </el-icon>
        刷新
      </el-button>
    </div>


        
          <el-card>
            <template #header>
              <div class="card-header">
                <span class="settings-info">系统配置信息</span>
              </div>
            </template>

            <!-- 设置标签页 -->
            <el-tabs v-model="activeTab" type="card">
              <!-- 基本设置 -->
              <el-tab-pane label="基本设置" name="basic">
                <el-form :model="settings.basic" :rules="rules.basic" ref="basicFormRef" label-width="180px"
                  class="settings-form">
                  <el-form-item label="系统名称" prop="systemName">
                    <el-input v-model="settings.basic.systemName" placeholder="请输入系统名称" />
                  </el-form-item>

                  <el-form-item label="系统版本" prop="systemVersion">
                    <el-input v-model="settings.basic.systemVersion" placeholder="请输入系统版本号" disabled />
                  </el-form-item>

                  <el-form-item label="网站域名" prop="domain">
                    <el-input v-model="settings.basic.domain" placeholder="请输入网站域名" />
                  </el-form-item>

                  <el-form-item label="备案号" prop="icpCode">
                    <el-input v-model="settings.basic.icpCode" placeholder="请输入ICP备案号" />
                  </el-form-item>

                  <el-form-item label="系统描述" prop="description">
                    <el-input v-model="settings.basic.description" type="textarea" :rows="3" placeholder="请输入系统描述" />
                  </el-form-item>

                  <el-form-item label="客服邮箱" prop="supportEmail">
                    <el-input v-model="settings.basic.supportEmail" placeholder="请输入客服邮箱" />
                  </el-form-item>

                  <el-form-item label="客服电话" prop="supportPhone">
                    <el-input v-model="settings.basic.supportPhone" placeholder="请输入客服电话" />
                  </el-form-item>

                  <el-form-item label="是否开启注册" prop="allowRegister">
                    <el-switch v-model="settings.basic.allowRegister" />
                  </el-form-item>

                  <el-form-item label="是否开启验证码" prop="enableCaptcha">
                    <el-switch v-model="settings.basic.enableCaptcha" />
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 上传设置 -->
              <el-tab-pane label="上传设置" name="upload">
                <el-form :model="settings.upload" :rules="rules.upload" ref="uploadFormRef" label-width="180px"
                  class="settings-form">
                  <el-form-item label="允许上传格式" prop="allowedExtensions">
                    <el-input v-model="settings.upload.allowedExtensions" placeholder="请输入允许的文件格式，用逗号分隔" />
                    <div class="form-hint">例如: mp4,avi,wmv,flv,mkv</div>
                  </el-form-item>

                  <el-form-item label="单个文件大小限制(M)" prop="maxFileSize">
                    <el-input-number v-model="settings.upload.maxFileSize" :min="1" :max="2048" :step="1" />
                  </el-form-item>

                  <el-form-item label="视频清晰度设置" prop="videoQualities">
                    <el-checkbox-group v-model="settings.upload.videoQualities">
                      <el-checkbox value="360p">360p (流畅)</el-checkbox>
                      <el-checkbox value="480p">480p (标清)</el-checkbox>
                      <el-checkbox value="720p">720p (高清)</el-checkbox>
                      <el-checkbox value="1080p">1080p (超清)</el-checkbox>
                      <el-checkbox value="4K">4K (蓝光)</el-checkbox>
                    </el-checkbox-group>
                    <div class="form-hint">选择系统支持的视频清晰度，至少选择一项</div>
                  </el-form-item>

                  <el-form-item label="默认清晰度" prop="defaultQuality">
                    <el-select v-model="settings.upload.defaultQuality" placeholder="请选择默认清晰度">
                      <el-option label="360p (流畅)" value="360p" />
                      <el-option label="480p (标清)" value="480p" />
                      <el-option label="720p (高清)" value="720p" />
                      <el-option label="1080p (超清)" value="1080p" />
                      <el-option label="4K (蓝光)" value="4K" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="是否自动转码" prop="autoTranscode">
                    <el-switch v-model="settings.upload.autoTranscode" />
                  </el-form-item>

                  <el-form-item label="转码优先级" prop="transcodePriority">
                    <el-radio-group v-model="settings.upload.transcodePriority">
                      <el-radio value="quality">画质优先</el-radio>
                      <el-radio value="speed">速度优先</el-radio>
                      <el-radio value="balance">平衡</el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item label="缩略图生成方式" prop="thumbnailType">
                    <el-select v-model="settings.upload.thumbnailType" placeholder="请选择缩略图生成方式">
                      <el-option label="随机帧" value="random" />
                      <el-option label="第一帧" value="first" />
                      <el-option label="指定时间点" value="specific" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="指定时间点(秒)" prop="thumbnailTime"
                    v-if="settings.upload.thumbnailType === 'specific'">
                    <el-input-number v-model="settings.upload.thumbnailTime" :min="0" :max="3600" :step="1" />
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 存储设置 -->
              <el-tab-pane label="存储设置" name="storage">
                <el-form :model="settings.storage" :rules="rules.storage" ref="storageFormRef" label-width="180px"
                  class="settings-form">
                  <el-form-item label="存储类型" prop="storageType">
                    <el-select v-model="settings.storage.storageType" placeholder="请选择存储类型">
                      <el-option label="本地存储" value="local" />
                      <el-option label="阿里云OSS" value="oss" />
                      <el-option label="腾讯云COS" value="cos" />
                      <el-option label="AWS S3" value="s3" />
                    </el-select>
                  </el-form-item>

                  <!-- 本地存储设置 -->
                  <template v-if="settings.storage.storageType === 'local'">
                    <el-form-item label="本地存储路径" prop="localPath">
                      <el-input v-model="settings.storage.localPath" placeholder="请输入本地存储路径" />
                      <div class="form-hint">相对于项目根目录的路径</div>
                    </el-form-item>

                    <el-form-item label="访问URL前缀" prop="localUrlPrefix">
                      <el-input v-model="settings.storage.localUrlPrefix" placeholder="请输入访问URL前缀" />
                      <div class="form-hint">例如: /uploads 或 http://cdn.example.com/uploads</div>
                    </el-form-item>
                  </template>

                  <!-- 阿里云OSS设置 -->
                  <template v-if="settings.storage.storageType === 'oss'">
                    <el-form-item label="AccessKeyId" prop="ossAccessKeyId">
                      <el-input v-model="settings.storage.ossAccessKeyId" placeholder="请输入AccessKeyId" />
                    </el-form-item>

                    <el-form-item label="AccessKeySecret" prop="ossAccessKeySecret">
                      <el-input v-model="settings.storage.ossAccessKeySecret" type="password"
                        placeholder="请输入AccessKeySecret" />
                    </el-form-item>

                    <el-form-item label="Bucket名称" prop="ossBucket">
                      <el-input v-model="settings.storage.ossBucket" placeholder="请输入Bucket名称" />
                    </el-form-item>

                    <el-form-item label="区域" prop="ossRegion">
                      <el-input v-model="settings.storage.ossRegion" placeholder="请输入OSS区域" />
                    </el-form-item>

                    <el-form-item label="访问域名" prop="ossDomain">
                      <el-input v-model="settings.storage.ossDomain" placeholder="请输入访问域名" />
                    </el-form-item>
                  </template>

                  <!-- 腾讯云COS设置 -->
                  <template v-if="settings.storage.storageType === 'cos'">
                    <el-form-item label="SecretId" prop="cosSecretId">
                      <el-input v-model="settings.storage.cosSecretId" placeholder="请输入SecretId" />
                    </el-form-item>

                    <el-form-item label="SecretKey" prop="cosSecretKey">
                      <el-input v-model="settings.storage.cosSecretKey" type="password" placeholder="请输入SecretKey" />
                    </el-form-item>

                    <el-form-item label="Bucket名称" prop="cosBucket">
                      <el-input v-model="settings.storage.cosBucket" placeholder="请输入Bucket名称" />
                    </el-form-item>

                    <el-form-item label="区域" prop="cosRegion">
                      <el-input v-model="settings.storage.cosRegion" placeholder="请输入COS区域" />
                    </el-form-item>
                  </template>

                  <el-form-item label="文件过期时间(天)" prop="fileExpireDays">
                    <el-input-number v-model="settings.storage.fileExpireDays" :min="0" :max="3650" :step="1" />
                    <div class="form-hint">0表示永不过期</div>
                  </el-form-item>

                  <el-form-item label="是否开启自动清理" prop="enableAutoClean">
                    <el-switch v-model="settings.storage.enableAutoClean" />
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 性能设置 -->
              <el-tab-pane label="性能设置" name="performance">
                <el-form :model="settings.performance" :rules="rules.performance" ref="performanceFormRef"
                  label-width="180px" class="settings-form">
                  <el-form-item label="缓存过期时间(秒)" prop="cacheExpireTime">
                    <el-input-number v-model="settings.performance.cacheExpireTime" :min="0" :max="86400" :step="10" />
                    <div class="form-hint">0表示不缓存</div>
                  </el-form-item>

                  <el-form-item label="视频播放缓冲区(秒)" prop="videoBufferTime">
                    <el-input-number v-model="settings.performance.videoBufferTime" :min="1" :max="60" :step="1" />
                  </el-form-item>

                  <el-form-item label="并发上传数" prop="maxConcurrentUploads">
                    <el-input-number v-model="settings.performance.maxConcurrentUploads" :min="1" :max="10" :step="1" />
                  </el-form-item>

                  <el-form-item label="转码队列最大任务数" prop="maxTranscodeTasks">
                    <el-input-number v-model="settings.performance.maxTranscodeTasks" :min="1" :max="50" :step="1" />
                  </el-form-item>

                  <el-form-item label="页面缓存时长(分钟)" prop="pageCacheMinutes">
                    <el-input-number v-model="settings.performance.pageCacheMinutes" :min="0" :max="1440" :step="5" />
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- SEO设置 -->
              <el-tab-pane label="SEO设置" name="seo">
                <el-form :model="settings.seo" :rules="rules.seo" ref="seoFormRef" label-width="180px"
                  class="settings-form">
                  <el-form-item label="网站标题" prop="title">
                    <el-input v-model="settings.seo.title" placeholder="请输入网站标题" />
                  </el-form-item>

                  <el-form-item label="网站关键词" prop="keywords">
                    <el-input v-model="settings.seo.keywords" placeholder="请输入网站关键词，用逗号分隔" />
                  </el-form-item>

                  <el-form-item label="网站描述" prop="description">
                    <el-input v-model="settings.seo.description" type="textarea" :rows="3" placeholder="请输入网站描述" />
                  </el-form-item>

                  <el-form-item label="网站首页URL" prop="homepageUrl">
                    <el-input v-model="settings.seo.homepageUrl" placeholder="请输入网站首页URL" />
                  </el-form-item>

                  <el-form-item label="是否生成Sitemap" prop="enableSitemap">
                    <el-switch v-model="settings.seo.enableSitemap" />
                  </el-form-item>

                  <el-form-item label="Sitemap更新频率" prop="sitemapUpdateFrequency" v-if="settings.seo.enableSitemap">
                    <el-select v-model="settings.seo.sitemapUpdateFrequency" placeholder="请选择更新频率">
                      <el-option label="总是" value="always" />
                      <el-option label="每小时" value="hourly" />
                      <el-option label="每天" value="daily" />
                      <el-option label="每周" value="weekly" />
                      <el-option label="每月" value="monthly" />
                      <el-option label="每年" value="yearly" />
                      <el-option label="从不" value="never" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="是否启用机器人索引" prop="enableRobotIndex">
                    <el-switch v-model="settings.seo.enableRobotIndex" />
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 邮件设置 -->
              <el-tab-pane label="邮件设置" name="email">
                <el-form :model="settings.email" :rules="rules.email" ref="emailFormRef" label-width="180px"
                  class="settings-form">
                  <el-form-item label="SMTP服务器" prop="smtpHost">
                    <el-input v-model="settings.email.smtpHost" placeholder="请输入SMTP服务器地址" />
                  </el-form-item>

                  <el-form-item label="SMTP端口" prop="smtpPort">
                    <el-input-number v-model="settings.email.smtpPort" :min="1" :max="65535" :step="1" />
                  </el-form-item>

                  <el-form-item label="SMTP用户名" prop="smtpUsername">
                    <el-input v-model="settings.email.smtpUsername" placeholder="请输入SMTP用户名" />
                  </el-form-item>

                  <el-form-item label="SMTP密码" prop="smtpPassword">
                    <el-input v-model="settings.email.smtpPassword" type="password" placeholder="请输入SMTP密码" />
                  </el-form-item>

                  <el-form-item label="发件人邮箱" prop="fromEmail">
                    <el-input v-model="settings.email.fromEmail" placeholder="请输入发件人邮箱" />
                  </el-form-item>

                  <el-form-item label="发件人名称" prop="fromName">
                    <el-input v-model="settings.email.fromName" placeholder="请输入发件人名称" />
                  </el-form-item>

                  <el-form-item label="是否使用SSL" prop="useSsl">
                    <el-switch v-model="settings.email.useSsl" />
                  </el-form-item>

                  <el-form-item label="是否使用TLS" prop="useTls" v-if="!settings.email.useSsl">
                    <el-switch v-model="settings.email.useTls" />
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="handleTestEmail">测试邮件发送</el-button>
                    <div class="form-hint">请在测试前保存当前设置</div>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 第三方集成 -->
              <el-tab-pane label="第三方集成" name="integrations">
                <el-form :model="settings.integrations" :rules="rules.integrations" ref="integrationsFormRef"
                  label-width="180px" class="settings-form">
                  <el-form-item label="是否启用微信登录" prop="enableWechatLogin">
                    <el-switch v-model="settings.integrations.enableWechatLogin" />
                  </el-form-item>

                  <template v-if="settings.integrations.enableWechatLogin">
                    <el-form-item label="微信AppID" prop="wechatAppId">
                      <el-input v-model="settings.integrations.wechatAppId" placeholder="请输入微信AppID" />
                    </el-form-item>

                    <el-form-item label="微信AppSecret" prop="wechatAppSecret">
                      <el-input v-model="settings.integrations.wechatAppSecret" type="password"
                        placeholder="请输入微信AppSecret" />
                    </el-form-item>
                  </template>

                  <el-form-item label="是否启用QQ登录" prop="enableQQLogin">
                    <el-switch v-model="settings.integrations.enableQQLogin" />
                  </el-form-item>

                  <template v-if="settings.integrations.enableQQLogin">
                    <el-form-item label="QQ AppID" prop="qqAppId">
                      <el-input v-model="settings.integrations.qqAppId" placeholder="请输入QQ AppID" />
                    </el-form-item>

                    <el-form-item label="QQ AppKey" prop="qqAppKey">
                      <el-input v-model="settings.integrations.qqAppKey" type="password" placeholder="请输入QQ AppKey" />
                    </el-form-item>
                  </template>

                  <el-form-item label="是否启用内容审核" prop="enableContentReview">
                    <el-switch v-model="settings.integrations.enableContentReview" />
                  </el-form-item>

                  <template v-if="settings.integrations.enableContentReview">
                    <el-form-item label="审核服务类型" prop="reviewServiceType">
                      <el-select v-model="settings.integrations.reviewServiceType" placeholder="请选择审核服务类型">
                        <el-option label="阿里云内容审核" value="aliyun" />
                        <el-option label="腾讯云内容审核" value="tencent" />
                        <el-option label="百度云内容审核" value="baidu" />
                      </el-select>
                    </el-form-item>
                  </template>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-card>
    

    <!-- 测试邮件对话框 -->
    <el-dialog v-model="testEmailDialogVisible" title="测试邮件发送" width="400px" :before-close="handleCloseTestEmailDialog">
      <el-form :model="testEmailForm" :rules="testEmailRules" ref="testEmailFormRef" label-width="100px">
        <el-form-item label="接收邮箱" prop="recipientEmail">
          <el-input v-model="testEmailForm.recipientEmail" placeholder="请输入接收邮箱地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseTestEmailDialog">取消</el-button>
        <el-button type="primary" @click="confirmTestEmail" :loading="sendingEmail">发送测试邮件</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  Refresh,
  Download,
  Delete,
  Search,
  Filter,
  Check,
  Edit,
  Bell,
  WarningFilled,
  InfoFilled
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccess, showError } from '../../utils/message.js'


const activeTab = ref('basic')
const loading = ref(false)
const testEmailDialogVisible = ref(false)
const sendingEmail = ref(false)

// 表单引用
const basicFormRef = ref(null)
const uploadFormRef = ref(null)
const storageFormRef = ref(null)
const performanceFormRef = ref(null)
const seoFormRef = ref(null)
const emailFormRef = ref(null)
const integrationsFormRef = ref(null)
const testEmailFormRef = ref(null)

// 测试邮件表单
const testEmailForm = reactive({
  recipientEmail: ''
})

// 测试邮件表单验证规则
const testEmailRules = reactive({
  recipientEmail: [
    { required: true, message: '请输入接收邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
})

// 系统设置数据
const settings = reactive({
  // 基本设置
  basic: {
    systemName: '视频管理系统',
    systemVersion: '1.0.0',
    domain: 'http://localhost:3000',
    icpCode: '京ICP备XXXXXXXX号-1',
    description: '专业的视频管理与分享平台',
    supportEmail: 'support@example.com',
    supportPhone: '400-123-4567',
    allowRegister: true,
    enableCaptcha: true
  },
  
  // 上传设置
  upload: {
    allowedExtensions: 'mp4,avi,wmv,flv,mkv,mpg,mov,webm',
    maxFileSize: 500,
    videoQualities: ['480p', '720p'],
    defaultQuality: '720p',
    autoTranscode: true,
    transcodePriority: 'balance',
    thumbnailType: 'random',
    thumbnailTime: 10
  },
  
  // 存储设置
  storage: {
    storageType: 'local',
    localPath: './uploads',
    localUrlPrefix: '/uploads',
    ossAccessKeyId: '',
    ossAccessKeySecret: '',
    ossBucket: '',
    ossRegion: '',
    ossDomain: '',
    cosSecretId: '',
    cosSecretKey: '',
    cosBucket: '',
    cosRegion: '',
    fileExpireDays: 0,
    enableAutoClean: false
  },
  
  // 性能设置
  performance: {
    cacheExpireTime: 3600,
    videoBufferTime: 10,
    maxConcurrentUploads: 3,
    maxTranscodeTasks: 5,
    pageCacheMinutes: 30
  },
  
  // SEO设置
  seo: {
    title: '视频管理系统 - 专业的视频管理与分享平台',
    keywords: '视频管理,视频分享,视频上传,视频播放',
    description: '专业的视频管理与分享平台，支持视频上传、分享、播放等功能',
    homepageUrl: 'http://localhost:3000',
    enableSitemap: true,
    sitemapUpdateFrequency: 'daily',
    enableRobotIndex: true
  },
  
  // 邮件设置
  email: {
    smtpHost: 'smtp.example.com',
    smtpPort: 465,
    smtpUsername: 'noreply@example.com',
    smtpPassword: '',
    fromEmail: 'noreply@example.com',
    fromName: '视频管理系统',
    useSsl: true,
    useTls: false
  },
  
  // 第三方集成
  integrations: {
    enableWechatLogin: false,
    wechatAppId: '',
    wechatAppSecret: '',
    enableQQLogin: false,
    qqAppId: '',
    qqAppKey: '',
    enableContentReview: false,
    reviewServiceType: 'aliyun'
  }
})

// 表单验证规则
const rules = reactive({
  // 基本设置验证规则
  basic: {
    systemName: [
      { required: true, message: '请输入系统名称', trigger: 'blur' },
      { max: 100, message: '系统名称不能超过100个字符', trigger: 'blur' }
    ],
    domain: [
      { required: true, message: '请输入网站域名', trigger: 'blur' },
      { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
    ],
    supportEmail: [
      { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
    ],
    supportPhone: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
    ]
  },
  
  // 上传设置验证规则
  upload: {
    allowedExtensions: [
      { required: true, message: '请输入允许的文件格式', trigger: 'blur' }
    ],
    maxFileSize: [
      { required: true, message: '请输入文件大小限制', trigger: 'blur' }
    ],
    videoQualities: [
      { required: true, type: 'array', min: 1, message: '至少选择一项清晰度', trigger: 'change' }
    ],
    defaultQuality: [
      { required: true, message: '请选择默认清晰度', trigger: 'change' }
    ]
  },
  
  // 存储设置验证规则
  storage: {
    storageType: [
      { required: true, message: '请选择存储类型', trigger: 'change' }
    ],
    localPath: [
      { required: true, message: '请输入本地存储路径', trigger: 'blur' }
    ],
    localUrlPrefix: [
      { required: true, message: '请输入访问URL前缀', trigger: 'blur' }
    ]
  },
  
  // 其他设置的验证规则...
  performance: {},
  seo: {},
  email: {},
  integrations: {}
})

// 方法：处理菜单选择
function handleMenuSelect(key) {
  activeMenu.value = key
  console.log('选择菜单:', key)
  // 根据选择的菜单项跳转到相应页面
}

// 方法：保存设置
function handleSaveSettings() {
  // 根据当前激活的标签页验证对应的表单
  let formToValidate
  switch (activeTab.value) {
    case 'basic':
      formToValidate = basicFormRef.value
      break
    case 'upload':
      formToValidate = uploadFormRef.value
      break
    case 'storage':
      formToValidate = storageFormRef.value
      break
    case 'performance':
      formToValidate = performanceFormRef.value
      break
    case 'seo':
      formToValidate = seoFormRef.value
      break
    case 'email':
      formToValidate = emailFormRef.value
      break
    case 'integrations':
      formToValidate = integrationsFormRef.value
      break
    default:
      formToValidate = basicFormRef.value
  }
  
  formToValidate.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟API调用保存设置
      setTimeout(() => {
        loading.value = false
        showSuccess('设置保存成功')
      }, 1000)
    } else {
      showError('请检查并修正表单中的错误')
      return false
    }
  })
}

// 方法：重置设置
function handleResetSettings() {
  ElMessageBox.confirm(
    '确定要重置当前标签页的设置吗？',
    '确认重置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 根据当前激活的标签页重置对应的表单
    let formToReset
    switch (activeTab.value) {
      case 'basic':
        formToReset = basicFormRef.value
        break
      case 'upload':
        formToReset = uploadFormRef.value
        break
      case 'storage':
        formToReset = storageFormRef.value
        break
      case 'performance':
        formToReset = performanceFormRef.value
        break
      case 'seo':
        formToReset = seoFormRef.value
        break
      case 'email':
        formToReset = emailFormRef.value
        break
      case 'integrations':
        formToReset = integrationsFormRef.value
        break
      default:
        formToReset = basicFormRef.value
    }
    
    if (formToReset) {
      formToReset.resetFields()
      showSuccess('设置已重置')
    }
  }).catch(() => {
    // 取消重置
  })
}

// 方法：刷新页面数据
function handleRefresh() {
  loading.value = true
  // 模拟API调用重新加载设置数据
  setTimeout(() => {
    loading.value = false
    showSuccess('数据已刷新')
  }, 500)
}

// 方法：处理测试邮件发送
function handleTestEmail() {
  testEmailDialogVisible.value = true
}

// 方法：关闭测试邮件对话框
function handleCloseTestEmailDialog() {
  testEmailDialogVisible.value = false
  testEmailForm.recipientEmail = ''
  if (testEmailFormRef.value) {
    testEmailFormRef.value.resetFields()
  }
}

// 方法：确认发送测试邮件
function confirmTestEmail() {
  testEmailFormRef.value.validate((valid) => {
    if (valid) {
      sendingEmail.value = true
      // 模拟API调用发送测试邮件
      setTimeout(() => {
        sendingEmail.value = false
        testEmailDialogVisible.value = false
        showSuccess(`测试邮件已发送至 ${testEmailForm.recipientEmail}`)
        testEmailForm.recipientEmail = ''
      }, 2000)
    }
  })
}

// 组件挂载时的处理
onMounted(() => {
  // 模拟加载设置数据
  loading.value = true
  setTimeout(() => {
    loading.value = false
    // 实际项目中这里应该从API获取设置数据
  }, 500)
})
</script>

<style scoped>
.system-settings-container {
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

.settings-form {
  padding: 20px 0;
}

.form-hint {
  margin-top: 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 标签页样式 */
.el-tabs {
  margin-top: 10px;
}

.el-tabs__content {
  padding-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  
  .content {
    padding: 10px;
  }
  
  .settings-form {
    padding: 10px 0;
  }
  
  .el-form-item__label {
    width: 100px !important;
  }
}
</style>