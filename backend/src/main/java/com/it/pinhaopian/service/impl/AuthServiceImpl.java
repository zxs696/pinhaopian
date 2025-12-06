package com.it.pinhaopian.service.impl;

import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.entity.Role;
import com.it.pinhaopian.mapper.UserMapper;
import com.it.pinhaopian.service.AuthService;
import com.it.pinhaopian.service.UserService;
import com.it.pinhaopian.utils.JwtUtils;
import com.it.pinhaopian.utils.PasswordUtils;
import com.it.pinhaopian.utils.RedisUtils;
import com.it.pinhaopian.websocket.SessionWebSocketManager;
import com.it.pinhaopian.common.ResultCode;
import com.it.pinhaopian.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;
import java.util.List;

import java.util.Date;

/**
 * 认证服务实现类
 */
@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserService userService;
    private final UserMapper userMapper; // 暂时保留，用于用户注册（插入新用户）
    private final JwtUtils jwtUtils;
    private final RedisUtils redisUtils;

    public AuthServiceImpl(UserService userService, UserMapper userMapper, JwtUtils jwtUtils, RedisUtils redisUtils) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.jwtUtils = jwtUtils;
        this.redisUtils = redisUtils;
    }

    @Override
    public User login(String username, String password) {
        try {
            logger.info("Login attempt for username/email: {}", username);
            
            // 先尝试通过用户名查找
            User user = userService.getUserByUsername(username);
            if (user == null) {
                logger.debug("User not found by username, trying email");
                user = userService.getUserByEmail(username);
            }
            
            if (user != null) {
                logger.debug("User found: {}", user.getUsername());
                // 验证密码和用户状态
                boolean passwordMatch = PasswordUtils.matches(password, user.getPasswordHash());
                boolean statusActive = user.getStatus() == 1;
                
                if (passwordMatch && statusActive) {
                    logger.info("Login successful for user: {}", user.getUsername());
                    
                    // 实现登录互斥：检查用户是否已有有效token，如果有，则使旧token失效
                    try {
                        String userTokenKey = "user_tokens:" + user.getUserId();
                        java.util.Set<String> existingTokens = redisUtils.members(userTokenKey);
                        
                        if (existingTokens != null && !existingTokens.isEmpty()) {
                            logger.info("Found {} existing tokens for user: {}, invalidating them", 
                                       existingTokens.size(), user.getUsername());
                            
                            // 将所有旧token加入黑名单
                            for (String oldToken : existingTokens) {
                                redisUtils.set("blacklist:" + oldToken, "1", 24, TimeUnit.HOURS);
                                logger.debug("Added old token to blacklist for user: {}", user.getUsername());
                            }
                            
                            // 发送WebSocket通知，告知旧会话已失效
                            try {
                                String message = "您的账号在其他设备登录，当前会话已失效";
                                SessionWebSocketManager.sendSessionInvalidNotification(String.valueOf(user.getUserId()), message);
                                logger.info("已向用户{}发送下线通知", user.getUsername());
                            } catch (Exception e) {
                                // WebSocket通知失败不影响登录流程
                                logger.warn("发送WebSocket下线通知失败: {}", e.getMessage());
                            }
                            
                            // 清空用户的token集合
                            redisUtils.delete(userTokenKey);
                        }
                    } catch (Exception e) {
                        // Redis不可用时记录日志但不影响登录流程
                        logger.warn("Failed to check/invalidate existing tokens for user {}: {}", 
                                  user.getUsername(), e.getMessage());
                    }
                    
                    // 获取用户角色信息
                    List<Role> roles = userService.getUserRoles(user.getUserId());
                    user.setRoles(roles);
                    
                    // 可选：将用户信息存入Redis，方便后续快速获取
                    try {
                        redisUtils.set("user:" + user.getUserId(), user, 24, TimeUnit.HOURS);
                        logger.debug("User info cached in Redis: {}", user.getUsername());
                    } catch (Exception e) {
                        // Redis不可用时记录日志但不影响登录流程
                        logger.warn("Failed to cache user info in Redis: {}", e.getMessage());
                    }
                    
                    return user;
                } else {
                    logger.warn("Invalid credentials or inactive user: {}", user.getUsername());
                    throw new BusinessException(ResultCode.BAD_REQUEST, "用户登录失败：用户名或密码错误");
                }
            } else {
                logger.warn("User not found for login attempt: {}", username);
                throw new BusinessException(ResultCode.BAD_REQUEST, "用户登录失败：用户名或密码错误");
            }
        } catch (BusinessException e) {
            throw e; // 直接抛出业务异常
        } catch (Exception e) {
            logger.error("Error during login process: {}", e.getMessage(), e);
            throw new BusinessException(ResultCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public User register(User user) {
        try {
            // 检查用户名和邮箱，至少提供一个
            boolean hasUsername = user.getUsername() != null && !user.getUsername().trim().isEmpty();
            boolean hasEmail = user.getEmail() != null && !user.getEmail().trim().isEmpty();
            
            if (!hasUsername && !hasEmail) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "用户名或邮箱至少提供一个");
            }
            
            // 根据提供的信息记录日志
            if (hasUsername) {
                logger.info("Register attempt for username: {}", user.getUsername());
            } else {
                logger.info("Register attempt for email: {}", user.getEmail());
            }
            
            // 检查提供的字段是否已存在
            if (hasUsername && userService.existsByUsername(user.getUsername())) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "用户名已存在");
            }
            
            if (hasEmail && userService.existsByEmail(user.getEmail())) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "邮箱已存在");
            }
            
            // 如果只提供了用户名，为邮箱生成默认值
            if (hasUsername && !hasEmail) {
                // 可以生成一个默认邮箱，格式为username@example.com
                user.setEmail(user.getUsername() + "@example.com");
                logger.info("Generated default email for username {}: {}", user.getUsername(), user.getEmail());
            }
            
            // 如果只提供了邮箱，从邮箱提取用户名
            if (hasEmail && !hasUsername) {
                // 从邮箱中提取用户名部分（@前面的内容）
                String usernameFromEmail = user.getEmail().split("@")[0];
                // 检查提取的用户名是否已存在，如果存在则添加随机数
                String finalUsername = usernameFromEmail;
                int count = 1;
                while (userService.existsByUsername(finalUsername)) {
                    finalUsername = usernameFromEmail + "_" + count++;
                }
                user.setUsername(finalUsername);
                logger.info("Generated username from email {}: {}", user.getEmail(), user.getUsername());
            }
            
            // 获取原始密码并加密
            String rawPassword = user.getPassword();
            if (rawPassword == null || rawPassword.isEmpty()) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "密码不能为空");
            }
            
            // 加密密码
            String encryptedPassword = PasswordUtils.encryptPassword(rawPassword);
            user.setPasswordHash(encryptedPassword);
            
            // 设置用户状态和时间
            user.setCreatedAt(new Date());
            user.setUpdatedAt(new Date());
            user.setStatus(1); // 默认启用
            
            // 插入用户
            int result = userMapper.insert(user);
            logger.info("User registered successfully: {}", user.getUsername());
            
            if (result > 0) {
                // 返回用户信息，不包含密码
                User registeredUser = userService.findByUsername(user.getUsername());
                if (registeredUser != null) {
                    registeredUser.setPasswordHash(null);
                }
                return registeredUser;
            } else {
                throw new BusinessException(ResultCode.INTERNAL_SERVER_ERROR, "用户注册失败");
            }
        } catch (BusinessException e) {
            logger.warn("Registration failed for user {}: {}", user.getUsername(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error during registration process: {}", e.getMessage(), e);
            throw new BusinessException(ResultCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public boolean logout(String token) {
        try {
            logger.info("User logout request received");
            
            if (token != null) {
                // 从token中获取用户名
                String username = JwtUtils.getUsernameFromToken(token);
                if (username != null) {
                    try {
                        // 将token加入黑名单（设置过期时间为token剩余有效期）
                        redisUtils.set("blacklist:" + token, "1", 24, TimeUnit.HOURS);
                        logger.info("Token added to blacklist for user: {}", username);
                        
                        // 从用户的token集合中移除当前token
                        User user = userService.findByUsername(username);
                        if (user != null) {
                            String userTokenKey = "user_tokens:" + user.getUserId();
                            redisUtils.removeSet(userTokenKey, token);
                            logger.info("Token removed from user's token set: {}", username);
                        }
                    } catch (Exception e) {
                        // Redis不可用时记录日志但不影响登出流程
                        logger.warn("Failed to add token to blacklist in Redis: {}", e.getMessage());
                    }
                    
                    // 可选：从Redis中移除用户缓存
                    try {
                        User user = userService.findByUsername(username);
                        if (user != null) {
                            redisUtils.delete("user:" + user.getUserId());
                            logger.info("User cache removed: {}", username);
                        }
                    } catch (Exception e) {
                        // Redis不可用时记录日志但不影响登出流程
                        logger.warn("Failed to remove user cache from Redis: {}", e.getMessage());
                    }
                }
            }
            return true;
        } catch (Exception e) {
            logger.error("Error during logout process: {}", e.getMessage(), e);
            // 即使发生异常，也返回成功，确保用户能够登出
            return true;
        }
    }

    @Override
    public String refreshToken(String refreshToken) {
        try {
            logger.info("Token refresh request received");
            
            // 验证refreshToken
            String username = JwtUtils.getUsernameFromToken(refreshToken);
            if (username == null) {
                logger.warn("Invalid refresh token");
                return null;
            }
            
            // 检查用户是否存在
            User user = userService.findByUsername(username);
            if (user == null) {
                logger.warn("User not found for refresh token: {}", username);
                return null;
            }
            
            // 生成新的token
            String newToken = generateToken(username, user.getUserId(), null);
            logger.info("Token refreshed successfully for user: {}", username);
            
            // 可选：将旧token加入黑名单
            try {
                redisUtils.set("blacklist:" + refreshToken, "1", 24, TimeUnit.HOURS);
            } catch (Exception e) {
                // Redis不可用时记录日志但不影响token刷新流程
                logger.warn("Failed to add refresh token to blacklist in Redis: {}", e.getMessage());
            }
            
            return newToken;
        } catch (Exception e) {
            logger.error("Error during token refresh: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public String generateToken(String username) {
        return generateToken(username, null);
    }

    @Override
    public String generateToken(String username, String oldToken) {
        try {
            if (username == null || username.trim().isEmpty()) {
                logger.warn("Attempting to generate token for null or empty username");
                return null;
            }
            
            logger.debug("Generating token for user: {}", username);
            
            // 获取用户ID
            User user = userService.findByUsername(username);
            if (user == null) {
                logger.warn("User not found for username: {}", username);
                return null;
            }
            
            return generateToken(username, user.getUserId(), oldToken);
        } catch (Exception e) {
            logger.error("Error generating token: {}", e.getMessage(), e);
            return null;
        }
    }
    
    @Override
    public String generateToken(String username, Long userId, String oldToken) {
        try {
            if (username == null || username.trim().isEmpty() || userId == null) {
                logger.warn("Attempting to generate token with invalid parameters");
                return null;
            }
            
            logger.debug("Generating token for user: {} (userId: {})", username, userId);
            
            // 如果提供了旧token，将其加入黑名单（实现被顶号功能）
            if (oldToken != null && !oldToken.isEmpty()) {
                try {
                    redisUtils.set("blacklist:" + oldToken, "1", 24, TimeUnit.HOURS);
                    logger.info("Old token added to blacklist for user: {}", username);
                    
                    // 从用户的token集合中移除旧token
                    String userTokenKey = "user_tokens:" + userId;
                    redisUtils.removeSet(userTokenKey, oldToken);
                    
                    // 使用改进的用户级广播通知所有连接的客户端该用户已被顶号
                    SessionWebSocketManager.sendSessionInvalidNotificationToAllConnections(String.valueOf(userId), "您的账号已在其他设备登录，请重新登录");
                } catch (Exception e) {
                    // Redis不可用时记录日志但不影响token生成
                    logger.warn("Failed to blacklist old token: {}", e.getMessage());
                }
            }
            
            // 使用带用户ID的token生成方法
            String token = jwtUtils.generateToken(username, userId);
              
            if (token != null) {
                // 将token与用户关联存储在Redis中
                try {
                    String userTokenKey = "user_tokens:" + userId;
                    redisUtils.addSet(userTokenKey, token);
                    
                    // 设置token集合的过期时间为24小时
                    redisUtils.expire(userTokenKey, 24, TimeUnit.HOURS);
                    
                    logger.info("Token associated with user {} in Redis", username);
                } catch (Exception e) {
                    // Redis不可用时记录日志但不影响token生成
                    logger.warn("Failed to associate token with user in Redis: {}", e.getMessage());
                }
                
                logger.info("Token generated successfully for user: {}", username);
            }
            
            return token;
        } catch (Exception e) {
            logger.error("Error generating token: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public boolean validateToken(String token) {
        try {
            logger.debug("Token validation request received");
            
            // 检查token是否在黑名单中
            if (token != null) {
                try {
                    if (redisUtils.hasKey("blacklist:" + token)) {
                        logger.warn("Token found in blacklist");
                        return false;
                    }
                } catch (Exception e) {
                    // Redis不可用时记录日志但不影响token验证流程
                    logger.warn("Failed to check token in blacklist: {}", e.getMessage());
                    // 继续执行token验证
                }
                
                // 验证token
                JwtUtils.validateToken(token);
                logger.debug("Token validation successful");
                return true;
            }
            
            return false;
        } catch (Exception e) {
            logger.error("Error validating token: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public User getUserFromToken(String token) {
        try {
            logger.debug("Fetching user from token");
            
            // 验证token
            if (!validateToken(token)) {
                logger.warn("Invalid token when fetching user");
                return null;
            }
            
            // 从token中获取用户名
            String username = JwtUtils.getUsernameFromToken(token);
            if (username == null) {
                logger.warn("Unable to extract username from token");
                return null;
            }
            
            // 查询用户信息
            User user = userService.findByUsername(username);
            if (user != null) {
                logger.debug("User found from token: {}", username);
                // 清除密码信息
                user.setPasswordHash(null);
                
                // 获取用户角色信息
                List<Role> roles = userService.getUserRoles(user.getUserId());
                user.setRoles(roles);
            } else {
                logger.warn("User not found from token: {}", username);
            }
            
            return user;
        } catch (Exception e) {
            logger.error("Error fetching user from token: {}", e.getMessage(), e);
            return null;
        }
    }
    
    @Override
    public boolean isTokenBlacklisted(String token) {
        try {
            if (token == null) {
                return false;
            }
            
            // 检查token是否在黑名单中
            return redisUtils.hasKey("blacklist:" + token);
        } catch (Exception e) {
            logger.error("Error checking token blacklist: {}", e.getMessage(), e);
            // 出现异常时，默认不在黑名单中，避免误判
            return false;
        }
    }
}