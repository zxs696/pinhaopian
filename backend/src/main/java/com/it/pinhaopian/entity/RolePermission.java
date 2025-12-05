package com.it.pinhaopian.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("role_permissions")
public class RolePermission {
    @TableId(type = IdType.AUTO, value = "id")
    private Long id;

    private Long roleId;

    private Long permissionId;

    private Long createdBy;

    private Date createdAt;
}