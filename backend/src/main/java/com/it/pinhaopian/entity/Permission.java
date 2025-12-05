package com.it.pinhaopian.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@TableName("permissions")
public class Permission {
    @TableId(type = IdType.AUTO, value = "permission_id")
    private Long permissionId;

    private String permissionCode;

    private String permissionName;

    private String resourceType;

    private String resourceUrl;

    private String resourceMethod;

    private Long parentId;

    private String description;

    private Integer status;

    private Integer sortOrder;

    private Long createdBy;

    private Date createdAt;

    private Long updatedBy;

    private Date updatedAt;

    // 非数据库字段，用于存储子权限列表
    @TableField(exist = false)
    private List<Permission> children;
}