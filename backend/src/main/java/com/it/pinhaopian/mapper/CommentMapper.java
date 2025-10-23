package com.it.pinhaopian.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.it.pinhaopian.entity.Comment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 评论数据访问接口
 */
@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
    List<Comment> getCommentsWithReplies(@Param("videoId") Long videoId);
    int incrementLikeCount(@Param("commentId") Long commentId);
    int incrementDislikeCount(@Param("commentId") Long commentId);
}