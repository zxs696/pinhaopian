package com.it.pinhaopian.service;

import com.it.pinhaopian.entity.Comment;

import java.util.List;
import java.util.Optional;

/**
 * 评论服务接口
 */
public interface CommentService extends BaseService<Comment, Long> {
    
    /**
     * 根据视频ID获取评论列表
     * @param videoId 视频ID
     * @return 评论列表
     */
    List<Comment> getCommentsByVideoId(Long videoId);
    
    /**
     * 根据父评论ID获取子评论列表
     * @param parentId 父评论ID
     * @return 子评论列表
     */
    List<Comment> getCommentsByParentId(Long parentId);
    
    /**
     * 根据用户ID获取评论列表
     * @param userId 用户ID
     * @return 评论列表
     */
    List<Comment> getCommentsByUserId(Long userId);
    
    /**
     * 获取视频的评论及其回复
     * @param videoId 视频ID
     * @return 评论列表，包含回复
     */
    List<Comment> getCommentsWithReplies(Long videoId);
    
    /**
     * 增加评论点赞数
     * @param commentId 评论ID
     * @return 是否成功
     */
    boolean incrementLikeCount(Long commentId);
    
    /**
     * 增加评论点踩数
     * @param commentId 评论ID
     * @return 是否成功
     */
    boolean incrementDislikeCount(Long commentId);
    
    /**
     * 获取视频的评论数量
     * @param videoId 视频ID
     * @return 评论数量
     */
    int getCommentCountByVideoId(Long videoId);
    
    /**
     * 获取视频的热门评论
     * @param videoId 视频ID
     * @param limit 限制数量
     * @return 热门评论列表
     */
    List<Comment> getPopularCommentsByVideoId(Long videoId, int limit);
}