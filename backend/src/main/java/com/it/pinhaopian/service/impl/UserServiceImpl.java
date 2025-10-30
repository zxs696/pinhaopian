package com.it.pinhaopian.service.impl;

import com.it.pinhaopian.common.PageRequest;
import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.entity.UserProfile;
import com.it.pinhaopian.mapper.UserMapper;
import com.it.pinhaopian.service.UserService;
import com.it.pinhaopian.utils.PasswordUtils;
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

    private final UserMapper userMapper;

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

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