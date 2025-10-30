package com.it.pinhaopian.service.impl;

import com.it.pinhaopian.common.PageRequest;
import com.it.pinhaopian.entity.Comment;
import com.it.pinhaopian.mapper.CommentMapper;
import com.it.pinhaopian.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 评论服务实现类
 */
@Service
public class CommentServiceImpl extends BaseServiceImpl<Comment, Long> implements CommentService {

    @Autowired
    private CommentMapper commentMapper;

    /**
     * 由于使用MyBatis而非Spring Data JPA，这里返回一个空的Repository
     * 在实际方法中我们直接使用commentMapper
     */
    @Override
    protected BaseMapper<Comment> getMapper() {
        return commentMapper;
    }

    @Override
    public Optional<Comment> findById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(commentMapper.selectById(id));
    }

    @Override
    public List<Comment> findAll() {
        return commentMapper.selectList(null);
    }

    @Override
    public Page<Comment> findAll(PageRequest pageRequest) {
        // 使用MyBatis Plus分页查询
        Page<Comment> page = new Page<>(pageRequest.getPage(), pageRequest.getPageSize());
        return commentMapper.selectPage(page, null);
    }
    
    public Page<Comment> getCommentsByVideoId(Long videoId, int page, int size) {
        Page<Comment> commentPage = new Page<>(page, size);
        return commentMapper.selectPage(commentPage, Wrappers.<Comment>lambdaQuery().eq(Comment::getVideoId, videoId));
    }

    @Override
    public List<Comment> findAllById(Iterable<Long> ids) {
        if (ids == null) {
            return new ArrayList<>();
        }
        // 转换Iterable为List
        List<Long> idList = new ArrayList<>();
        ids.forEach(idList::add);
        return commentMapper.selectBatchIds(idList);
    }

    @Override
    public Comment save(Comment entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Comment entity cannot be null");
        }
        
        if (entity.getCommentId() == null) {
            // 新增评论
            entity.setCreatedAt(new Date());
            entity.setStatus(1); // 默认状态为正常
            entity.setLikeCount(0);
            entity.setDislikeCount(0);
            commentMapper.insert(entity);
        } else {
            // 更新评论
            commentMapper.updateById(entity);
        }
        return entity;
    }

    @Override
    public List<Comment> saveAll(Iterable<Comment> entities) {
        List<Comment> result = new ArrayList<>();
        entities.forEach(entity -> result.add(save(entity)));
        return result;
    }

    @Override
    public void deleteById(Long id) {
        if (id == null) {
            return;
        }
        // 先获取评论，然后将状态设置为删除（0）
        Optional<Comment> commentOpt = findById(id);
        commentOpt.ifPresent(comment -> {
            comment.setStatus(0);
            commentMapper.updateById(comment);
        });
    }

    @Override
    public boolean existsById(Long id) {
        return id != null && commentMapper.selectById(id) != null;
    }

    @Override
    public List<Comment> getCommentsByVideoId(Long videoId) {
        if (videoId == null) {
            return Collections.emptyList();
        }
        return commentMapper.selectList(Wrappers.<Comment>lambdaQuery().eq(Comment::getVideoId, videoId));
    }

    @Override
    public List<Comment> getCommentsByParentId(Long parentId) {
        if (parentId == null) {
            return Collections.emptyList();
        }
        return commentMapper.selectList(Wrappers.<Comment>lambdaQuery().eq(Comment::getParentId, parentId));
    }

    @Override
    public List<Comment> getCommentsByUserId(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        return commentMapper.selectList(Wrappers.<Comment>lambdaQuery().eq(Comment::getUserId, userId));
    }

    @Override
    public List<Comment> getCommentsWithReplies(Long videoId) {
        if (videoId == null) {
            return Collections.emptyList();
        }
        return commentMapper.getCommentsWithReplies(videoId);
    }

    @Override
    public boolean incrementLikeCount(Long commentId) {
        if (commentId == null) {
            return false;
        }
        return commentMapper.incrementLikeCount(commentId) > 0;
    }

    @Override
    public boolean incrementDislikeCount(Long commentId) {
        if (commentId == null) {
            return false;
        }
        return commentMapper.incrementDislikeCount(commentId) > 0;
    }

    @Override
    public int getCommentCountByVideoId(Long videoId) {
        if (videoId == null) {
            return 0;
        }
        List<Comment> comments = getCommentsByVideoId(videoId);
        return comments.size();
    }

    @Override
    public List<Comment> getPopularCommentsByVideoId(Long videoId, int limit) {
        if (videoId == null) {
            return Collections.emptyList();
        }
        List<Comment> comments = getCommentsByVideoId(videoId);
        // 按点赞数排序
        return comments.stream()
                .sorted((c1, c2) -> {
                    Integer like1 = c1.getLikeCount() != null ? c1.getLikeCount() : 0;
                    Integer like2 = c2.getLikeCount() != null ? c2.getLikeCount() : 0;
                    return like2 - like1;
                })
                .limit(limit)
                .collect(Collectors.toList());
    }
}