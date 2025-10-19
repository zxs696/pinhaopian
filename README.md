# 拼好片（PinHaoPian）

前后端分离视频站示例：
- 前端：Vite + Vue3 + Naive UI + Pinia + Axios + Vue Router
- 后端：Spring Boot + Shiro + JWT + MyBatis-Plus + MySQL + Redis

## 运行
- 后端：
```
cd backend
mvn spring-boot:run
```
- 前端：
```
cd frontend
npm i
npm run dev
```

## 配置
- 在 `backend/src/main/resources/application.properties` 调整数据库、Redis、JWT、存储目录。
- 首次启动自动执行 `pinhaopian.sql` 建表。
- 静态资源：`/static/**` 映射到 `uploads/`。

## API 摘要
- 认证：`POST /auth/register`，`POST /auth/login`
- 视频：`GET /videos`，`GET /videos/{id}`，`POST /videos/{id}/play`，`POST /videos/upload`

## 说明
- 登录成功后前端保存 token，Axios 自动附带 `Authorization: Bearer <token>`。
- `/upload` 路由需登录，未登录跳转到 `/login`。
