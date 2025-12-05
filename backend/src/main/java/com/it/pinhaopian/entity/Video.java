package com.it.pinhaopian.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
@TableName("videos")
public class Video {
    @TableId(type = IdType.AUTO)
    private Long videoId;

    private String title;
    private String description;
    private String coverUrl;
    private BigDecimal duration;
    private Integer categoryId;
    private Long authorId;
    private Integer status;
    private Integer isOriginal;
    private Long viewCount;
    private Integer likeCount;
    private Integer dislikeCount;

    private Integer commentCount;

    private Date publishTime;

    private Date createdAt;

    private Date updatedAt;

    // 移除空的setId方法，因为已经有videoId字段
}