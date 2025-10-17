package com.it.pinhaopian.service.impl;

import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.entity.UserProfile;
import com.it.pinhaopian.mapper.UserMapper;
import com.it.pinhaopian.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.util.Date;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public User getUserById(Long userId) {
        return userMapper.findById(userId);
    }

    @Override
    public User getUserByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    @Override
    public User getUserByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    @Override
    public List<User> getAllUsers() {
        return userMapper.findAll();
    }

    @Override
    public boolean registerUser(User user) {
        // 检查用户名和邮箱是否已存在
        if (existsByUsername(user.getUsername()) || existsByEmail(user.getEmail())) {
            return false;
        }
        
        // 密码加密处理
        user.setPasswordHash(DigestUtils.md5DigestAsHex(user.getPasswordHash().getBytes()));
        user.setCreatedAt(new Date());
        user.setUpdatedAt(new Date());
        user.setStatus(1); // 默认启用
        
        return userMapper.insert(user) > 0;
    }

    @Override
    public boolean updateUser(User user) {
        user.setUpdatedAt(new Date());
        return userMapper.update(user) > 0;
    }

    @Override
    public boolean deleteUser(Long userId) {
        return userMapper.delete(userId) > 0;
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
        User user = userMapper.findById(userId);
        if (user == null) {
            return false;
        }
        
        // 验证旧密码
        String oldPasswordHash = DigestUtils.md5DigestAsHex(oldPassword.getBytes());
        if (!oldPasswordHash.equals(user.getPasswordHash())) {
            return false;
        }
        
        // 更新密码
        user.setPasswordHash(DigestUtils.md5DigestAsHex(newPassword.getBytes()));
        user.setUpdatedAt(new Date());
        return userMapper.update(user) > 0;
    }

    @Override
    public User login(String username, String password) {
        User user = userMapper.findByUsername(username);
        if (user == null) {
            user = userMapper.findByEmail(username);
        }
        
        if (user != null) {
            String passwordHash = DigestUtils.md5DigestAsHex(password.getBytes());
            if (passwordHash.equals(user.getPasswordHash()) && user.getStatus() == 1) {
                return user;
            }
        }
        
        return null;
    }
}