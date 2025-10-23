<template>
  <div class="upload-container">
    <el-container class="main-container">
      <el-main>
        <div class="upload-header">
          <h1>上传视频</h1>
          <p>分享你的精彩瞬间，让更多人看到</p>
        </div>
        
        <el-card class="upload-card">
          <el-upload
            class="video-upload"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleVideoChange"
            :before-upload="beforeUpload"
            accept="video/*"
            :limit="1"
            :on-exceed="handleExceed"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              <em>点击或拖拽视频文件到此区域上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 MP4、WebM、MOV 格式，单个文件不超过 200MB
              </div>
            </template>
          </el-upload>
          
          <div v-if="videoFile" class="video-preview">
            <h3>视频预览</h3>
            <video :src="videoUrl" controls class="preview-video" />            
          </div>
        </el-card>
        
        <el-form v-if="videoFile" :model="videoForm" label-width="120px" class="video-info-form">
          <el-form-item label="视频标题" required>
            <el-input 
              v-model="videoForm.title" 
              placeholder="请输入视频标题" 
              maxlength="100" 
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="视频描述">
            <el-input
              v-model="videoForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入视频描述（选填）"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="选择分类" required>
            <el-select v-model="videoForm.category" placeholder="请选择视频分类">
              <el-option label="生活" value="life" />
              <el-option label="科技" value="tech" />
              <el-option label="娱乐" value="entertainment" />
              <el-option label="教育" value="education" />
              <el-option label="音乐" value="music" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="标签">
            <div class="tag-input-container">
              <el-input
                v-model="inputTag"
                placeholder="请输入标签，按回车添加"
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
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="form-tip">最多添加5个标签，每个标签不超过10个字符</div>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" :loading="uploading" @click="submitUpload">
              提交上传
            </el-button>
            <el-button @click="cancelUpload">取消</el-button>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
// 视频上传页面逻辑
import { ref, computed, reactive } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
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
.upload-container {
  min-height: 100vh;
}

.upload-header {
  margin-bottom: 32px;
}

.upload-header h1 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.upload-header p {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 16px;
}

.upload-card {
  margin-bottom: 24px;
}

.video-upload {
  margin-bottom: 24px;
}

.video-preview {
  margin-top: 24px;
  border-top: 1px solid var(--el-border-color);
  padding-top: 24px;
}

.preview-video {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.video-info-form {
  max-width: 800px;
}

.form-tip {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

@media (max-width: 768px) {
  .upload-header h1 {
    font-size: 24px;
  }
  
  .preview-video {
    max-height: 300px;
  }
}

.tag-input-container {
  margin-bottom: 10px;
}

.tag-input {
  margin-bottom: 10px;
  width: 200px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>