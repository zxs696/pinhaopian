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

    public void setId(Long categoryId) {

    }
}