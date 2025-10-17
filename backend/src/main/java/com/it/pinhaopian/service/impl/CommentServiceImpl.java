package com.it.pinhaopian.service.impl;

import com.it.pinhaopian.entity.Comment;
import com.it.pinhaopian.mapper.CommentMapper;
import com.it.pinhaopian.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentMapper commentMapper;

    @Override
    public Comment getCommentById(Long commentId) {
        return commentMapper.findById(commentId);
    }

    @Override
    public List<Comment> getCommentsByVideoId(Long videoId) {
        return commentMapper.findByVideoId(videoId);
    }

    @Override
    public List<Comment> getCommentsByParentId(Long parentId) {
        return commentMapper.findByParentId(parentId);
    }

    @Override
    public List<Comment> getCommentsByUserId(Long userId) {
        return commentMapper.findByUserId(userId);
    }

    @Override
    public List<Comment> getCommentsWithReplies(Long videoId) {
        return commentMapper.getCommentsWithReplies(videoId);
    }

    @Override
    public boolean addComment(Comment comment) {
        comment.setCreatedAt(new Date());
        comment.setUpdatedAt(new Date());
        comment.setLikeCount(0L);
        comment.setDislikeCount(0L);
        comment.setStatus(1); // 默认启用
        return commentMapper.insert(comment) > 0;
    }

    @Override
    public boolean updateComment(Comment comment) {
        comment.setUpdatedAt(new Date());
        return commentMapper.update(comment) > 0;
    }

    @Override
    public boolean deleteComment(Long commentId) {
        return commentMapper.delete(commentId) > 0;
    }

    @Override
    public boolean incrementLikeCount(Long commentId) {
        return commentMapper.incrementLikeCount(commentId) > 0;
    }

    @Override
    public boolean incrementDislikeCount(Long commentId) {
        return commentMapper.incrementDislikeCount(commentId) > 0;
    }

    @Override
    public int getCommentCountByVideoId(Long videoId) {
        List<Comment> comments = commentMapper.findByVideoId(videoId);
        return comments != null ? comments.size() : 0;
    }

    @Override
    public List<Comment> getPopularCommentsByVideoId(Long videoId, int limit) {
        // 这里简化实现，实际项目中可能需要在Mapper中添加对应的查询方法
        List<Comment> comments = commentMapper.findByVideoId(videoId);
        // 按点赞数排序并限制数量
        comments.sort((c1, c2) -> c2.getLikeCount().compareTo(c1.getLikeCount()));
        if (comments.size() > limit) {
            return comments.subList(0, limit);
        }
        return comments;
    }
}