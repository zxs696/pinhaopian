package com.it.pinhaopian.mapper;

import com.it.pinhaopian.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {
    User findById(@Param("userId") Long userId);
    User findByUsername(@Param("username") String username);
    User findByEmail(@Param("email") String email);
    List<User> findAll();
    int insert(User user);
    int update(User user);
    int delete(@Param("userId") Long userId);
    boolean existsByUsername(@Param("username") String username);
    boolean existsByEmail(@Param("email") String email);
}