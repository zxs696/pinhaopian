package com.it.pinhaopian.entity;

import lombok.Data;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;

@Data
@TableName("tags")
public class Tag {
    @TableId(type = IdType.AUTO, value = "tag_id")
    private Long tagId;

    private String name;
    private Integer usageCount;
    private Date createdAt;
}