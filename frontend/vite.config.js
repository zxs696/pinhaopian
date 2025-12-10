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
        api: 'modern',
        // 全局注入响应式系统，每个Vue组件都能直接使用mixins
        additionalData: `
          @use "@/assets/styles/main" as *;
        `
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
    port: 8888,
    strictPort: true, // 严格使用指定端口，如果被占用则不尝试递增
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 只记录客户端信息
            const userAgent = req.headers['user-agent'] || '未知客户端';
            // 简化客户端名称提取
            let clientName = '未知客户端';
            if (userAgent.includes('Chrome')) {
              clientName = 'Chrome';
            } else if (userAgent.includes('Firefox')) {
              clientName = 'Firefox';
            } else if (userAgent.includes('Safari')) {
              clientName = 'Safari';
            } else if (userAgent.includes('Edge')) {
              clientName = 'Edge';
            } else if (userAgent.includes('Opera')) {
              clientName = 'Opera';
            } else if (userAgent.includes('Postman')) {
              clientName = 'Postman';
            } else if (userAgent.includes('curl')) {
              clientName = 'curl';
            }
            
            // 存储客户端名称到请求对象，便于响应日志使用
            req.clientName = clientName;
            console.log(`[API请求] ${req.method} ${req.url} - 客户端: ${clientName}`);
          });
          
          // 记录响应状态码
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[API响应] ${req.method} ${req.url} - 客户端: ${req.clientName || '未知客户端'} - 状态码: ${proxyRes.statusCode}`);
          });
        }
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
        configure: (proxy, options) => {
          console.log(`[WebSocket] 连接到 ${options.target}`);
        }
      }
    },
    // 添加自定义中间件显示API路径状态
    configureServer(server) {
      console.log('\n🚀 服务器配置信息:');
      console.log(`   - 本地地址: http://localhost:${server.config.server.port}`);
      console.log(`   - API代理: http://localhost:8080`);
      console.log(`   - WebSocket: ws://localhost:8080/ws`);
      console.log('   - API请求客户端日志已启用\n');
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus']
  }
})