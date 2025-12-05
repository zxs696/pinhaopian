import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })] 
    })
  ],
  define: {
    // 定义全局变量，解决 sockjs-client 在浏览器环境中的兼容性问题
    global: 'globalThis',
    'process.env': {}
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 添加Sass新API配置
        api: 'modern'
      }
    }
  },
  build: {
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 优化资源内联阈值
    assetsInlineLimit: 4096,
    // 启用源码映射
    sourcemap: false,
    // 手动分块配置，优化组件加载
    rollupOptions: {
      output: {
        manualChunks: {
          // 将Element Plus单独分块
          'element-plus': ['element-plus'],
          // 将Vue核心库单独分块
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 将管理后台组件分块
          'admin-pages': [
            './src/views/admin/Workbench.vue',
            './src/views/admin/VideoManagement.vue',
            './src/views/admin/VideoReview.vue',
            './src/views/admin/PendingVideos.vue',
            './src/views/admin/UserManagement.vue',
            './src/views/admin/RoleManagement.vue',
            './src/views/admin/PermissionManagement.vue',
            './src/views/admin/CategoryManagement.vue',
            './src/views/admin/CommentManagement.vue',
            './src/views/admin/DanmakuManagement.vue',
            './src/views/admin/SystemLog.vue',
            './src/views/admin/SystemBackup.vue',
            './src/views/admin/SecuritySettings.vue',
            './src/views/admin/SystemSettings.vue'
          ]
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true
      }
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus']
  }
})