package com.it.pinhaopian.entity;

import lombok.Data;

import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Data
@Entity
@Table(name = "videos")
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "video_id")
    private Long videoId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "cover_url", length = 255)
    private String coverUrl;

    @Column(name = "duration", nullable = false, precision = 10, scale = 2)
    private BigDecimal duration;

    @Column(name = "category_id")
    private Integer categoryId;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(name = "status", columnDefinition = "tinyint default 0")
    private Integer status;

    @Column(name = "is_original", columnDefinition = "tinyint default 1")
    private Integer isOriginal;

    @Column(name = "view_count", columnDefinition = "bigint default 0")
    private Long viewCount;

    @Column(name = "like_count", columnDefinition = "int default 0")
    private Integer likeCount;

    @Column(name = "dislike_count", columnDefinition = "int default 0")
    private Integer dislikeCount;

    @Column(name = "comment_count", columnDefinition = "int default 0")
    private Integer commentCount;

    @Column(name = "publish_time")
    private Date publishTime;

    @Column(name = "created_at", updatable = false)
    private Date createdAt;

    @Column(name = "updated_at")
    private Date updatedAt;
}