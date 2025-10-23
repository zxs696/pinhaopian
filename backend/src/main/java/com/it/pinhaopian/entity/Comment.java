package com.it.pinhaopian.entity;

import lombok.Data;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;

@Data
@TableName("comments")
public class Comment {
    @TableId(type = IdType.AUTO, value = "comment_id")
    private Long commentId;

    private Long videoId;
    private Long userId;
    private Long parentId;
    private String content;
    private Integer likeCount;
    private Integer dislikeCount;
    private Integer status;
    private Date createdAt;
}