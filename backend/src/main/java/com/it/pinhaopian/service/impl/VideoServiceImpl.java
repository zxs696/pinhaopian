package com.it.pinhaopian.service.impl;

import com.it.pinhaopian.entity.Video;
import com.it.pinhaopian.entity.VideoFile;
import com.it.pinhaopian.entity.Category;
import com.it.pinhaopian.entity.Tag;
import com.it.pinhaopian.mapper.VideoMapper;
import com.it.pinhaopian.mapper.VideoFileMapper;
import com.it.pinhaopian.mapper.CategoryMapper;
import com.it.pinhaopian.mapper.TagMapper;
import com.it.pinhaopian.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Service
public class VideoServiceImpl implements VideoService {

    @Autowired
    private VideoMapper videoMapper;

    @Autowired
    private VideoFileMapper videoFileMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TagMapper tagMapper;

    @Override
    public Video getVideoById(Long videoId) {
        return videoMapper.findById(videoId);
    }

    @Override
    public List<Video> getVideosByUserId(Long userId) {
        return videoMapper.findByUserId(userId);
    }

    @Override
    public List<Video> getVideosByCategoryId(Long categoryId) {
        return videoMapper.findByCategoryId(categoryId);
    }

    @Override
    public List<Video> getVideosByTagId(Long tagId) {
        return videoMapper.findByTagId(tagId);
    }

    @Override
    public List<Video> searchVideos(String keyword) {
        return videoMapper.search(keyword);
    }

    @Override
    public List<Video> getPopularVideos(int limit) {
        return videoMapper.findPopularVideos(limit);
    }

    @Override
    public List<Video> getNewestVideos(int limit) {
        return videoMapper.findNewestVideos(limit);
    }

    @Override
    public boolean addVideo(Video video) {
        video.setCreatedAt(new Date());
        video.setUpdatedAt(new Date());
        video.setViewCount(0L);
        video.setLikeCount(0L);
        video.setDislikeCount(0L);
        video.setStatus(1); // 默认启用
        return videoMapper.insert(video) > 0;
    }

    @Override
    public boolean updateVideo(Video video) {
        video.setUpdatedAt(new Date());
        return videoMapper.update(video) > 0;
    }

    @Override
    public boolean deleteVideo(Long videoId) {
        return videoMapper.delete(videoId) > 0;
    }

    @Override
    public boolean addVideoFile(VideoFile videoFile) {
        videoFile.setCreatedAt(new Date());
        videoFile.setUpdatedAt(new Date());
        return videoFileMapper.insert(videoFile) > 0;
    }

    @Override
    public VideoFile getVideoFileByVideoId(Long videoId) {
        return videoFileMapper.findByVideoId(videoId);
    }

    @Override
    public List<VideoFile> getVideoFilesByVideoId(Long videoId) {
        return videoFileMapper.findAllByVideoId(videoId);
    }

    @Override
    public boolean updateVideoFile(VideoFile videoFile) {
        videoFile.setUpdatedAt(new Date());
        return videoFileMapper.update(videoFile) > 0;
    }

    @Override
    public boolean deleteVideoFile(Long videoFileId) {
        return videoFileMapper.delete(videoFileId) > 0;
    }

    @Override
    public boolean addVideoCategory(Long videoId, Long categoryId) {
        return videoMapper.addCategory(videoId, categoryId) > 0;
    }

    @Override
    public boolean removeVideoCategory(Long videoId, Long categoryId) {
        return videoMapper.removeCategory(videoId, categoryId) > 0;
    }

    @Override
    public List<Category> getVideoCategories(Long videoId) {
        return categoryMapper.findByVideoId(videoId);
    }

    @Override
    public boolean addVideoTag(Long videoId, Long tagId) {
        return videoMapper.addTag(videoId, tagId) > 0;
    }

    @Override
    public boolean removeVideoTag(Long videoId, Long tagId) {
        return videoMapper.removeTag(videoId, tagId) > 0;
    }

    @Override
    public List<Tag> getVideoTags(Long videoId) {
        return tagMapper.findByVideoId(videoId);
    }

    @Override
    public boolean incrementViewCount(Long videoId) {
        return videoMapper.incrementViewCount(videoId) > 0;
    }

    @Override
    public boolean incrementLikeCount(Long videoId) {
        return videoMapper.incrementLikeCount(videoId) > 0;
    }

    @Override
    public boolean incrementDislikeCount(Long videoId) {
        return videoMapper.incrementDislikeCount(videoId) > 0;
    }

    @Override
    public Map<String, Object> getVideoStats(Long videoId) {
        Video video = videoMapper.findById(videoId);
        if (video == null) {
            return null;
        }
        Map<String, Object> stats = new HashMap<>();
        stats.put("viewCount", video.getViewCount());
        stats.put("likeCount", video.getLikeCount());
        stats.put("dislikeCount", video.getDislikeCount());
        stats.put("commentCount", videoMapper.getCommentCount(videoId));
        stats.put("shareCount", video.getShareCount() != null ? video.getShareCount() : 0L);
        return stats;
    }
}