package com.it.pinhaopian.controller;

import com.it.pinhaopian.entity.Comment;
import com.it.pinhaopian.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/{commentId}")
    public ResponseEntity<Comment> getCommentById(@PathVariable Long commentId) {
        Optional<Comment> commentOpt = commentService.findById(commentId);
        if (commentOpt.isPresent()) {
            return ResponseEntity.ok(commentOpt.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/video/{videoId}")
    public ResponseEntity<List<Comment>> getCommentsByVideoId(@PathVariable Long videoId) {
        List<Comment> comments = commentService.getCommentsByVideoId(videoId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<Comment>> getCommentsByParentId(@PathVariable Long parentId) {
        List<Comment> comments = commentService.getCommentsByParentId(parentId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Comment>> getCommentsByUserId(@PathVariable Long userId) {
        List<Comment> comments = commentService.getCommentsByUserId(userId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/video/{videoId}/with-replies")
    public ResponseEntity<List<Comment>> getCommentsWithReplies(@PathVariable Long videoId) {
        List<Comment> comments = commentService.getCommentsWithReplies(videoId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<Comment> addComment(@RequestBody Comment comment) {
        Comment savedComment = commentService.save(comment);
        if (savedComment != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long commentId, @RequestBody Comment comment) {
        comment.setCommentId(commentId);
        Comment updatedComment = commentService.save(comment);
        if (updatedComment != null) {
            return ResponseEntity.ok(updatedComment);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        try {
            commentService.deleteById(commentId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<Void> incrementLikeCount(@PathVariable Long commentId) {
        commentService.incrementLikeCount(commentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{commentId}/dislike")
    public ResponseEntity<Void> incrementDislikeCount(@PathVariable Long commentId) {
        commentService.incrementDislikeCount(commentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/video/{videoId}/count")
    public ResponseEntity<Integer> getCommentCountByVideoId(@PathVariable Long videoId) {
        int count = commentService.getCommentCountByVideoId(videoId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/video/{videoId}/popular")
    public ResponseEntity<List<Comment>> getPopularCommentsByVideoId(@PathVariable Long videoId, @RequestParam(defaultValue = "5") int limit) {
        List<Comment> comments = commentService.getPopularCommentsByVideoId(videoId, limit);
        return ResponseEntity.ok(comments);
    }
}