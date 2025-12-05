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

 Date: 27/11/2025 16:59:24
*/

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET COLLATION_CONNECTION = utf8mb4_unicode_ci;
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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '操作日志表' ROW_FORMAT = Dynamic;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 55 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '权限表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of permissions
-- ----------------------------
-- 一级菜单
INSERT INTO `permissions` VALUES (1, 'home', '首页', 'menu', '/admin/home', NULL, 0, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (2, 'workbench', '工作台', 'menu', '/admin/workbench', NULL, 1, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (3, 'dashboard', '仪表盘', 'menu', '/admin/dashboard', NULL, 0, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (4, 'content', '内容管理', 'menu', '/admin/content', NULL, 0, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (5, 'user', '用户管理', 'menu', '/admin/user', NULL, 0, NULL, 1, 5, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (6, 'system', '系统管理', 'menu', '/admin/system', NULL, 0, NULL, 1, 6, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');

-- 仪表盘子菜单
INSERT INTO `permissions` VALUES (7, 'dashboard_analysis', '分析页', 'menu', '/admin/dashboard/analysis', NULL, 3, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (8, 'dashboard_statistics', '统计页', 'menu', '/admin/dashboard/statistics', NULL, 3, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');

-- 内容管理子菜单
INSERT INTO `permissions` VALUES (9, 'video', '视频管理', 'menu', '/admin/video', NULL, 4, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (10, 'video_pending', '待审核视频', 'menu', '/admin/video/pending', NULL, 4, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (11, 'category', '分类管理', 'menu', '/admin/category', NULL, 4, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');

-- 用户管理子菜单
INSERT INTO `permissions` VALUES (12, 'user_list', '用户列表', 'menu', '/admin/user/list', NULL, 5, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (13, 'role', '角色管理', 'menu', '/admin/role', NULL, 5, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (14, 'permission', '权限管理', 'menu', '/admin/permission', NULL, 5, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (15, 'menu', '菜单管理', 'menu', '/admin/menu', NULL, 5, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');

-- 系统管理子菜单
INSERT INTO `permissions` VALUES (16, 'system_settings', '系统设置', 'menu', '/admin/system/settings', NULL, 6, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (17, 'system_security', '安全设置', 'menu', '/admin/system/security', NULL, 6, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (18, 'system_logs', '系统日志', 'menu', '/admin/system/logs', NULL, 6, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');

-- 按钮权限
INSERT INTO `permissions` VALUES (19, 'user_view', '查看用户', 'button', '', NULL, 12, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (20, 'user_add', '添加用户', 'button', '', NULL, 12, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (21, 'user_edit', '编辑用户', 'button', '', NULL, 12, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (22, 'user_delete', '删除用户', 'button', '', NULL, 12, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (23, 'video_view', '查看视频', 'button', '', NULL, 9, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (24, 'video_add', '添加视频', 'button', '', NULL, 9, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (25, 'video_edit', '编辑视频', 'button', '', NULL, 9, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (26, 'video_delete', '删除视频', 'button', '', NULL, 9, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (27, 'video_approve', '审核视频', 'button', '', NULL, 10, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (28, 'video_reject', '拒绝视频', 'button', '', NULL, 10, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (29, 'category_view', '查看分类', 'button', '', NULL, 11, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (30, 'category_add', '添加分类', 'button', '', NULL, 11, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (31, 'category_edit', '编辑分类', 'button', '', NULL, 11, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (32, 'category_delete', '删除分类', 'button', '', NULL, 11, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (33, 'role_view', '查看角色', 'button', '', NULL, 13, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (34, 'role_add', '添加角色', 'button', '', NULL, 13, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (35, 'role_edit', '编辑角色', 'button', '', NULL, 13, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (36, 'role_delete', '删除角色', 'button', '', NULL, 13, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (37, 'permission_view', '查看权限', 'button', '', NULL, 14, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (38, 'permission_add', '添加权限', 'button', '', NULL, 14, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (39, 'permission_edit', '编辑权限', 'button', '', NULL, 14, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (40, 'permission_delete', '删除权限', 'button', '', NULL, 14, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');

-- API权限
INSERT INTO `permissions` VALUES (41, 'api_user_list', '用户列表API', 'api', '/api/admin/user/list', 'GET', 12, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (42, 'api_user_add', '添加用户API', 'api', '/api/admin/user', 'POST', 12, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (43, 'api_user_edit', '编辑用户API', 'api', '/api/admin/user/*', 'PUT', 12, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (44, 'api_user_delete', '删除用户API', 'api', '/api/admin/user/*', 'DELETE', 12, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (45, 'api_video_list', '视频列表API', 'api', '/api/admin/video', 'GET', 9, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (46, 'api_video_add', '添加视频API', 'api', '/api/admin/video', 'POST', 9, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (47, 'api_video_edit', '编辑视频API', 'api', '/api/admin/video/*', 'PUT', 9, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (48, 'api_video_delete', '删除视频API', 'api', '/api/admin/video/*', 'DELETE', 9, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (49, 'api_video_approve', '审核视频API', 'api', '/api/admin/video/*/approve', 'PUT', 10, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (50, 'api_video_reject', '拒绝视频API', 'api', '/api/admin/video/*/reject', 'PUT', 10, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (51, 'api_category_list', '分类列表API', 'api', '/api/admin/category', 'GET', 11, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (52, 'api_category_add', '添加分类API', 'api', '/api/admin/category', 'POST', 11, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (53, 'api_category_edit', '编辑分类API', 'api', '/api/admin/category/*', 'PUT', 11, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (54, 'api_category_delete', '删除分类API', 'api', '/api/admin/category/*', 'DELETE', 11, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (55, 'api_role_list', '角色列表API', 'api', '/api/admin/role', 'GET', 13, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (56, 'api_role_add', '添加角色API', 'api', '/api/admin/role', 'POST', 13, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (57, 'api_role_edit', '编辑角色API', 'api', '/api/admin/role/*', 'PUT', 13, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (58, 'api_role_delete', '删除角色API', 'api', '/api/admin/role/*', 'DELETE', 13, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (59, 'api_permission_list', '权限列表API', 'api', '/api/admin/permission', 'GET', 14, NULL, 1, 1, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (60, 'api_permission_add', '添加权限API', 'api', '/api/admin/permission', 'POST', 14, NULL, 1, 2, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (61, 'api_permission_edit', '编辑权限API', 'api', '/api/admin/permission/*', 'PUT', 14, NULL, 1, 3, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');
INSERT INTO `permissions` VALUES (62, 'api_permission_delete', '删除权限API', 'api', '/api/admin/permission/*', 'DELETE', 14, NULL, 1, 4, NULL, '2025-11-27 16:52:39', NULL, '2025-11-27 16:52:39');

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 82 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '角色权限关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role_permissions
-- ----------------------------
-- 管理员角色权限 (role_id = 1)
-- 一级菜单权限
INSERT INTO `role_permissions` VALUES (1, 1, 1, NULL, '2025-11-27 16:52:39');  -- 首页
INSERT INTO `role_permissions` VALUES (2, 1, 3, NULL, '2025-11-27 16:52:39');  -- 仪表盘
INSERT INTO `role_permissions` VALUES (3, 1, 4, NULL, '2025-11-27 16:52:39');  -- 内容管理
INSERT INTO `role_permissions` VALUES (4, 1, 5, NULL, '2025-11-27 16:52:39');  -- 用户管理
INSERT INTO `role_permissions` VALUES (5, 1, 6, NULL, '2025-11-27 16:52:39');  -- 系统管理

-- 首页子菜单权限
INSERT INTO `role_permissions` VALUES (6, 1, 2, NULL, '2025-11-27 16:52:39');  -- 工作台

-- 仪表盘子菜单权限
INSERT INTO `role_permissions` VALUES (7, 1, 7, NULL, '2025-11-27 16:52:39');  -- 分析页
INSERT INTO `role_permissions` VALUES (8, 1, 8, NULL, '2025-11-27 16:52:39');  -- 统计页

-- 内容管理子菜单权限
INSERT INTO `role_permissions` VALUES (9, 1, 9, NULL, '2025-11-27 16:52:39');  -- 视频管理
INSERT INTO `role_permissions` VALUES (10, 1, 10, NULL, '2025-11-27 16:52:39'); -- 待审核视频
INSERT INTO `role_permissions` VALUES (11, 1, 11, NULL, '2025-11-27 16:52:39'); -- 分类管理

-- 用户管理子菜单权限
INSERT INTO `role_permissions` VALUES (12, 1, 12, NULL, '2025-11-27 16:52:39'); -- 用户列表
INSERT INTO `role_permissions` VALUES (13, 1, 13, NULL, '2025-11-27 16:52:39'); -- 角色管理
INSERT INTO `role_permissions` VALUES (14, 1, 14, NULL, '2025-11-27 16:52:39'); -- 权限管理
INSERT INTO `role_permissions` VALUES (15, 1, 15, NULL, '2025-11-27 16:52:39'); -- 菜单管理

-- 系统管理子菜单权限
INSERT INTO `role_permissions` VALUES (16, 1, 16, NULL, '2025-11-27 16:52:39'); -- 系统设置
INSERT INTO `role_permissions` VALUES (17, 1, 17, NULL, '2025-11-27 16:52:39'); -- 安全设置
INSERT INTO `role_permissions` VALUES (18, 1, 18, NULL, '2025-11-27 16:52:39'); -- 系统日志

-- 按钮权限
INSERT INTO `role_permissions` VALUES (19, 1, 19, NULL, '2025-11-27 16:52:39'); -- 查看用户
INSERT INTO `role_permissions` VALUES (20, 1, 20, NULL, '2025-11-27 16:52:39'); -- 添加用户
INSERT INTO `role_permissions` VALUES (21, 1, 21, NULL, '2025-11-27 16:52:39'); -- 编辑用户
INSERT INTO `role_permissions` VALUES (22, 1, 22, NULL, '2025-11-27 16:52:39'); -- 删除用户
INSERT INTO `role_permissions` VALUES (23, 1, 23, NULL, '2025-11-27 16:52:39'); -- 查看视频
INSERT INTO `role_permissions` VALUES (24, 1, 24, NULL, '2025-11-27 16:52:39'); -- 添加视频
INSERT INTO `role_permissions` VALUES (25, 1, 25, NULL, '2025-11-27 16:52:39'); -- 编辑视频
INSERT INTO `role_permissions` VALUES (26, 1, 26, NULL, '2025-11-27 16:52:39'); -- 删除视频
INSERT INTO `role_permissions` VALUES (27, 1, 27, NULL, '2025-11-27 16:52:39'); -- 审核视频
INSERT INTO `role_permissions` VALUES (28, 1, 28, NULL, '2025-11-27 16:52:39'); -- 拒绝视频
INSERT INTO `role_permissions` VALUES (29, 1, 29, NULL, '2025-11-27 16:52:39'); -- 查看分类
INSERT INTO `role_permissions` VALUES (30, 1, 30, NULL, '2025-11-27 16:52:39'); -- 添加分类
INSERT INTO `role_permissions` VALUES (31, 1, 31, NULL, '2025-11-27 16:52:39'); -- 编辑分类
INSERT INTO `role_permissions` VALUES (32, 1, 32, NULL, '2025-11-27 16:52:39'); -- 删除分类
INSERT INTO `role_permissions` VALUES (33, 1, 33, NULL, '2025-11-27 16:52:39'); -- 查看角色
INSERT INTO `role_permissions` VALUES (34, 1, 34, NULL, '2025-11-27 16:52:39'); -- 添加角色
INSERT INTO `role_permissions` VALUES (35, 1, 35, NULL, '2025-11-27 16:52:39'); -- 编辑角色
INSERT INTO `role_permissions` VALUES (36, 1, 36, NULL, '2025-11-27 16:52:39'); -- 删除角色
INSERT INTO `role_permissions` VALUES (37, 1, 37, NULL, '2025-11-27 16:52:39'); -- 查看权限
INSERT INTO `role_permissions` VALUES (38, 1, 38, NULL, '2025-11-27 16:52:39'); -- 添加权限
INSERT INTO `role_permissions` VALUES (39, 1, 39, NULL, '2025-11-27 16:52:39'); -- 编辑权限
INSERT INTO `role_permissions` VALUES (40, 1, 40, NULL, '2025-11-27 16:52:39'); -- 删除权限

-- API权限
INSERT INTO `role_permissions` VALUES (41, 1, 41, NULL, '2025-11-27 16:52:39'); -- 用户列表API
INSERT INTO `role_permissions` VALUES (42, 1, 42, NULL, '2025-11-27 16:52:39'); -- 添加用户API
INSERT INTO `role_permissions` VALUES (43, 1, 43, NULL, '2025-11-27 16:52:39'); -- 编辑用户API
INSERT INTO `role_permissions` VALUES (44, 1, 44, NULL, '2025-11-27 16:52:39'); -- 删除用户API
INSERT INTO `role_permissions` VALUES (45, 1, 45, NULL, '2025-11-27 16:52:39'); -- 视频列表API
INSERT INTO `role_permissions` VALUES (46, 1, 46, NULL, '2025-11-27 16:52:39'); -- 添加视频API
INSERT INTO `role_permissions` VALUES (47, 1, 47, NULL, '2025-11-27 16:52:39'); -- 编辑视频API
INSERT INTO `role_permissions` VALUES (48, 1, 48, NULL, '2025-11-27 16:52:39'); -- 删除视频API
INSERT INTO `role_permissions` VALUES (49, 1, 49, NULL, '2025-11-27 16:52:39'); -- 审核视频API
INSERT INTO `role_permissions` VALUES (50, 1, 50, NULL, '2025-11-27 16:52:39'); -- 拒绝视频API
INSERT INTO `role_permissions` VALUES (51, 1, 51, NULL, '2025-11-27 16:52:39'); -- 分类列表API
INSERT INTO `role_permissions` VALUES (52, 1, 52, NULL, '2025-11-27 16:52:39'); -- 添加分类API
INSERT INTO `role_permissions` VALUES (53, 1, 53, NULL, '2025-11-27 16:52:39'); -- 编辑分类API
INSERT INTO `role_permissions` VALUES (54, 1, 54, NULL, '2025-11-27 16:52:39'); -- 删除分类API
INSERT INTO `role_permissions` VALUES (55, 1, 55, NULL, '2025-11-27 16:52:39'); -- 角色列表API
INSERT INTO `role_permissions` VALUES (56, 1, 56, NULL, '2025-11-27 16:52:39'); -- 添加角色API
INSERT INTO `role_permissions` VALUES (57, 1, 57, NULL, '2025-11-27 16:52:39'); -- 编辑角色API
INSERT INTO `role_permissions` VALUES (58, 1, 58, NULL, '2025-11-27 16:52:39'); -- 删除角色API
INSERT INTO `role_permissions` VALUES (59, 1, 59, NULL, '2025-11-27 16:52:39'); -- 权限列表API
INSERT INTO `role_permissions` VALUES (60, 1, 60, NULL, '2025-11-27 16:52:39'); -- 添加权限API
INSERT INTO `role_permissions` VALUES (61, 1, 61, NULL, '2025-11-27 16:52:39'); -- 编辑权限API
INSERT INTO `role_permissions` VALUES (62, 1, 62, NULL, '2025-11-27 16:52:39'); -- 删除权限API

-- 审核员角色权限 (role_id = 2) - 确保可以访问首页和工作台
INSERT INTO `role_permissions` VALUES (63, 2, 1, NULL, '2025-11-27 16:52:39');  -- 首页
INSERT INTO `role_permissions` VALUES (64, 2, 2, NULL, '2025-11-27 16:52:39');  -- 工作台
INSERT INTO `role_permissions` VALUES (65, 2, 3, NULL, '2025-11-27 16:52:39');  -- 仪表盘
INSERT INTO `role_permissions` VALUES (66, 2, 4, NULL, '2025-11-27 16:52:39');  -- 内容管理
INSERT INTO `role_permissions` VALUES (67, 2, 9, NULL, '2025-11-27 16:52:39');  -- 视频管理
INSERT INTO `role_permissions` VALUES (68, 2, 10, NULL, '2025-11-27 16:52:39'); -- 待审核视频
INSERT INTO `role_permissions` VALUES (69, 2, 23, NULL, '2025-11-27 16:52:39'); -- 查看视频
INSERT INTO `role_permissions` VALUES (70, 2, 27, NULL, '2025-11-27 16:52:39'); -- 审核视频
INSERT INTO `role_permissions` VALUES (71, 2, 28, NULL, '2025-11-27 16:52:39'); -- 拒绝视频
INSERT INTO `role_permissions` VALUES (72, 2, 45, NULL, '2025-11-27 16:52:39'); -- 视频列表API
INSERT INTO `role_permissions` VALUES (73, 2, 49, NULL, '2025-11-27 16:52:39'); -- 审核视频API
INSERT INTO `role_permissions` VALUES (74, 2, 50, NULL, '2025-11-27 16:52:39'); -- 拒绝视频API

-- 普通用户角色权限 (role_id = 3) - 只有基础按钮权限和API权限，无后台管理菜单权限
INSERT INTO `role_permissions` VALUES (75, 3, 23, NULL, '2025-11-27 16:52:39'); -- 查看视频
INSERT INTO `role_permissions` VALUES (76, 3, 45, NULL, '2025-11-27 16:52:39'); -- 视频列表API

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
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '角色表' ROW_FORMAT = Dynamic;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户角色关联表' ROW_FORMAT = Dynamic;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of videos
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
