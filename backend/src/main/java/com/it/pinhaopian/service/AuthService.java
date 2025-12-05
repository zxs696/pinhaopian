package com.it.pinhaopian.service;

import com.it.pinhaopian.entity.User;

/**
 * 认证服务接口
 * 负责处理登录、注册、登出等认证相关业务
 */
public interface AuthService {
    
    /**
     * 用户登录
     * @param username 用户名或邮箱
     * @param password 密码
     * @return 登录成功返回用户信息，失败返回null
     */
    User login(String username, String password);
    
    /**
     * 用户注册
     * @param user 用户信息
     * @return 注册成功返回用户信息，失败返回null
     */
    User register(User user);
    
    /**
     * 登出处理
     * @param token 用户token（可选）
     * @return 登出结果
     */
    boolean logout(String token);
    
    /**
     * 刷新token
     * @param refreshToken 刷新token
     * @return 新的访问token
     */
    String refreshToken(String refreshToken);
    
    /**
     * 生成JWT token
     * @param username 用户名
     * @return JWT token
     */
    String generateToken(String username);
    
    /**
     * 生成JWT token并可选择将旧token加入黑名单
     * @param username 用户名
     * @param oldToken 旧token（可选）
     * @return JWT token
     */
    String generateToken(String username, String oldToken);
    
    /**
     * 生成JWT token并可选择将旧token加入黑名单
     * @param username 用户名
     * @param userId 用户ID
     * @param oldToken 旧token（可选）
     * @return JWT token
     */
    String generateToken(String username, Long userId, String oldToken);
    
    /**
     * 验证token是否有效
     * @param token 用户token
     * @return token验证结果
     */
    boolean validateToken(String token);
    
    /**
     * 从token中获取用户信息
     * @param token 用户token
     * @return 用户信息
     */
    User getUserFromToken(String token);
    
    /**
     * 检查token是否在黑名单中（被顶号的情况）
     * @param token 用户token
     * @return 是否在黑名单中
     */
    boolean isTokenBlacklisted(String token);
}