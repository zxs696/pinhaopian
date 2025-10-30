package com.it.pinhaopian.service;

import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.entity.UserProfile;


/**
 * 用户服务接口
 * 负责处理用户管理相关业务
 */
public interface UserService extends BaseService<User, Long> {
    
    /**
     * 根据用户名获取用户
     * @param username 用户名
     * @return 用户对象
     */
    User findByUsername(String username);

    /**
     * 根据邮箱获取用户
     * @param email 邮箱
     * @return 用户对象
     */
    User getUserByEmail(String email);
    
    /**
     * 检查用户名是否存在
     * @param username 用户名
     * @return 是否存在
     */
    boolean existsByUsername(String username);
    
    /**
     * 检查邮箱是否存在
     * @param email 邮箱
     * @return 是否存在
     */
    boolean existsByEmail(String email);
    
    /**
     * 获取用户资料
     * @param userId 用户ID
     * @return 用户资料
     */
    UserProfile getUserProfile(Long userId);
    
    /**
     * 更新用户资料
     * @param profile 用户资料
     * @return 是否成功
     */
    boolean updateUserProfile(UserProfile profile);
    
    /**
     * 修改密码
     * @param userId 用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     * @return 是否成功
     */
    boolean changePassword(Long userId, String oldPassword, String newPassword);
    
    /**
     * 根据用户名获取用户（兼容旧方法）
     * @param username 用户名
     * @return 用户对象
     */
    default User getUserByUsername(String username) {
        return findByUsername(username);
    }
}