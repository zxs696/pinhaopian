package com.it.pinhaopian.controller;

import com.it.pinhaopian.entity.Video;
import com.it.pinhaopian.entity.VideoFile;
import com.it.pinhaopian.entity.Category;
import com.it.pinhaopian.entity.Tag;
import com.it.pinhaopian.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/videos")
public class VideoController {

    @Autowired
    private VideoService videoService;

    @GetMapping("/{videoId}")
    public ResponseEntity<Video> getVideoById(@PathVariable Long videoId) {
        Optional<Video> videoOpt = videoService.findById(videoId);
        if (videoOpt.isPresent()) {
            return ResponseEntity.ok(videoOpt.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Video>> getVideosByUserId(@PathVariable Long userId) {
        List<Video> videos = videoService.getVideosByUserId(userId);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Video>> getVideosByCategoryId(@PathVariable Long categoryId) {
        List<Video> videos = videoService.getVideosByCategoryId(categoryId);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/tag/{tagId}")
    public ResponseEntity<List<Video>> getVideosByTagId(@PathVariable Long tagId) {
        List<Video> videos = videoService.getVideosByTagId(tagId);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Video>> searchVideos(@RequestParam String keyword) {
        List<Video> videos = videoService.searchVideos(keyword);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<Video>> getPopularVideos(@RequestParam(defaultValue = "10") int limit) {
        List<Video> videos = videoService.getPopularVideos(limit);
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/newest")
    public ResponseEntity<List<Video>> getNewestVideos(@RequestParam(defaultValue = "10") int limit) {
        List<Video> videos = videoService.getNewestVideos(limit);
        return ResponseEntity.ok(videos);
    }

    @PostMapping
    public ResponseEntity<Video> addVideo(@RequestBody Video video) {
        Video savedVideo = videoService.save(video);
        if (savedVideo != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(savedVideo);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{videoId}")
    public ResponseEntity<Video> updateVideo(@PathVariable Long videoId, @RequestBody Video video) {
        video.setId(videoId);
        Video updatedVideo = videoService.save(video);
        if (updatedVideo != null) {
            return ResponseEntity.ok(updatedVideo);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{videoId}")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long videoId) {
        try {
            videoService.deleteById(videoId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{videoId}/files")
    public ResponseEntity<VideoFile> addVideoFile(@PathVariable Long videoId, @RequestBody VideoFile videoFile) {
        videoFile.setVideoId(videoId);
        boolean success = videoService.addVideoFile(videoFile);
        if (success) {
            return ResponseEntity.status(HttpStatus.CREATED).body(videoFile);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{videoId}/files")
    public ResponseEntity<List<VideoFile>> getVideoFilesByVideoId(@PathVariable Long videoId) {
        List<VideoFile> videoFiles = videoService.getVideoFilesByVideoId(videoId);
        return ResponseEntity.ok(videoFiles);
    }

    @PostMapping("/{videoId}/categories/{categoryId}")
    public ResponseEntity<Void> addVideoCategory(@PathVariable Long videoId, @PathVariable Long categoryId) {
        boolean success = videoService.addVideoCategory(videoId, categoryId);
        if (success) {
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{videoId}/categories/{categoryId}")
    public ResponseEntity<Void> removeVideoCategory(@PathVariable Long videoId, @PathVariable Long categoryId) {
        boolean success = videoService.removeVideoCategory(videoId, categoryId);
        if (success) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{videoId}/categories")
    public ResponseEntity<List<Category>> getVideoCategories(@PathVariable Long videoId) {
        List<Category> categories = videoService.getVideoCategories(videoId);
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/{videoId}/tags/{tagId}")
    public ResponseEntity<Void> addVideoTag(@PathVariable Long videoId, @PathVariable Long tagId) {
        boolean success = videoService.addVideoTag(videoId, tagId);
        if (success) {
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{videoId}/tags/{tagId}")
    public ResponseEntity<Void> removeVideoTag(@PathVariable Long videoId, @PathVariable Long tagId) {
        boolean success = videoService.removeVideoTag(videoId, tagId);
        if (success) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{videoId}/tags")
    public ResponseEntity<List<Tag>> getVideoTags(@PathVariable Long videoId) {
        List<Tag> tags = videoService.getVideoTags(videoId);
        return ResponseEntity.ok(tags);
    }

    @PostMapping("/{videoId}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Long videoId) {
        videoService.incrementViewCount(videoId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{videoId}/like")
    public ResponseEntity<Void> incrementLikeCount(@PathVariable Long videoId) {
        videoService.incrementLikeCount(videoId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{videoId}/dislike")
    public ResponseEntity<Void> incrementDislikeCount(@PathVariable Long videoId) {
        videoService.incrementDislikeCount(videoId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{videoId}/stats")
    public ResponseEntity<Map<String, Object>> getVideoStats(@PathVariable Long videoId) {
        Map<String, Object> stats = videoService.getVideoStats(videoId);
        if (stats != null) {
            return ResponseEntity.ok(stats);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}