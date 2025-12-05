import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 从localStorage获取保存的设置
  const getSavedSettings = () => {
    try {
      const savedSettings = localStorage.getItem('appSettings')
      return savedSettings ? JSON.parse(savedSettings) : {}
    } catch (error) {
      console.error('获取保存的设置失败:', error)
      return {}
    }
  }

  // 保存设置到localStorage
  const saveSettingsToStorage = (settings) => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings))
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  }

  // 应用设置
  const settings = ref(getSavedSettings())

  // 初始化设置
  const initializeSettings = () => {
    // 如果没有保存的设置，则初始化默认设置
    if (!localStorage.getItem('appSettings')) {
      settings.value = {
        language: 'zh-CN',
        autoSave: true,
        theme: 'light'
      }
      saveSettingsToStorage(settings.value)
    }
  }

  // 更新设置
  const updateSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings }
    saveSettingsToStorage(settings.value)
  }

  // 重置设置
  const resetSettings = () => {
    settings.value = {
      language: 'zh-CN',
      autoSave: true,
      theme: 'light'
    }
    saveSettingsToStorage(settings.value)
  }

  return {
    settings,
    initializeSettings,
    updateSettings,
    resetSettings
  }
})