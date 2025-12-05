package com.it.pinhaopian.service.impl;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.it.pinhaopian.entity.Role;
import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.entity.UserProfile;
import com.it.pinhaopian.entity.UserRole;
import com.it.pinhaopian.exception.BusinessException;
import com.it.pinhaopian.mapper.RoleMapper;
import com.it.pinhaopian.mapper.UserMapper;
import com.it.pinhaopian.mapper.UserRoleMapper;
import com.it.pinhaopian.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl extends BaseServiceImpl<User, Long> implements UserService {

    private final UserMapper userMapper;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private UserRoleMapper userRoleMapper;
    
    @Autowired
    private RoleMapper roleMapper;

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    protected BaseMapper<User> getMapper() {
        return userMapper;
    }

    @Override
    public User findByUsername(String username) {
        User user = userMapper.findByUsername(username);
        if (user != null) {
            // 加载用户角色
            List<Role> roles = roleMapper.findRolesByUserId(user.getUserId());
            user.setRoles(roles);
        }
        return user;
    }
    
    @Override
    public Page<User> findUsersPage(Page<User> page, String username, String email, Integer status) {
        // 使用MyBatis Plus的QueryWrapper构建查询条件
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User> queryWrapper = 
            new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        
        if (username != null && !username.trim().isEmpty()) {
            queryWrapper.like("username", username);
        }
        
        if (email != null && !email.trim().isEmpty()) {
            queryWrapper.like("email", email);
        }
        
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        
        return userMapper.selectPage(page, queryWrapper);
    }
    
    @Override
    public User getUserByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userMapper.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userMapper.existsByEmail(email);
    }

    @Override
    public UserProfile getUserProfile(Long userId) {
        // 这里需要实现查询用户资料的逻辑
        // 由于UserProfile表的Mapper还未创建，暂时返回null
        return null;
    }

    @Override
    public boolean updateUserProfile(UserProfile profile) {
        // 这里需要实现更新用户资料的逻辑
        // 由于UserProfile表的Mapper还未创建，暂时返回false
        return false;
    }

    @Override
    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        
        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException(400, "原密码不正确");
        }
        
        // 更新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        return update(user) != null;
    }
    
    @Override
    public boolean assignRoles(Long userId, List<Long> roleIds) {
        // 先删除用户的所有角色
        userRoleMapper.deleteByUserId(userId);
        
        // 如果角色ID列表为空，直接返回
        if (roleIds == null || roleIds.isEmpty()) {
            return true;
        }
        
        // 创建新的用户角色关联
        List<UserRole> userRoles = new ArrayList<>();
        Date now = new Date();
        
        for (Long roleId : roleIds) {
            UserRole userRole = new UserRole();
            userRole.setUserId(userId);
            userRole.setRoleId(roleId);
            userRole.setCreatedAt(now);
            userRoles.add(userRole);
        }
        
        // 批量插入
        return userRoleMapper.batchInsert(userRoles) > 0;
    }
    
    @Override
    public List<Role> getUserRoles(Long userId) {
        return roleMapper.findRolesByUserId(userId);
    }
    
    @Override
    public List<Long> getUserRoleIds(Long userId) {
        return userRoleMapper.findRoleIdsByUserId(userId);
    }
    
    @Override
    public boolean resetPassword(Long userId, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        
        // 更新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        return update(user) != null;
    }
    
    @Override
    public boolean updateUserStatus(Long userId, Integer status) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        
        // 更新用户状态
        user.setStatus(status);
        return update(user) != null;
    }
}