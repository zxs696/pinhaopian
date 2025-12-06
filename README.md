# 拼好片 (PinHaoPian)

一个基于前后端分离架构的视频分享平台，提供视频上传、播放、评论、弹幕等功能，并包含完整的管理后台系统。

## 📋 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [多窗口登录状态管理](#多窗口登录状态管理)
- [API文档](#api文档)
- [部署指南](#部署指南)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)

## 🎯 项目简介

拼好片是一个现代化的视频分享平台，支持用户上传、观看、评论视频，并提供实时弹幕功能。系统采用前后端分离架构，前端使用Vue3构建响应式界面，后端使用Spring Boot提供RESTful API服务。

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3.5.22
- **构建工具**: Vite 5.0.0
- **UI库**: Element Plus 2.11.5
- **状态管理**: Pinia 3.0.3
- **路由**: Vue Router 4.6.3
- **HTTP客户端**: Axios 1.13.2
- **图表**: @antv/g2 5.4.6
- **WebSocket**: @stomp/stompjs 7.2.1, sockjs-client 1.6.1
- **样式**: Sass 1.94.2

### 后端
- **框架**: Spring Boot 2.7.6
- **数据库**: MySQL
- **ORM**: MyBatis Plus 3.5.3
- **缓存**: Redis
- **认证**: Apache Shiro 1.9.1 + JWT
- **WebSocket**: Spring WebSocket
- **文件上传**: Commons FileUpload
- **密码加密**: Spring Security Crypto

## ✨ 功能特性

### 用户功能
- 用户注册/登录
- 视频上传/观看
- 视频评论/弹幕
- 个人中心管理
- 关注/粉丝系统
- 动态发布/浏览

### 管理功能
- 工作台概览
- 用户管理
- 视频管理
- 分类/标签管理
- 评论/弹幕管理
- 角色权限管理
- 系统设置
- 数据统计/分析
- 系统日志/备份

### 系统特性
- JWT无状态认证
- 多设备登录检测
- 多窗口登录状态同步
- 会话失效处理机制
- 实时弹幕系统
- 响应式设计
- 路由权限控制
- 文件上传管理

## 📁 项目结构

```
pinhaopian/
├── backend/                    # 后端项目
│   ├── docs/                   # 后端文档
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/it/    # Java源码
│   │   │   └── resources/
│   │   │       ├── db/         # 数据库脚本
│   │   │       ├── mapper/     # MyBatis映射文件
│   │   │       └── static/     # 静态资源
│   │   └── test/               # 测试代码
│   ├── pom.xml                 # Maven配置
│   └── redis.conf              # Redis配置
├── frontend/                   # 前端项目
│   ├── public/                 # 公共资源
│   ├── src/
│   │   ├── api/                # API接口
│   │   ├── assets/             # 静态资源
│   │   ├── components/         # 公共组件
│   │   ├── layouts/            # 布局组件
│   │   ├── router/             # 路由配置
│   │   ├── services/           # 服务层
│   │   ├── stores/             # 状态管理
│   │   ├── utils/              # 工具函数
│   │   └── views/              # 页面视图
│   │       ├── admin/          # 管理后台页面
│   │       ├── auth/           # 认证相关页面
│   │       ├── error/          # 错误页面
│   │       └── index/          # 前台页面
│   ├── index.html              # HTML模板
│   ├── package.json            # NPM配置
│   └── vite.config.js          # Vite配置
└── README.md                   # 项目说明
```

## 🚀 环境要求

- **Java**: JDK 1.8+
- **Node.js**: 16.0+
- **MySQL**: 5.7+
- **Redis**: 6.0+
- **Maven**: 3.6+

## 🏃‍♂️ 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd pinhaopian
```

### 2. 后端启动
```bash
cd backend

# 配置数据库连接（可选，默认连接本地MySQL）
# 编辑 src/main/resources/application.properties

# 启动后端服务
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 3. 前端启动
```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 http://localhost:3000 启动（如果端口被占用会自动使用下一个可用端口）

### 4. 访问应用
- 前台页面: http://localhost:3000
- 管理后台: http://localhost:3000/admin

## ⚙️ 配置说明

### 后端配置

主要配置文件：`backend/src/main/resources/application.properties`

```properties
# 服务器端口
server.port=8080

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/pinhaopian?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=GMT%2B8
spring.datasource.username=root
spring.datasource.password=root

# Redis配置
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.password=000000

# JWT配置
jwt.secret=pinhaopian_secret_key_2024
jwt.expiration=86400000

# 文件上传配置
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
pinhaopian.file.upload-dir=uploads
```

### 前端配置

主要配置文件：`frontend/vite.config.js`

```javascript
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

## � 多窗口登录状态管理

### 功能概述

系统实现了完善的多窗口登录状态管理机制，确保用户在多个浏览器窗口或标签页中的登录状态能够实时同步，并正确处理会话失效情况。

### 核心特性

- **状态同步**: 用户在任一窗口登录/登出，所有窗口状态同步更新
- **会话失效处理**: 当会话失效时，所有窗口显示失效通知并提供重新登录选项
- **重复处理防护**: 防止同一会话失效事件被多次处理
- **跨窗口通信**: 使用浏览器存储API实现窗口间通信
- **WebSocket集成**: 通过WebSocket实时同步会话状态

### 技术实现

- **服务层**: `SessionService` 负责会话管理和跨窗口通信
- **状态管理**: `authStore` 使用Pinia管理认证状态
- **WebSocket**: `WebSocketService` 处理实时消息推送
- **跨窗口通信**: `CrossWindowService` 实现窗口间状态同步

## �� API文档

### 认证接口
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/logout` - 用户登出

### 视频接口
- `GET /videos` - 获取视频列表
- `GET /videos/{id}` - 获取视频详情
- `POST /videos/upload` - 上传视频
- `POST /videos/{id}/play` - 播放视频

### 用户接口
- `GET /users/profile` - 获取用户信息
- `PUT /users/profile` - 更新用户信息
- `GET /users/{id}/videos` - 获取用户视频列表

### 评论接口
- `GET /comments/video/{videoId}` - 获取视频评论
- `POST /comments` - 添加评论
- `DELETE /comments/{id}` - 删除评论

### 弹幕接口
- `GET /danmu/video/{videoId}` - 获取视频弹幕
- `POST /danmu` - 发送弹幕

## 🚀 部署指南

### 后端部署

1. 打包应用
```bash
cd backend
mvn clean package
```

2. 运行JAR文件
```bash
java -jar target/pinhaopian-0.0.1-SNAPSHOT.jar
```

### 前端部署

1. 构建生产版本
```bash
cd frontend
npm run build
```

2. 部署dist目录到Web服务器（如Nginx）

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # 前端静态资源
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 文件上传
    location /uploads {
        alias /path/to/uploads;
    }
}
```

## ❓ 常见问题

### 1. 数据库连接失败
- 检查MySQL服务是否启动
- 确认数据库连接配置是否正确
- 确认数据库用户权限

### 2. Redis连接失败
- 检查Redis服务是否启动
- 确认Redis连接配置是否正确

### 3. 文件上传失败
- 检查上传目录是否存在且有写权限
- 确认文件大小是否超过限制

### 4. 前端页面空白
- 检查后端API是否正常响应
- 查看浏览器控制台错误信息
- 确认API代理配置是否正确

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 作者

- **开发者** - [祥操导师|kellen|阿祥]

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Spring Boot](https://spring.io/projects/spring-boot) - Java应用框架
- [Element Plus](https://element-plus.org/) - Vue3组件库
- [MyBatis Plus](https://baomidou.com/) - MyBatis增强工具