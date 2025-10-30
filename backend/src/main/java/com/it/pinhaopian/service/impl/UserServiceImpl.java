package com.it.pinhaopian.service.impl;

import com.it.pinhaopian.common.PageRequest;
import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.entity.UserProfile;
import com.it.pinhaopian.mapper.UserMapper;
import com.it.pinhaopian.service.UserService;
import com.it.pinhaopian.utils.PasswordUtils;
import org.springframework.beans.factory.annotation.Autowired;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl extends BaseServiceImpl<User, Long> implements UserService {

    @Autowired
    private UserMapper userMapper;

    /**
     * 由于使用MyBatis而非Spring Data JPA，这里返回一个空的Repository
     * 在实际方法中我们直接使用userMapper
     */
    @Override
    protected BaseMapper<User> getMapper() {
        return userMapper;
    }

    @Override
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(userMapper.findById(id));
    }

    @Override
    public List<User> findAll() {
        return userMapper.findAll();
    }

    @Override
    public Page<User> findAll(PageRequest pageRequest) {
        // 使用MyBatis Plus分页查询
        Page<User> page = new Page<>(pageRequest.getPage(), pageRequest.getPageSize());
        return userMapper.selectPage(page, null);
    }

    @Override
    public List<User> findAllById(Iterable<Long> ids) {
        List<User> result = new ArrayList<>();
        if (ids != null) {
            for (Long id : ids) {
                User user = userMapper.findById(id);
                if (user != null) {
                    result.add(user);
                }
            }
        }
        return result;
    }

    @Override
    public User save(User entity) {
        if (entity == null) {
            throw new IllegalArgumentException("User entity cannot be null");
        }
        if (entity.getUserId() == null) {
            // 新增用户
            entity.setCreatedAt(new Date());
            entity.setUpdatedAt(new Date());
            userMapper.insert(entity);
        } else {
            // 更新
            entity.setUpdatedAt(new Date());
            userMapper.update(entity);
        }
        return entity;
    }

    @Override
    public void deleteById(Long id) {
        userMapper.delete(id);
    }

    @Override
    public boolean existsById(Long id) {
        return userMapper.findById(id) != null;
    }

    @Override
    public User findByUsername(String username) {
        return userMapper.findByUsername(username);
    }
    
    @Override
    public User getUserByUsername(String username) {
        return findByUsername(username);
    }
    
    @Override
    public User login(String username, String password) {
        // 根据用户名查询用户
        User user = findByUsername(username);
        if (user == null) {
            return null;
        }
        
        // 验证密码
        if (PasswordUtils.matches(password, user.getPasswordHash())) {
            // 登录成功，返回用户信息（不包含密码）
            user.setPasswordHash(null);
            return user;
        }
        
        return null;
    }
    
    @Override
    public boolean register(User user) {
        try {
            // 检查用户名是否已存在
            if (existsByUsername(user.getUsername())) {
                return false;
            }
            
            // 检查邮箱是否已存在
            if (existsByEmail(user.getEmail())) {
                return false;
            }
            
            // 加密密码
            user.setPasswordHash(PasswordUtils.encryptPassword(user.getPasswordHash()));
            
            // 设置创建和更新时间
            user.setCreatedAt(new Date());
            user.setUpdatedAt(new Date());
            
            // 设置默认用户状态
            user.setStatus(1); // 1表示启用
            
            // 保存用户
            return userMapper.insert(user) > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
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
        User user = userMapper.findById(userId);
        if (user == null) {
            return false;
        }
        
        // 验证旧密码
        if (!PasswordUtils.matches(oldPassword, user.getPasswordHash())) {
            return false;
        }
        
        // 更新密码
        user.setPasswordHash(PasswordUtils.encryptPassword(newPassword));
        user.setUpdatedAt(new Date());
        return userMapper.update(user) > 0;
    }
}