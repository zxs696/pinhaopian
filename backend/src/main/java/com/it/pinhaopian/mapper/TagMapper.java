package com.it.pinhaopian.mapper;

import com.it.pinhaopian.entity.Tag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TagMapper {
    Tag findById(@Param("tagId") Long tagId);
    Tag findByName(@Param("name") String name);
    List<Tag> findAll();
    List<Tag> findByVideoId(@Param("videoId") Long videoId);
    int insert(Tag tag);
    int update(Tag tag);
    int delete(@Param("tagId") Long tagId);
    int incrementUsageCount(@Param("tagId") Long tagId);
    int decrementUsageCount(@Param("tagId") Long tagId);
    int addVideoTag(@Param("videoId") Long videoId, @Param("tagId") Long tagId);
    int removeVideoTag(@Param("videoId") Long videoId, @Param("tagId") Long tagId);
}