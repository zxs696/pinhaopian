package com.it.pinhaopian.entity;

import lombok.Data;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.math.BigDecimal;
import java.util.Date;

@Data
@TableName("video_files")
public class VideoFile {
    @TableId(type = IdType.AUTO, value = "file_id")
    private Long fileId;

    private Long videoId;
    private VideoQuality quality;
    private String fileUrl;
    private Long fileSize;
    private String format;
    private BigDecimal duration;
    private Date createdAt;
    
    public enum VideoQuality {
        _360p, _480p, _720p, _1080p, _4K
    }
}