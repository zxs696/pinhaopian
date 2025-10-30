<template>
  <div class="upload-container">
    <!-- 顶部导航 -->
    <div class="upload-header">
      <div class="header-content">
        <h1 class="upload-title">上传视频</h1>
        <p class="upload-subtitle">创作你的精彩内容，与世界分享</p>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="upload-main">
      <!-- 左侧步骤指示 -->
      <div class="upload-sidebar">
        <div class="upload-guide">
          <h3 class="guide-title">上传步骤</h3>
          <div class="guide-steps">
            <div class="step-item active">
              <div class="step-number">1</div>
              <div class="step-text">选择视频</div>
            </div>
            <div class="step-item" :class="{ active: videoFile }">
              <div class="step-number">2</div>
              <div class="step-text">填写信息</div>
            </div>
            <div class="step-item" :class="{ active: uploading }">
              <div class="step-number">3</div>
              <div class="step-text">上传完成</div>
            </div>
          </div>
        </div>
        
        <div class="upload-tips">
          <h3 class="tips-title">上传须知</h3>
          <ul class="tips-list">
            <li>支持 MP4、WebM、MOV 格式</li>
            <li>单个文件不超过 200MB</li>
            <li>视频标题最多 100 个字符</li>
            <li>每个视频最多添加 5 个标签</li>
            <li>请遵守社区规范，文明上传</li>
          </ul>
        </div>
      </div>
      
      <!-- 右侧上传区域 -->
      <div class="upload-content">
        <!-- 视频上传区域 -->
        <div class="upload-card">
          <el-upload
            class="bilibili-upload"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleVideoChange"
            :before-upload="beforeUpload"
            accept="video/*"
            :limit="1"
            :on-exceed="handleExceed"
          >
            <div class="upload-icon">
              <el-icon size="64"><upload-filled /></el-icon>
            </div>
            <div class="upload-text">
              <div class="upload-main-text">点击或拖拽视频文件到此区域上传</div>
              <div class="upload-sub-text">支持 MP4、WebM、MOV 格式，单个文件不超过 200MB</div>
            </div>
          </el-upload>
          
          <!-- 视频预览 -->
          <div v-if="videoFile" class="video-preview">
            <div class="preview-header">
              <h3 class="preview-title">视频预览</h3>
              <el-button link @click="removeVideo" class="remove-btn">
                <el-icon><Delete /></el-icon>
                重新选择
              </el-button>
            </div>
            <div class="video-container">
              <video :src="videoUrl" controls class="preview-video" />
            </div>
          </div>
        </div>
        
        <!-- 视频信息表单 -->
        <el-form v-if="videoFile" :model="videoForm" label-width="80px" class="video-info-form">
          <el-form-item label="标题" required>
            <el-input 
              v-model="videoForm.title" 
              placeholder="添加一个吸引人的标题，更容易获得关注哦~" 
              maxlength="100" 
              show-word-limit
              class="bilibili-input"
            />
          </el-form-item>
          
          <el-form-item label="简介">
            <el-input
              v-model="videoForm.description"
              type="textarea"
              :rows="5"
              placeholder="添加视频简介，让观众更了解你的作品（选填）"
              maxlength="500"
              show-word-limit
              class="bilibili-textarea"
            />
          </el-form-item>
          
          <el-form-item label="分区" required>
            <el-select v-model="videoForm.category" placeholder="请选择视频分区" class="bilibili-select">
              <el-option label="生活" value="life" />
              <el-option label="科技" value="tech" />
              <el-option label="娱乐" value="entertainment" />
              <el-option label="教育" value="education" />
              <el-option label="音乐" value="music" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="标签">
            <div class="bilibili-tag-container">
              <el-input
                v-model="inputTag"
                placeholder="输入标签，按回车添加，最多5个"
                class="tag-input"
                @keyup.enter="addTag"
                @keyup.delete="handleDeleteKey"
                maxlength="10"
                show-word-limit
              />
              <div class="tag-list">
                <el-tag
                  v-for="(tag, index) in videoForm.tags"
                  :key="index"
                  closable
                  @close="removeTag(index)"
                  class="bilibili-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item>
            <div class="form-actions">
              <el-button 
                type="primary" 
                :loading="uploading" 
                @click="submitUpload"
                class="upload-submit-btn"
              >
                <el-icon v-if="!uploading"><Upload /></el-icon>
                <el-icon v-else><Loading /></el-icon>
                {{ uploading ? '上传中...' : '提交上传' }}
              </el-button>
              <el-button @click="cancelUpload" class="cancel-btn">取消</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
// 视频上传页面逻辑 - 哔哩哔哩风格
import { ref } from 'vue'
import { UploadFilled, Upload, Delete, Loading } from '@element-plus/icons-vue'
import { showError, showWarning, showInfo, showSuccess } from '../../utils/message.js'

// 上传状态
const uploading = ref(false)
const videoFile = ref(null)
const videoUrl = ref('')
// 标签输入相关
const inputTag = ref('')

// 视频信息表单
const videoForm = ref({
  title: '',
  description: '',
  category: '',
  tags: []
})

// 处理文件选择
function handleVideoChange(file) {
  videoFile.value = file.raw
  // 创建视频预览URL
  videoUrl.value = URL.createObjectURL(videoFile.value)
  
  // 自动填充标题（从文件名）
  if (videoFile.value.name) {
    const fileName = videoFile.value.name.split('.').slice(0, -1).join('.')
    videoForm.value.title = fileName
  }
}

// 文件上传前校验
function beforeUpload(file) {
  const fileSize = file.size / 1024 / 1024
  if (fileSize > 200) {
    showError('视频文件大小不能超过200MB')
    return false
  }
  
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime']
  if (!validTypes.includes(file.type)) {
    showError('只支持MP4、WebM、MOV格式的视频文件')
    return false
  }
  
  return true
}

// 处理文件超出限制
function handleExceed(files, fileList) {
  showWarning(`只能上传一个视频文件，已选择 ${files.length} 个文件`)
}

// 提交上传
function submitUpload() {
  // 表单验证
  if (!videoForm.value.title) {
    showError('请输入视频标题')
    return
  }
  
  if (!videoForm.value.category) {
    showError('请选择视频分类')
    return
  }
  
  if (!videoFile.value) {
    showError('请选择要上传的视频文件')
    return
  }
  
  uploading.value = true
  
  // 模拟上传过程
  setTimeout(() => {
    uploading.value = false
    
    showSuccess('您的视频已成功上传，正在审核中')
    
    // 重置表单
    resetForm()
  }, 2000)
}

// 取消上传
function cancelUpload() {
  resetForm()
  showInfo('已取消上传')
}

// 添加标签
function addTag() {
  const tag = inputTag.value.trim()
  if (tag && videoForm.value.tags.length < 5 && !videoForm.value.tags.includes(tag)) {
    if (tag.length <= 10) {
      videoForm.value.tags.push(tag)
      inputTag.value = ''
    } else {
      showWarning('标签长度不能超过10个字符')
    }
  } else if (videoForm.value.tags.length >= 5) {
    showWarning('最多只能添加5个标签')
  }
}

// 移除标签
function removeTag(index) {
  videoForm.value.tags.splice(index, 1)
}

// 移除视频并重新选择
function removeVideo() {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
  videoFile.value = null
  videoUrl.value = ''
  showInfo('请重新选择视频文件')
}

// 处理删除键
function handleDeleteKey() {
  if (!inputTag.value && videoForm.value.tags.length > 0) {
    videoForm.value.tags.pop()
  }
}

// 重置表单
function resetForm() {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
  
  videoFile.value = null
  videoUrl.value = ''
  inputTag.value = ''
  videoForm.value = {
    title: '',
    description: '',
    category: '',
    tags: []
  }
}
</script>

<style scoped>
/* 哔哩哔哩风格上传页面样式 */
.upload-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部标题区域 */
.upload-header {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 32px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.upload-title {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 32px;
  font-weight: 600;
}

.upload-subtitle {
  margin: 0;
  color: #666;
  font-size: 16px;
}

/* 主内容区域 */
.upload-main {
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 20px;
  display: flex;
  gap: 24px;
}

/* 左侧侧边栏 */
.upload-sidebar {
  width: 260px;
  flex-shrink: 0;
}

.upload-guide,
.upload-tips {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.guide-title,
.tips-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
}

.guide-title::before,
.tips-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: #00a1d6;
  margin-right: 8px;
  border-radius: 2px;
}

/* 步骤指示器 */
.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  align-items: center;
  color: #999;
  transition: all 0.2s ease;
}

.step-item.active {
  color: #00a1d6;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
  transition: all 0.2s ease;
}

.step-item.active .step-number {
  background-color: #00a1d6;
  color: white;
}

.step-text {
  font-size: 14px;
}

/* 上传须知 */
.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  padding-left: 16px;
  position: relative;
  line-height: 1.5;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #00a1d6;
  font-size: 16px;
}

/* 右侧上传内容区 */
.upload-content {
  flex: 1;
  min-width: 0;
}

/* 上传卡片 */
.upload-card {
  background-color: white;
  border-radius: 8px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 哔哩哔哩风格上传区域 */
.bilibili-upload {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  padding: 60px 20px;
}

.bilibili-upload:hover {
  border-color: #00a1d6;
  background-color: #f2f7ff;
}

.bilibili-upload.drag-over {
  border-color: #00a1d6;
  background-color: #f2f7ff;
}

.upload-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.upload-icon el-icon {
  color: #00a1d6;
}

.upload-text {
  text-align: center;
}

.upload-main-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.upload-sub-text {
  font-size: 14px;
  color: #999;
}

/* 视频预览 */
.video-preview {
  margin-top: 32px;
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.remove-btn {
  color: #ff6b6b;
  font-size: 14px;
  transition: color 0.2s ease;
}

.remove-btn:hover {
  color: #ff4444;
}

.video-container {
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 16 / 9;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 视频信息表单 */
.video-info-form {
  background-color: white;
  border-radius: 8px;
  padding: 24px 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 哔哩哔哩风格表单组件 */
.bilibili-input,
.bilibili-textarea,
.bilibili-select {
  border-radius: 4px;
  transition: all 0.2s ease;
}

.bilibili-input:focus,
.bilibili-textarea:focus,
.bilibili-select:focus {
  border-color: #00a1d6;
  box-shadow: 0 0 0 2px rgba(0, 161, 214, 0.2);
}

/* 标签样式 */
.bilibili-tag-container {
  margin-bottom: 10px;
}

.tag-input {
  margin-bottom: 12px;
  width: 300px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.bilibili-tag {
  background-color: #f2f7ff;
  border-color: #00a1d6;
  color: #00a1d6;
  font-size: 13px;
  padding: 6px 12px;
  margin-bottom: 0;
  transition: all 0.2s ease;
}

.bilibili-tag:hover {
  background-color: #e6f2ff;
  border-color: #0086c3;
  color: #0086c3;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.upload-submit-btn {
  background-color: #00a1d6;
  border-color: #00a1d6;
  font-size: 16px;
  padding: 10px 32px;
  transition: all 0.2s ease;
}

.upload-submit-btn:hover:not(:disabled) {
  background-color: #0086c3;
  border-color: #0086c3;
}

.upload-submit-btn el-icon {
  margin-right: 6px;
}

.cancel-btn {
  font-size: 16px;
  padding: 10px 32px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  color: #00a1d6;
  border-color: #00a1d6;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .upload-main {
    flex-direction: column;
  }
  
  .upload-sidebar {
    width: 100%;
  }
  
  .upload-guide,
  .upload-tips {
    display: inline-block;
    margin-right: 16px;
    margin-bottom: 16px;
    width: calc(50% - 8px);
    vertical-align: top;
  }
}

@media (max-width: 768px) {
  .upload-header {
    padding: 24px 0;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .upload-title {
    font-size: 24px;
  }
  
  .upload-subtitle {
    font-size: 14px;
  }
  
  .upload-main {
    padding: 0 16px;
    margin: 24px auto;
  }
  
  .upload-guide,
  .upload-tips {
    width: 100%;
    margin-right: 0;
    padding: 16px;
  }
  
  .upload-card {
    padding: 24px 16px;
  }
  
  .bilibili-upload {
    padding: 40px 16px;
  }
  
  .video-info-form {
    padding: 20px 16px;
  }
  
  .tag-input {
    width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .upload-submit-btn,
  .cancel-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .upload-card {
    padding: 20px 12px;
  }
  
  .upload-icon el-icon {
    font-size: 48px;
  }
  
  .upload-main-text {
    font-size: 14px;
  }
  
  .upload-sub-text {
    font-size: 12px;
  }
  
  .video-container {
    aspect-ratio: 9 / 16;
  }
}
</style>