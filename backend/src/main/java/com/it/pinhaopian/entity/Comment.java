package com.it.pinhaopian.entity;

import lombok.Data;

import javax.persistence.*;
import java.util.Date;

@Data
@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    @Column(name = "video_id", nullable = false)
    private Long videoId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "like_count", columnDefinition = "int default 0")
    private Integer likeCount;

    @Column(name = "dislike_count", columnDefinition = "int default 0")
    private Integer dislikeCount;

    @Column(name = "status", columnDefinition = "tinyint default 1")
    private Integer status;

    @Column(name = "created_at", updatable = false)
    private Date createdAt;

    public void setId(Long commentId) {
    }
}