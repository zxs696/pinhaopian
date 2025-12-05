package com.it.pinhaopian.entity;

import lombok.Data;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;

@Data
@TableName("categories")
public class Category {
    @TableId(type = IdType.AUTO, value = "category_id")
    private Integer categoryId;

    private String name;
    private String description;
    private Integer parentId;
    private Integer sortOrder;
    private Integer status;
    private Date createdAt;

    // 移除空的setId方法，因为已经有categoryId字段
}