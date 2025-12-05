/*
 Navicat Premium Data Transfer

 Source Server         : mysql_ybb
 Source Server Type    : MySQL
 Source Server Version : 80041 (8.0.41)
 Source Host           : localhost:3306
 Source Schema         : pinhaopian

 Target Server Type    : MySQL
 Target Server Version : 80041 (8.0.41)
 File Encoding         : 65001

 Date: 05/12/2025 11:18:39
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs`  (
  `log_id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` bigint NULL DEFAULT NULL COMMENT '操作用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作用户名',
  `operation` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型',
  `method` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '请求方法',
  `params` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '请求参数',
  `result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '操作结果',
  `ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作IP',
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户代理',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '操作状态：0-失败，1-成功',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '错误信息',
  `execution_time` bigint NULL DEFAULT NULL COMMENT '执行时间(毫秒)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`log_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_operation`(`operation` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '操作日志表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of audit_logs
-- ----------------------------

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `category_id` int NOT NULL AUTO_INCREMENT COMMENT '分类唯一标识符',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '分类描述',
  `parent_id` int NULL DEFAULT NULL COMMENT '父分类ID，支持分类层级',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序权重，数值越大越靠前',
  `status` tinyint NULL DEFAULT 1 COMMENT '分类状态：0停用，1启用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`category_id`) USING BTREE,
  INDEX `parent_id`(`parent_id` ASC) USING BTREE,
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of categories
-- ----------------------------

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `comment_id` bigint NOT NULL AUTO_INCREMENT COMMENT '评论唯一标识符',
  `video_id` bigint NOT NULL COMMENT '关联的视频ID',
  `user_id` bigint NOT NULL COMMENT '评论用户ID',
  `parent_id` bigint NULL DEFAULT NULL COMMENT '父评论ID，NULL表示一级评论',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论内容',
  `like_count` int NULL DEFAULT 0 COMMENT '点赞数',
  `dislike_count` int NULL DEFAULT 0 COMMENT '点踩数',
  `status` tinyint NULL DEFAULT 1 COMMENT '评论状态：0删除，1正常',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`comment_id`) USING BTREE,
  INDEX `video_id`(`video_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `parent_id`(`parent_id` ASC) USING BTREE,
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`video_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`comment_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of comments
-- ----------------------------

-- ----------------------------
-- Table structure for danmaku
-- ----------------------------
DROP TABLE IF EXISTS `danmaku`;
CREATE TABLE `danmaku`  (
  `danmaku_id` bigint NOT NULL AUTO_INCREMENT COMMENT '弹幕唯一标识符',
  `video_id` bigint NOT NULL COMMENT '关联视频ID',
  `user_id` bigint NOT NULL COMMENT '发送用户ID',
  `content` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '弹幕内容',
  `time_point` int NOT NULL COMMENT '弹幕在视频中的时间点(秒)',
  `color` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '#FFFFFF' COMMENT '弹幕颜色，默认白色',
  `type` tinyint NULL DEFAULT 0 COMMENT '弹幕类型：0滚动，1顶部，2底部',
  `font_size` tinyint NULL DEFAULT 16 COMMENT '字体大小',
  `status` tinyint NULL DEFAULT 1 COMMENT '弹幕状态：0屏蔽，1正常',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  PRIMARY KEY (`danmaku_id`) USING BTREE,
  INDEX `video_id`(`video_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `danmaku_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`video_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `danmaku_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of danmaku
-- ----------------------------

-- ----------------------------
-- Table structure for favorite_videos
-- ----------------------------
DROP TABLE IF EXISTS `favorite_videos`;
CREATE TABLE `favorite_videos`  (
  `favorite_id` bigint NOT NULL COMMENT '收藏夹ID',
  `video_id` bigint NOT NULL COMMENT '视频ID',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
  PRIMARY KEY (`favorite_id`, `video_id`) USING BTREE,
  INDEX `video_id`(`video_id` ASC) USING BTREE,
  CONSTRAINT `favorite_videos_ibfk_1` FOREIGN KEY (`favorite_id`) REFERENCES `favorites` (`favorite_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `favorite_videos_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos` (`video_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of favorite_videos
-- ----------------------------

-- ----------------------------
-- Table structure for favorites
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites`  (
  `favorite_id` bigint NOT NULL AUTO_INCREMENT COMMENT '收藏夹唯一标识符',
  `user_id` bigint NOT NULL COMMENT '所属用户ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '收藏夹名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '收藏夹描述',
  `is_public` tinyint NULL DEFAULT 1 COMMENT '是否公开：0私有，1公开',
  `video_count` int NULL DEFAULT 0 COMMENT '包含视频数量统计',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`favorite_id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of favorites
-- ----------------------------

-- ----------------------------
-- Table structure for follows
-- ----------------------------
DROP TABLE IF EXISTS `follows`;
CREATE TABLE `follows`  (
  `follow_id` bigint NOT NULL AUTO_INCREMENT COMMENT '关注关系ID',
  `follower_id` bigint NOT NULL COMMENT '关注者用户ID',
  `following_id` bigint NOT NULL COMMENT '被关注者用户ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',
  PRIMARY KEY (`follow_id`) USING BTREE,
  UNIQUE INDEX `unique_follow`(`follower_id` ASC, `following_id` ASC) USING BTREE,
  INDEX `following_id`(`following_id` ASC) USING BTREE,
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of follows
-- ----------------------------

-- ----------------------------
-- Table structure for likes
-- ----------------------------
DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes`  (
  `like_id` bigint NOT NULL AUTO_INCREMENT COMMENT '点赞记录ID',
  `user_id` bigint NOT NULL COMMENT '点赞用户ID',
  `target_type` enum('video','comment') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '点赞目标类型：视频或评论',
  `target_id` bigint NOT NULL COMMENT '目标对象ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`like_id`) USING BTREE,
  UNIQUE INDEX `unique_like`(`user_id` ASC, `target_type` ASC, `target_id` ASC) USING BTREE,
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of likes
-- ----------------------------

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `permission_id` bigint NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `permission_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权限编码',
  `permission_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权限名称',
  `resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资源类型：menu-菜单，button-按钮，api-接口',
  `resource_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '资源URL/路径',
  `resource_method` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '请求方法：GET,POST,PUT,DELETE等',
  `parent_id` bigint NULL DEFAULT 0 COMMENT '父权限ID',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '权限描述',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序顺序',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`permission_id`) USING BTREE,
  UNIQUE INDEX `uk_permission_code`(`permission_code` ASC) USING BTREE,
  INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 67 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '权限表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of permissions
-- ----------------------------
INSERT INTO `permissions` VALUES (1, 'HOME:VIEW', '首页', 'menu', '/admin', 'GET', 0, '系统首页', 1, 1, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 15:18:46');
INSERT INTO `permissions` VALUES (2, 'HOME:WORKBENCH:VIEW', '工作台', 'menu', '/admin/workbench', 'GET', 1, '首页-工作台', 1, 2, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 15:18:51');
INSERT INTO `permissions` VALUES (3, 'DASHBOARD:ANALYSIS:VIEW', '控制台', 'menu', '/admin/dashboard', 'GET', 0, '控制台', 1, 3, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 15:20:20');
INSERT INTO `permissions` VALUES (4, 'DASHBOARD:ANALYSIS:ANALYSIS', '分析页', 'menu', '/admin/dashboard/analysis', 'GET', 3, '控制台-分析页', 1, 4, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 15:21:19');
INSERT INTO `permissions` VALUES (5, 'DASHBOARD:ANALYSIS:STATISTICS', '统计页', 'menu', '/admin/dashboard/statistics', 'GET', 3, '控制台-统计页', 1, 5, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 15:21:22');
INSERT INTO `permissions` VALUES (6, 'VIDEO:MANAGEMENT:VIEW', '视频管理', 'menu', '/admin/video', 'GET', 0, '视频管理', 1, 11, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (7, 'VIDEO:LIST:VIEW', '视频列表', 'menu', '/admin/video/list', 'GET', 6, '视频管理-视频列表', 1, 12, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (8, 'VIDEO:REVIEW:VIEW', '视频审核', 'menu', '/admin/video/review', 'GET', 6, '视频管理-视频审核', 1, 13, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (9, 'VIDEO:CATEGORY:VIEW', '视频分类', 'menu', '/admin/video/category', 'GET', 6, '视频管理-视频分类', 1, 14, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (10, 'VIDEO:TAG:VIEW', '视频标签', 'menu', '/admin/video/tag', 'GET', 6, '视频管理-视频标签', 1, 15, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (11, 'USER:MANAGEMENT:VIEW', '用户管理', 'menu', '/admin/user', 'GET', 0, '用户管理', 1, 21, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (12, 'USER:LIST:VIEW', '用户列表', 'menu', '/admin/user/list', 'GET', 11, '用户管理-用户列表', 1, 22, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (13, 'USER:ROLE:VIEW', '角色管理', 'menu', '/admin/user/role', 'GET', 11, '用户管理-角色管理', 1, 23, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (14, 'USER:PERMISSION:VIEW', '权限管理', 'menu', '/admin/user/permission', 'GET', 11, '用户管理-权限管理', 1, 24, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (15, 'CONTENT:MANAGEMENT:VIEW', '内容管理', 'menu', '/admin/content', 'GET', 0, '内容管理', 1, 31, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (16, 'CONTENT:COMMENT:VIEW', '评论管理', 'menu', '/admin/comment/list', 'GET', 15, '内容管理-评论管理', 1, 32, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (17, 'CONTENT:DANMAKU:VIEW', '弹幕管理', 'menu', '/admin/danmu/list', 'GET', 15, '内容管理-弹幕管理', 1, 33, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (18, 'SYSTEM:MANAGEMENT:VIEW', '系统设置', 'menu', '/admin/system', 'GET', 0, '系统设置', 1, 41, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (19, 'SYSTEM:CONFIG:VIEW', '系统配置', 'menu', '/admin/system/config', 'GET', 18, '系统设置-系统配置', 1, 42, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (20, 'SYSTEM:LOG:VIEW', '日志管理', 'menu', '/admin/system/log', 'GET', 18, '系统设置-日志管理', 1, 43, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (21, 'SYSTEM:BACKUP:VIEW', '数据备份', 'menu', '/admin/system/backup', 'GET', 18, '系统设置-数据备份', 1, 44, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (22, 'VIDEO:ADD:BUTTON', '添加视频', 'button', '', '', 0, '添加视频按钮', 1, 101, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (23, 'VIDEO:EDIT:BUTTON', '编辑视频', 'button', '', '', 0, '编辑视频按钮', 1, 102, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (24, 'VIDEO:DELETE:BUTTON', '删除视频', 'button', '', '', 0, '删除视频按钮', 1, 103, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (25, 'VIDEO:APPROVE:BUTTON', '审核通过', 'button', '', '', 0, '审核通过按钮', 1, 104, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (26, 'VIDEO:REJECT:BUTTON', '审核拒绝', 'button', '', '', 0, '审核拒绝按钮', 1, 105, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (27, 'USER:ADD:BUTTON', '添加用户', 'button', '', '', 0, '添加用户按钮', 1, 106, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (28, 'USER:EDIT:BUTTON', '编辑用户', 'button', '', '', 0, '编辑用户按钮', 1, 107, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (29, 'USER:DELETE:BUTTON', '删除用户', 'button', '', '', 0, '删除用户按钮', 1, 108, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (30, 'USER:BAN:BUTTON', '封禁用户', 'button', '', '', 0, '封禁用户按钮', 1, 109, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (31, 'USER:UNBAN:BUTTON', '解封用户', 'button', '', '', 0, '解封用户按钮', 1, 110, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (32, 'ROLE:ADD:BUTTON', '添加角色', 'button', '', '', 0, '添加角色按钮', 1, 111, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (33, 'ROLE:EDIT:BUTTON', '编辑角色', 'button', '', '', 0, '编辑角色按钮', 1, 112, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (34, 'ROLE:DELETE:BUTTON', '删除角色', 'button', '', '', 0, '删除角色按钮', 1, 113, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (35, 'PERMISSION:ADD:BUTTON', '添加权限', 'button', '', '', 0, '添加权限按钮', 1, 114, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (36, 'PERMISSION:EDIT:BUTTON', '编辑权限', 'button', '', '', 0, '编辑权限按钮', 1, 115, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (37, 'PERMISSION:DELETE:BUTTON', '删除权限', 'button', '', '', 0, '删除权限按钮', 1, 116, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (38, 'COMMENT:DELETE:BUTTON', '删除评论', 'button', '', '', 0, '删除评论按钮', 1, 117, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (39, 'COMMENT:REVIEW:BUTTON', '审核评论', 'button', '', '', 0, '审核评论按钮', 1, 118, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (40, 'SYSTEM:BACKUP:BUTTON', '数据备份', 'button', '', '', 0, '数据备份按钮', 1, 119, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (41, 'SYSTEM:RESTORE:BUTTON', '数据恢复', 'button', '', '', 0, '数据恢复按钮', 1, 120, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (42, 'API:VIDEO:LIST', '视频列表API', 'api', '/api/videos', 'GET', 0, '获取视频列表API', 1, 201, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (43, 'API:VIDEO:DETAIL', '视频详情API', 'api', '/api/videos/{id}', 'GET', 0, '获取视频详情API', 1, 202, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (44, 'API:VIDEO:CREATE', '创建视频API', 'api', '/api/videos', 'POST', 0, '创建视频API', 1, 203, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (45, 'API:VIDEO:UPDATE', '更新视频API', 'api', '/api/videos/{id}', 'PUT', 0, '更新视频API', 1, 204, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (46, 'API:VIDEO:DELETE', '删除视频API', 'api', '/api/videos/{id}', 'DELETE', 0, '删除视频API', 1, 205, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (47, 'API:USER:LIST', '用户列表API', 'api', '/api/users', 'GET', 0, '获取用户列表API', 1, 206, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (48, 'API:USER:DETAIL', '用户详情API', 'api', '/api/users/{id}', 'GET', 0, '获取用户详情API', 1, 207, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (49, 'API:USER:CREATE', '创建用户API', 'api', '/api/users', 'POST', 0, '创建用户API', 1, 208, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (50, 'API:USER:UPDATE', '更新用户API', 'api', '/api/users/{id}', 'PUT', 0, '更新用户API', 1, 209, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (51, 'API:USER:DELETE', '删除用户API', 'api', '/api/users/{id}', 'DELETE', 0, '删除用户API', 1, 210, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (52, 'API:ROLE:LIST', '角色列表API', 'api', '/api/roles', 'GET', 0, '获取角色列表API', 1, 211, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (53, 'API:ROLE:DETAIL', '角色详情API', 'api', '/api/roles/{id}', 'GET', 0, '获取角色详情API', 1, 212, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (54, 'API:ROLE:CREATE', '创建角色API', 'api', '/api/roles', 'POST', 0, '创建角色API', 1, 213, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (55, 'API:ROLE:UPDATE', '更新角色API', 'api', '/api/roles/{id}', 'PUT', 0, '更新角色API', 1, 214, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (56, 'API:ROLE:DELETE', '删除角色API', 'api', '/api/roles/{id}', 'DELETE', 0, '删除角色API', 1, 215, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (57, 'API:PERMISSION:LIST', '权限列表API', 'api', '/api/permissions', 'GET', 0, '获取权限列表API', 1, 216, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (58, 'API:PERMISSION:DETAIL', '权限详情API', 'api', '/api/permissions/{id}', 'GET', 0, '获取权限详情API', 1, 217, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (59, 'API:PERMISSION:CREATE', '创建权限API', 'api', '/api/permissions', 'POST', 0, '创建权限API', 1, 218, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (60, 'API:PERMISSION:UPDATE', '更新权限API', 'api', '/api/permissions/{id}', 'PUT', 0, '更新权限API', 1, 219, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (61, 'API:PERMISSION:DELETE', '删除权限API', 'api', '/api/permissions/{id}', 'DELETE', 0, '删除权限API', 1, 220, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (62, 'API:COMMENT:LIST', '评论列表API', 'api', '/api/comments', 'GET', 0, '获取评论列表API', 1, 221, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (63, 'API:COMMENT:DETAIL', '评论详情API', 'api', '/api/comments/{id}', 'GET', 0, '获取评论详情API', 1, 222, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (64, 'API:COMMENT:DELETE', '删除评论API', 'api', '/api/comments/{id}', 'DELETE', 0, '删除评论API', 1, 223, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (65, 'API:SYSTEM:BACKUP', '系统备份API', 'api', '/api/system/backup', 'POST', 0, '系统备份API', 1, 224, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');
INSERT INTO `permissions` VALUES (66, 'API:SYSTEM:RESTORE', '系统恢复API', 'api', '/api/system/restore', 'POST', 0, '系统恢复API', 1, 225, 1, '2025-12-01 14:23:03', NULL, '2025-12-01 14:23:03');

-- ----------------------------
-- Table structure for play_history
-- ----------------------------
DROP TABLE IF EXISTS `play_history`;
CREATE TABLE `play_history`  (
  `history_id` bigint NOT NULL AUTO_INCREMENT COMMENT '历史记录ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `video_id` bigint NOT NULL COMMENT '视频ID',
  `play_duration` int NULL DEFAULT 0 COMMENT '实际观看时长(秒)',
  `total_duration` int NULL DEFAULT 0 COMMENT '视频总时长(秒)',
  `last_play_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最后观看时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  PRIMARY KEY (`history_id`) USING BTREE,
  UNIQUE INDEX `unique_user_video`(`user_id` ASC, `video_id` ASC) USING BTREE,
  INDEX `video_id`(`video_id` ASC) USING BTREE,
  CONSTRAINT `play_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `play_history_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos` (`video_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of play_history
-- ----------------------------

-- ----------------------------
-- Table structure for role_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `permission_id` bigint NOT NULL COMMENT '权限ID',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_role_permission`(`role_id` ASC, `permission_id` ASC) USING BTREE,
  INDEX `fk_role_permissions_role_id`(`role_id` ASC) USING BTREE,
  INDEX `fk_role_permissions_permission_id`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `fk_role_permissions_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_role_permissions_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 161 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '角色权限关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of role_permissions
-- ----------------------------
INSERT INTO `role_permissions` VALUES (1, 1, 1, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (2, 1, 6, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (3, 1, 11, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (4, 1, 15, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (5, 1, 18, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (6, 1, 22, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (7, 1, 23, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (8, 1, 24, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (9, 1, 25, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (10, 1, 26, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (11, 1, 27, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (12, 1, 28, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (13, 1, 29, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (14, 1, 30, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (15, 1, 31, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (16, 1, 32, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (17, 1, 33, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (18, 1, 34, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (19, 1, 35, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (20, 1, 36, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (21, 1, 37, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (22, 1, 38, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (23, 1, 39, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (24, 1, 40, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (25, 1, 41, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (26, 1, 42, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (27, 1, 43, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (28, 1, 44, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (29, 1, 45, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (30, 1, 46, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (31, 1, 47, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (32, 1, 48, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (33, 1, 49, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (34, 1, 50, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (35, 1, 51, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (36, 1, 52, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (37, 1, 53, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (38, 1, 54, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (39, 1, 55, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (40, 1, 56, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (41, 1, 57, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (42, 1, 58, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (43, 1, 59, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (44, 1, 60, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (45, 1, 61, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (46, 1, 62, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (47, 1, 63, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (48, 1, 64, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (49, 1, 65, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (50, 1, 66, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (51, 1, 2, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (52, 1, 3, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (53, 1, 4, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (54, 1, 5, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (55, 1, 7, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (56, 1, 8, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (57, 1, 9, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (58, 1, 10, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (59, 1, 12, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (60, 1, 13, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (61, 1, 14, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (62, 1, 16, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (63, 1, 17, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (64, 1, 19, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (65, 1, 20, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (66, 1, 21, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (128, 2, 16, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (129, 2, 17, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (130, 2, 15, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (131, 2, 4, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (132, 2, 5, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (133, 2, 3, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (134, 2, 1, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (135, 2, 2, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (136, 2, 22, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (137, 2, 25, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (138, 2, 9, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (139, 2, 24, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (140, 2, 23, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (141, 2, 7, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (142, 2, 6, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (143, 2, 26, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (144, 2, 8, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (145, 2, 10, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (159, 3, 1, NULL, '2025-12-01 14:23:03');
INSERT INTO `role_permissions` VALUES (160, 3, 2, NULL, '2025-12-01 14:23:03');

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `role_id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色编码',
  `role_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '角色描述',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序顺序',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint NULL DEFAULT NULL COMMENT '更新人ID',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`role_id`) USING BTREE,
  UNIQUE INDEX `uk_role_code`(`role_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '角色表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'ADMIN', '管理员', '系统管理员，拥有所有权限', 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `roles` VALUES (2, 'REVIEWER', '审核员', '内容审核员，负责审核视频内容', 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `roles` VALUES (3, 'USER', '普通用户', '普通用户，拥有基本操作权限', 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');

-- ----------------------------
-- Table structure for tags
-- ----------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags`  (
  `tag_id` bigint NOT NULL AUTO_INCREMENT COMMENT '标签唯一标识符',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签名称，唯一约束',
  `usage_count` int NULL DEFAULT 0 COMMENT '标签使用次数统计',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`tag_id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tags
-- ----------------------------

-- ----------------------------
-- Table structure for user_profiles
-- ----------------------------
DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles`  (
  `profile_id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户资料ID，主键自增',
  `user_id` bigint NOT NULL COMMENT '关联的用户ID，唯一约束',
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '个人简介',
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所在地',
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '个人网站',
  `privacy_settings` json NULL COMMENT '隐私设置，使用JSON格式存储灵活性配置',
  PRIMARY KEY (`profile_id`) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_profiles
-- ----------------------------

-- ----------------------------
-- Table structure for user_roles
-- ----------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `created_by` bigint NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_role`(`user_id` ASC, `role_id` ASC) USING BTREE,
  INDEX `fk_user_roles_user_id`(`user_id` ASC) USING BTREE,
  INDEX `fk_user_roles_role_id`(`role_id` ASC) USING BTREE,
  CONSTRAINT `fk_user_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_user_roles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户角色关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_roles
-- ----------------------------
INSERT INTO `user_roles` VALUES (1, 1, 1, NULL, '2025-11-27 16:54:24');
INSERT INTO `user_roles` VALUES (2, 2, 2, NULL, '2025-11-27 16:54:24');
INSERT INTO `user_roles` VALUES (3, 3, 3, NULL, '2025-11-27 16:54:24');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `user_id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户唯一标识符，主键自增',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名，唯一且必填',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱地址，唯一且必填',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希值，安全存储密码',
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '昵称，用于显示',
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像URL地址',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号码',
  `gender` tinyint NULL DEFAULT 0 COMMENT '性别：0未知，1男性，2女性',
  `birthday` date NULL DEFAULT NULL COMMENT '生日日期',
  `status` tinyint NULL DEFAULT 1 COMMENT '账户状态：0禁用，1正常',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`user_id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', 'admin@example.com', '$2a$10$7fRqva/UbeVMyoEFIupzcum1MO4.v0tkLi.zNhId31A7KK.OTvsVW', '管理员', NULL, NULL, 0, NULL, 1, '2025-10-20 11:31:58', '2025-11-27 16:55:33');
INSERT INTO `users` VALUES (2, 'review', 'review@example.com', '$2a$10$7fRqva/UbeVMyoEFIupzcum1MO4.v0tkLi.zNhId31A7KK.OTvsVW', '审核员', NULL, NULL, 0, NULL, 1, '2025-10-22 12:20:18', '2025-11-27 16:55:44');
INSERT INTO `users` VALUES (3, 'user', 'user@example.com', '$2a$10$7fRqva/UbeVMyoEFIupzcum1MO4.v0tkLi.zNhId31A7KK.OTvsVW', '用户', NULL, NULL, 0, NULL, 1, '2025-10-22 12:20:18', '2025-11-27 16:55:53');

-- ----------------------------
-- Table structure for video_files
-- ----------------------------
DROP TABLE IF EXISTS `video_files`;
CREATE TABLE `video_files`  (
  `file_id` bigint NOT NULL AUTO_INCREMENT COMMENT '文件记录ID',
  `video_id` bigint NOT NULL COMMENT '关联的视频ID',
  `quality` enum('360p','480p','720p','1080p','4K') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '视频清晰度等级',
  `file_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '视频文件URL地址',
  `file_size` bigint NULL DEFAULT NULL COMMENT '文件大小(字节)',
  `format` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '文件格式(mp4, avi等)',
  `duration` decimal(10, 2) NULL DEFAULT NULL COMMENT '文件时长(秒)，支持小数，冗余存储便于查询',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`file_id`) USING BTREE,
  INDEX `video_id`(`video_id` ASC) USING BTREE,
  CONSTRAINT `video_files_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`video_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of video_files
-- ----------------------------

-- ----------------------------
-- Table structure for video_tags
-- ----------------------------
DROP TABLE IF EXISTS `video_tags`;
CREATE TABLE `video_tags`  (
  `video_id` bigint NOT NULL COMMENT '视频ID',
  `tag_id` bigint NOT NULL COMMENT '标签ID',
  PRIMARY KEY (`video_id`, `tag_id`) USING BTREE,
  INDEX `tag_id`(`tag_id` ASC) USING BTREE,
  CONSTRAINT `video_tags_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`video_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `video_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of video_tags
-- ----------------------------

-- ----------------------------
-- Table structure for videos
-- ----------------------------
DROP TABLE IF EXISTS `videos`;
CREATE TABLE `videos`  (
  `video_id` bigint NOT NULL AUTO_INCREMENT COMMENT '视频唯一标识符',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '视频标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '视频描述',
  `cover_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '封面图片URL',
  `duration` decimal(10, 2) NOT NULL COMMENT '视频时长(秒)，支持小数',
  `category_id` int NULL DEFAULT NULL COMMENT '所属分类ID',
  `author_id` bigint NOT NULL COMMENT '视频作者ID',
  `status` tinyint NULL DEFAULT 0 COMMENT '视频状态：0草稿，1审核中，2已发布，3下架',
  `is_original` tinyint NULL DEFAULT 1 COMMENT '是否原创：0转载，1原创',
  `view_count` bigint NULL DEFAULT 0 COMMENT '播放次数统计',
  `like_count` int NULL DEFAULT 0 COMMENT '点赞数统计',
  `dislike_count` int NULL DEFAULT 0 COMMENT '点踩数统计',
  `comment_count` int NULL DEFAULT 0 COMMENT '评论数统计',
  `publish_time` timestamp NULL DEFAULT NULL COMMENT '发布时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`video_id`) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  INDEX `author_id`(`author_id` ASC) USING BTREE,
  CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `videos_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of videos
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
