package com.it.pinhaopian.service;

import com.it.pinhaopian.entity.Video;
import com.it.pinhaopian.entity.VideoFile;
import com.it.pinhaopian.entity.Category;
import com.it.pinhaopian.entity.Tag;

import java.util.List;
import java.util.Map;

public interface VideoService {
    Video getVideoById(Long videoId);
    List<Video> getVideosByUserId(Long userId);
    List<Video> getVideosByCategoryId(Long categoryId);
    List<Video> getVideosByTagId(Long tagId);
    List<Video> searchVideos(String keyword);
    List<Video> getPopularVideos(int limit);
    List<Video> getNewestVideos(int limit);
    boolean addVideo(Video video);
    boolean updateVideo(Video video);
    boolean deleteVideo(Long videoId);
    boolean addVideoFile(VideoFile videoFile);
    VideoFile getVideoFileByVideoId(Long videoId);
    List<VideoFile> getVideoFilesByVideoId(Long videoId);
    boolean updateVideoFile(VideoFile videoFile);
    boolean deleteVideoFile(Long videoFileId);
    boolean addVideoCategory(Long videoId, Long categoryId);
    boolean removeVideoCategory(Long videoId, Long categoryId);
    List<Category> getVideoCategories(Long videoId);
    boolean addVideoTag(Long videoId, Long tagId);
    boolean removeVideoTag(Long videoId, Long tagId);
    List<Tag> getVideoTags(Long videoId);
    boolean incrementViewCount(Long videoId);
    boolean incrementLikeCount(Long videoId);
    boolean incrementDislikeCount(Long videoId);
    Map<String, Object> getVideoStats(Long videoId);
}