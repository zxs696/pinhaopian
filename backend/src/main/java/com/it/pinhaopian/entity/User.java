package com.it.pinhaopian.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.Setter;

import java.util.Date;
import java.util.List;



@Data
@TableName("users")
public class User {
    @TableId(type = IdType.AUTO, value = "user_id")
    private Long userId;

    private String username;

    private String email;

    @JsonIgnore
    @Setter
    private String passwordHash;

    private String nickname;

    private String avatarUrl;

    private String phone;
    
    private Integer gender = 0;
    
    private Date birthday;

    private Integer status;

    private Date createdAt;

    private Date updatedAt;

    // 临时字段，不持久化到数据库，用于接收前端传入的明文密码
    @Setter
    @TableField(exist = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    // 用户角色列表，不持久化到数据库
    @TableField(exist = false)
    private List<Role> roles;
}