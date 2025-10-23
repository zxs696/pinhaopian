package com.it.pinhaopian.entity;

import lombok.Data;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

@Data
@TableName("user_profiles")
public class UserProfile {
    @TableId(type = IdType.AUTO, value = "profile_id")
    private Long profileId;

    private Long userId;
    private String bio;
    private String location;
    private String website;
    private String privacySettings;
}