package com.it.pinhaopian.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Setter;

import java.util.Date;

@Data
@TableName("users")
public class User {
    @TableId(type = IdType.AUTO, value = "user_id")
    private Long userId;

    private String username;

    private String email;

    @JsonIgnore
    private String passwordHash;

    private String nickname;

    private String avatarUrl;

    private String phone;

    private Integer gender;

    private Date birthday;

    private Integer status;
    
    // 用户类型：0-管理员，1-普通用户，2-游客等
    private Integer userType = 0;

    private Date createdAt;

    private Date updatedAt;

    // 临时字段，不持久化到数据库，用于接收前端传入的明文密码
    @Setter
    @TableField(exist = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}