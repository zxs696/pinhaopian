package com.it.pinhaopian.mapper;

import com.it.pinhaopian.entity.Video;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface VideoMapper {
    Video findById(@Param("videoId") Long videoId);
    List<Video> findByCategoryId(@Param("categoryId") Integer categoryId);
    List<Video> findByAuthorId(@Param("authorId") Long authorId);
    List<Video> findAll();
    List<Video> searchByTitle(@Param("keyword") String keyword);
    int insert(Video video);
    int update(Video video);
    int delete(@Param("videoId") Long videoId);
    int incrementViewCount(@Param("videoId") Long videoId);
    int incrementLikeCount(@Param("videoId") Long videoId);
    int incrementDislikeCount(@Param("videoId") Long videoId);
    int incrementCommentCount(@Param("videoId") Long videoId);
}