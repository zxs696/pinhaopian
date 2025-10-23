package com.it.pinhaopian.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.it.pinhaopian.entity.Video;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 视频Mapper接口
 */
@Mapper
public interface VideoMapper extends BaseMapper<Video> {
    // 保留自定义方法
    List<Video> findByCategoryId(@Param("categoryId") Integer categoryId);
    List<Video> findByAuthorId(@Param("authorId") Long authorId);
    List<Video> searchByTitle(@Param("keyword") String keyword);
    int incrementViewCount(@Param("videoId") Long videoId);
    int incrementLikeCount(@Param("videoId") Long videoId);
    int incrementDislikeCount(@Param("videoId") Long videoId);
    int incrementCommentCount(@Param("videoId") Long videoId);
}