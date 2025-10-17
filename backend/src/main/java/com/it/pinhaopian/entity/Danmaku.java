package com.it.pinhaopian.entity;

import lombok.Data;

import javax.persistence.*;
import java.util.Date;

@Data
@Entity
@Table(name = "danmaku")
public class Danmaku {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "danmaku_id")
    private Long danmakuId;

    @Column(name = "video_id", nullable = false)
    private Long videoId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "content", nullable = false, length = 200)
    private String content;

    @Column(name = "time_point", nullable = false)
    private Integer timePoint;

    @Column(name = "color", length = 10)
    private String color;

    @Column(name = "type", columnDefinition = "tinyint default 0")
    private Integer type;

    @Column(name = "font_size", columnDefinition = "tinyint default 16")
    private Integer fontSize;

    @Column(name = "status", columnDefinition = "tinyint default 1")
    private Integer status;

    @Column(name = "created_at", updatable = false)
    private Date createdAt;
}