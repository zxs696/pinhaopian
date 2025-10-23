package com.it.pinhaopian.service;

import com.it.pinhaopian.entity.Video;
import com.it.pinhaopian.entity.VideoFile;
import com.it.pinhaopian.entity.Category;
import com.it.pinhaopian.entity.Tag;

import java.util.List;
import java.util.Map;

/**
 * 视频服务接口
 */
public interface VideoService extends BaseService<Video, Long> {
    
    /**
     * 根据用户ID获取视频列表
     * @param userId 用户ID
     * @return 视频列表
     */
    List<Video> getVideosByUserId(Long userId);
    
    /**
     * 根据分类ID获取视频列表
     * @param categoryId 分类ID
     * @return 视频列表
     */
    List<Video> getVideosByCategoryId(Long categoryId);
    
    /**
     * 根据标签ID获取视频列表
     * @param tagId 标签ID
     * @return 视频列表
     */
    List<Video> getVideosByTagId(Long tagId);
    
    /**
     * 搜索视频
     * @param keyword 搜索关键词
     * @return 视频列表
     */
    List<Video> searchVideos(String keyword);
    
    /**
     * 获取热门视频
     * @param limit 限制数量
     * @return 视频列表
     */
    List<Video> getPopularVideos(int limit);
    
    /**
     * 获取最新视频
     * @param limit 限制数量
     * @return 视频列表
     */
    List<Video> getNewestVideos(int limit);
    
    /**
     * 添加视频文件
     * @param videoFile 视频文件
     * @return 是否成功
     */
    boolean addVideoFile(VideoFile videoFile);
    
    /**
     * 根据视频ID获取主视频文件
     * @param videoId 视频ID
     * @return 视频文件
     */
    VideoFile getVideoFileByVideoId(Long videoId);
    
    /**
     * 根据视频ID获取所有视频文件
     * @param videoId 视频ID
     * @return 视频文件列表
     */
    List<VideoFile> getVideoFilesByVideoId(Long videoId);
    
    /**
     * 更新视频文件
     * @param videoFile 视频文件
     * @return 是否成功
     */
    boolean updateVideoFile(VideoFile videoFile);
    
    /**
     * 删除视频文件
     * @param videoFileId 视频文件ID
     * @return 是否成功
     */
    boolean deleteVideoFile(Long videoFileId);
    
    /**
     * 添加视频分类关联
     * @param videoId 视频ID
     * @param categoryId 分类ID
     * @return 是否成功
     */
    boolean addVideoCategory(Long videoId, Long categoryId);
    
    /**
     * 移除视频分类关联
     * @param videoId 视频ID
     * @param categoryId 分类ID
     * @return 是否成功
     */
    boolean removeVideoCategory(Long videoId, Long categoryId);
    
    /**
     * 获取视频的分类列表
     * @param videoId 视频ID
     * @return 分类列表
     */
    List<Category> getVideoCategories(Long videoId);
    
    /**
     * 添加视频标签关联
     * @param videoId 视频ID
     * @param tagId 标签ID
     * @return 是否成功
     */
    boolean addVideoTag(Long videoId, Long tagId);
    
    /**
     * 移除视频标签关联
     * @param videoId 视频ID
     * @param tagId 标签ID
     * @return 是否成功
     */
    boolean removeVideoTag(Long videoId, Long tagId);
    
    /**
     * 获取视频的标签列表
     * @param videoId 视频ID
     * @return 标签列表
     */
    List<Tag> getVideoTags(Long videoId);
    
    /**
     * 增加视频观看次数
     * @param videoId 视频ID
     * @return 是否成功
     */
    boolean incrementViewCount(Long videoId);
    
    /**
     * 增加视频点赞次数
     * @param videoId 视频ID
     * @return 是否成功
     */
    boolean incrementLikeCount(Long videoId);
    
    /**
     * 增加视频点踩次数
     * @param videoId 视频ID
     * @return 是否成功
     */
    boolean incrementDislikeCount(Long videoId);
    
    /**
     * 获取视频统计信息
     * @param videoId 视频ID
     * @return 统计信息
     */
    Map<String, Object> getVideoStats(Long videoId);
}