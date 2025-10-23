package com.it.pinhaopian.entity;

import lombok.Data;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;

@Data
@TableName("danmaku")
public class Danmaku {
    @TableId(type = IdType.AUTO, value = "danmaku_id")
    private Long danmakuId;

    private Long videoId;
    private Long userId;
    private String content;
    private Integer timePoint;
    private String color;
    private Integer type;
    private Integer fontSize;
    private Integer status;
    private Date createdAt;
}