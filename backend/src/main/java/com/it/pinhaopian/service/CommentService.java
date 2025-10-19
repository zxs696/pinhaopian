package com.it.pinhaopian.service;

import com.it.pinhaopian.entity.Comment;

import java.util.List;

public interface CommentService {
    Comment getCommentById(Long commentId);
    List<Comment> getCommentsByVideoId(Long videoId);
    List<Comment> getCommentsByParentId(Long parentId);
    List<Comment> getCommentsByUserId(Long userId);
    List<Comment> getCommentsWithReplies(Long videoId);
    boolean addComment(Comment comment);
    boolean updateComment(Comment comment);
    boolean deleteComment(Long commentId);
    boolean incrementLikeCount(Long commentId);
    boolean incrementDislikeCount(Long commentId);
    int getCommentCountByVideoId(Long videoId);
    List<Comment> getPopularCommentsByVideoId(Long videoId, int limit);
}