package com.it.pinhaopian.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@TableName("roles")
public class Role {
    @TableId(type = IdType.AUTO, value = "role_id")
    private Long roleId;

    private String roleCode;

    private String roleName;

    private String description;

    private Integer status;

    private Integer sortOrder;

    private Long createdBy;

    private Date createdAt;

    private Long updatedBy;

    private Date updatedAt;

    // 非数据库字段，用于存储角色关联的权限列表
    @TableField(exist = false)
    private List<Permission> permissions;
}