package com.it.pinhaopian.mapper;

import com.it.pinhaopian.entity.Comment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommentMapper {
    Comment findById(@Param("commentId") Long commentId);
    List<Comment> findByVideoId(@Param("videoId") Long videoId);
    List<Comment> findByParentId(@Param("parentId") Long parentId);
    List<Comment> findByUserId(@Param("userId") Long userId);
    int insert(Comment comment);
    int update(Comment comment);
    int delete(@Param("commentId") Long commentId);
    int incrementLikeCount(@Param("commentId") Long commentId);
    int incrementDislikeCount(@Param("commentId") Long commentId);
    List<Comment> getCommentsWithReplies(@Param("videoId") Long videoId);
}