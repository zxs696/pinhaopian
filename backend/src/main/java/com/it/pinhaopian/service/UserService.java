package com.it.pinhaopian.service;

import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.entity.UserProfile;
import com.it.pinhaopian.entity.Role;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.List;


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
     * 分页查询用户列表
     * @param page 分页参数
     * @param username 用户名（可选）
     * @param email 邮箱（可选）
     * @param status 状态（可选）
     * @return 分页结果
     */
    Page<User> findUsersPage(Page<User> page, String username, String email, Integer status);

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
    
    /**
     * 为用户分配角色
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     * @return 是否成功
     */
    boolean assignRoles(Long userId, List<Long> roleIds);
    
    /**
     * 获取用户的角色列表
     * @param userId 用户ID
     * @return 角色列表
     */
    List<Role> getUserRoles(Long userId);
    
    /**
     * 获取用户的角色ID列表
     * @param userId 用户ID
     * @return 角色ID列表
     */
    List<Long> getUserRoleIds(Long userId);
    
    /**
     * 重置用户密码
     * @param userId 用户ID
     * @param newPassword 新密码
     * @return 是否成功
     */
    boolean resetPassword(Long userId, String newPassword);
    
    /**
     * 更新用户状态
     * @param userId 用户ID
     * @param status 新状态
     * @return 是否成功
     */
    boolean updateUserStatus(Long userId, Integer status);
}