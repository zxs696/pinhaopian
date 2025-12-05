<template>
  <div class="video-player-container">
    <!-- 视频播放器 -->
    <div class="video-wrapper" ref="videoWrapper">
      <video
        ref="videoPlayer"
        :src="videoUrl"
        :poster="poster"
        :controls="showControls"
        :autoplay="autoplay"
        :loop="loop"
        :muted="muted"
        :preload="preload"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
        @error="onError"
        @play="onPlay"
        @pause="onPause"
        @waiting="onWaiting"
        @canplay="onCanPlay"
        class="video-element"
      ></video>
      
      <!-- 自定义控制栏 -->
      <div v-if="!showControls" class="custom-controls" :class="{ 'controls-hidden': !showCustomControls }">
        <!-- 播放/暂停按钮 -->
        <button class="control-btn play-btn" @click="togglePlay">
          <i v-if="!isPlaying" class="icon-play"></i>
          <i v-else class="icon-pause"></i>
        </button>
        
        <!-- 进度条 -->
        <div class="progress-container" ref="progressContainer" @click="seekTo">
          <div class="progress-bar">
            <div class="progress-filled" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="progress-buffered" :style="{ width: bufferedPercentage + '%' }"></div>
        </div>
        
        <!-- 时间显示 -->
        <div class="time-display">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>
        
        <!-- 音量控制 -->
        <div class="volume-container">
          <button class="control-btn volume-btn" @click="toggleMute">
            <i v-if="isMuted || volume === 0" class="icon-volume-mute"></i>
            <i v-else-if="volume < 0.5" class="icon-volume-low"></i>
            <i v-else class="icon-volume-high"></i>
          </button>
          <div class="volume-slider" v-show="showVolumeSlider">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              v-model="volume"
              @input="updateVolume"
            />
          </div>
        </div>
        
        <!-- 播放速度 -->
        <div class="speed-container">
          <button class="control-btn speed-btn" @click="toggleSpeedMenu">
            {{ playbackRate }}x
          </button>
          <div class="speed-menu" v-show="showSpeedMenu">
            <div
              v-for="speed in playbackSpeeds"
              :key="speed"
              class="speed-option"
              :class="{ active: playbackRate === speed }"
              @click="setPlaybackRate(speed)"
            >
              {{ speed }}x
            </div>
          </div>
        </div>
        
        <!-- 全屏按钮 -->
        <button class="control-btn fullscreen-btn" @click="toggleFullscreen">
          <i v-if="!isFullscreen" class="icon-fullscreen"></i>
          <i v-else class="icon-fullscreen-exit"></i>
        </button>
      </div>
      
      <!-- 加载中指示器 -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="hasError" class="error-message">
        <p>视频加载失败</p>
        <button class="retry-btn" @click="retryLoad">重试</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

// Props定义
const props = defineProps({
  videoUrl: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    default: ''
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: false
  },
  muted: {
    type: Boolean,
    default: false
  },
  showControls: {
    type: Boolean,
    default: true
  },
  preload: {
    type: String,
    default: 'metadata'
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: 'auto'
  }
})

// Emits定义
const emit = defineEmits([
  'loadedmetadata',
  'timeupdate',
  'ended',
  'error',
  'play',
  'pause',
  'waiting',
  'canplay'
])

// 响应式数据
const videoPlayer = ref(null)
const videoWrapper = ref(null)
const progressContainer = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const isFullscreen = ref(false)
const isLoading = ref(true)
const hasError = ref(false)
const showCustomControls = ref(true)
const showVolumeSlider = ref(false)
const showSpeedMenu = ref(false)
const playbackRate = ref(1)
const buffered = ref(0)

// 播放速度选项
const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

// 计算属性
const progressPercentage = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

const bufferedPercentage = computed(() => {
  return duration.value > 0 ? (buffered.value / duration.value) * 100 : 0
})

// 控制栏自动隐藏定时器
let controlsTimer = null

// 方法
const togglePlay = () => {
  if (!videoPlayer.value) return
  
  if (videoPlayer.value.paused) {
    videoPlayer.value.play()
  } else {
    videoPlayer.value.pause()
  }
}

const seekTo = (event) => {
  if (!videoPlayer.value || !progressContainer.value) return
  
  const rect = progressContainer.value.getBoundingClientRect()
  const pos = (event.clientX - rect.left) / rect.width
  videoPlayer.value.currentTime = pos * duration.value
}

const toggleMute = () => {
  if (!videoPlayer.value) return
  
  videoPlayer.value.muted = !videoPlayer.value.muted
  isMuted.value = videoPlayer.value.muted
}

const updateVolume = () => {
  if (!videoPlayer.value) return
  
  videoPlayer.value.volume = volume.value
  isMuted.value = videoPlayer.value.muted = volume.value === 0
}

const setPlaybackRate = (speed) => {
  if (!videoPlayer.value) return
  
  videoPlayer.value.playbackRate = speed
  playbackRate.value = speed
  showSpeedMenu.value = false
}

const toggleSpeedMenu = () => {
  showSpeedMenu.value = !showSpeedMenu.value
  showVolumeSlider.value = false
}

const toggleFullscreen = () => {
  if (!videoWrapper.value) return
  
  if (!isFullscreen.value) {
    if (videoWrapper.value.requestFullscreen) {
      videoWrapper.value.requestFullscreen()
    } else if (videoWrapper.value.webkitRequestFullscreen) {
      videoWrapper.value.webkitRequestFullscreen()
    } else if (videoWrapper.value.mozRequestFullScreen) {
      videoWrapper.value.mozRequestFullScreen()
    } else if (videoWrapper.value.msRequestFullscreen) {
      videoWrapper.value.msRequestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }
}

const formatTime = (seconds) => {
  if (isNaN(seconds) || !isFinite(seconds)) return '00:00'
  
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  } else {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
}

const showControlsTemporarily = () => {
  showCustomControls.value = true
  
  if (controlsTimer) {
    clearTimeout(controlsTimer)
  }
  
  if (isPlaying.value) {
    controlsTimer = setTimeout(() => {
      showCustomControls.value = false
    }, 3000)
  }
}

const hideControls = () => {
  if (isPlaying.value) {
    showCustomControls.value = false
  }
}

const retryLoad = () => {
  hasError.value = false
  isLoading.value = true
  if (videoPlayer.value) {
    videoPlayer.value.load()
  }
}

// 视频事件处理
const onLoadedMetadata = (event) => {
  duration.value = videoPlayer.value.duration
  volume.value = videoPlayer.value.volume
  isMuted.value = videoPlayer.value.muted
  isLoading.value = false
  emit('loadedmetadata', event)
}

const onTimeUpdate = (event) => {
  currentTime.value = videoPlayer.value.currentTime
  
  // 更新缓冲进度
  if (videoPlayer.value.buffered.length > 0) {
    buffered.value = videoPlayer.value.buffered.end(videoPlayer.value.buffered.length - 1)
  }
  
  emit('timeupdate', event)
}

const onEnded = (event) => {
  isPlaying.value = false
  emit('ended', event)
}

const onError = (event) => {
  isLoading.value = false
  hasError.value = true
  emit('error', event)
}

const onPlay = (event) => {
  isPlaying.value = true
  showControlsTemporarily()
  emit('play', event)
}

const onPause = (event) => {
  isPlaying.value = false
  showCustomControls.value = true
  emit('pause', event)
}

const onWaiting = (event) => {
  isLoading.value = true
  emit('waiting', event)
}

const onCanPlay = (event) => {
  isLoading.value = false
  emit('canplay', event)
}

// 全屏状态变化监听
const handleFullscreenChange = () => {
  isFullscreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  )
}

// 鼠标移动事件处理
const handleMouseMove = () => {
  if (!props.showControls) {
    showControlsTemporarily()
  }
}

// 键盘事件处理
const handleKeyDown = (event) => {
  if (!videoPlayer.value) return
  
  switch (event.key) {
    case ' ':
      event.preventDefault()
      togglePlay()
      break
    case 'ArrowLeft':
      videoPlayer.value.currentTime = Math.max(0, videoPlayer.value.currentTime - 5)
      break
    case 'ArrowRight':
      videoPlayer.value.currentTime = Math.min(duration.value, videoPlayer.value.currentTime + 5)
      break
    case 'ArrowUp':
      event.preventDefault()
      volume.value = Math.min(1, volume.value + 0.1)
      updateVolume()
      break
    case 'ArrowDown':
      event.preventDefault()
      volume.value = Math.max(0, volume.value - 0.1)
      updateVolume()
      break
    case 'f':
    case 'F':
      toggleFullscreen()
      break
    case 'm':
    case 'M':
      toggleMute()
      break
  }
}

// 生命周期钩子
onMounted(() => {
  // 添加全屏变化监听
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
  
  // 如果使用自定义控制栏，添加鼠标移动监听
  if (!props.showControls && videoWrapper.value) {
    videoWrapper.value.addEventListener('mousemove', handleMouseMove)
    videoWrapper.value.addEventListener('mouseleave', hideControls)
  }
})

onBeforeUnmount(() => {
  // 移除事件监听
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  document.removeEventListener('keydown', handleKeyDown)
  
  // 清除定时器
  if (controlsTimer) {
    clearTimeout(controlsTimer)
  }
})

// 监听props变化
watch(() => props.videoUrl, () => {
  // 重置状态
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  isLoading.value = true
  hasError.value = false
})
</script>

<style scoped>
.video-player-container {
  position: relative;
  width: v-bind(width);
  height: v-bind(height);
  background-color: #000;
  overflow: hidden;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 10px 15px;
  display: flex;
  align-items: center;
  color: #fff;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.controls-hidden {
  opacity: 0;
  pointer-events: none;
}

.control-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 5px;
  margin: 0 5px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.play-btn {
  font-size: 18px;
}

.progress-container {
  flex: 1;
  height: 5px;
  margin: 0 10px;
  position: relative;
  cursor: pointer;
}

.progress-bar {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  transform: translateY(-50%);
}

.progress-filled {
  height: 100%;
  background-color: #00a1d6;
  border-radius: 3px;
}

.progress-buffered {
  position: absolute;
  top: 50%;
  left: 0;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
  transform: translateY(-50%);
  z-index: -1;
}

.time-display {
  font-size: 12px;
  margin: 0 10px;
  min-width: 100px;
  text-align: center;
}

.volume-container {
  position: relative;
  display: flex;
  align-items: center;
}

.volume-slider {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 5px;
}

.volume-slider input {
  width: 100px;
  writing-mode: bt-lr; /* IE */
  -webkit-appearance: slider-vertical; /* WebKit */
  width: 30px;
  height: 100px;
  background: transparent;
  outline: none;
  /* 兼容性修复：为不支持-webkit-appearance的浏览器提供备用样式 */
  -moz-appearance: slider-vertical;
  appearance: slider-vertical;
}

.speed-container {
  position: relative;
}

.speed-btn {
  font-size: 12px;
  padding: 2px 5px;
}

.speed-menu {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 5px;
  overflow: hidden;
}

.speed-option {
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.speed-option:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.speed-option.active {
  background-color: #00a1d6;
}

.fullscreen-btn {
  font-size: 18px;
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 20;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  z-index: 20;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #00a1d6;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #0085b3;
}

/* 图标样式 - 使用CSS字符而非表情符号提高兼容性 */
.icon-play::before {
  content: "▶";
}

.icon-pause::before {
  content: "❚❚";
}

.icon-volume-mute::before {
  content: "×";
}

.icon-volume-low::before {
  content: "◧";
}

.icon-volume-high::before {
  content: "◩";
}

.icon-fullscreen::before {
  content: "⛶";
}

.icon-fullscreen-exit::before {
  content: "⛶";
}
</style>