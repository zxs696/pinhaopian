package com.it.pinhaopian.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.it.pinhaopian.entity.User;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    @Select("SELECT * FROM users WHERE user_id = #{userId}")
    User findById(@Param("userId") Long userId);

    @Select("SELECT * FROM users WHERE username = #{username}")
    User findByUsername(@Param("username") String username);

    @Select("SELECT * FROM users WHERE email = #{email}")
    User findByEmail(@Param("email") String email);

    @Select("SELECT * FROM users")
    List<User> findAll();

    @Insert("INSERT INTO users(username, email, password_hash, nickname, status, user_type, created_at, updated_at) " +
            "VALUES(#{username}, #{email}, #{passwordHash}, #{nickname}, #{status}, #{userType}, #{createdAt}, #{updatedAt})")
    @Options(useGeneratedKeys = true, keyProperty = "userId", keyColumn = "user_id")
    int insert(User user);

    @Update("UPDATE users SET username = #{username}, email = #{email}, password_hash = #{passwordHash}, " +
            "nickname = #{nickname}, avatar_url = #{avatarUrl}, phone = #{phone}, gender = #{gender}, " +
            "birthday = #{birthday}, status = #{status}, user_type = #{userType}, updated_at = #{updatedAt} WHERE user_id = #{userId}")
    int update(User user);

    @Delete("DELETE FROM users WHERE user_id = #{userId}")
    int delete(@Param("userId") Long userId);

    @Select("SELECT COUNT(*) > 0 FROM users WHERE username = #{username}")
    boolean existsByUsername(@Param("username") String username);

    @Select("SELECT COUNT(*) > 0 FROM users WHERE email = #{email}")
    boolean existsByEmail(@Param("email") String email);
}