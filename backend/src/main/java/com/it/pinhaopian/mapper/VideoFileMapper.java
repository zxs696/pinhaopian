package com.it.pinhaopian.mapper;

import com.it.pinhaopian.entity.VideoFile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface VideoFileMapper {
    VideoFile findById(@Param("fileId") Long fileId);
    List<VideoFile> findByVideoId(@Param("videoId") Long videoId);
    VideoFile findByVideoIdAndQuality(@Param("videoId") Long videoId, @Param("quality") VideoFile.VideoQuality quality);
    int insert(VideoFile videoFile);
    int update(VideoFile videoFile);
    int delete(@Param("fileId") Long fileId);
    int deleteByVideoId(@Param("videoId") Long videoId);
}