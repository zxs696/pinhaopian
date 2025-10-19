package com.it.pinhaopian.entity;

import lombok.Data;

import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Data
@Entity
@Table(name = "video_files")
public class VideoFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Long fileId;

    @Column(name = "video_id", nullable = false)
    private Long videoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "quality", nullable = false)
    private VideoQuality quality;

    @Column(name = "file_url", nullable = false, length = 255)
    private String fileUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "format", length = 20)
    private String format;

    @Column(name = "duration", precision = 10, scale = 2)
    private BigDecimal duration;

    @Column(name = "created_at", updatable = false)
    private Date createdAt;
    
    public enum VideoQuality {
        _360p, _480p, _720p, _1080p, _4K
    }
}