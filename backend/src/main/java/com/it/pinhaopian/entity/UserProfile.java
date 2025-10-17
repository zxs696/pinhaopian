package com.it.pinhaopian.entity;

import lombok.Data;

import javax.persistence.*;

@Data
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "bio", columnDefinition = "text")
    private String bio;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "privacy_settings", columnDefinition = "json")
    private String privacySettings;
}