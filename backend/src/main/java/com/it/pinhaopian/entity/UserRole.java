package com.it.pinhaopian.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("user_roles")
public class UserRole {
    @TableId(type = IdType.AUTO, value = "id")
    private Long id;

    private Long userId;

    private Long roleId;

    private Long createdBy;

    private Date createdAt;
}