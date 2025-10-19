package com.it.pinhaopian.entity;

import lombok.Data;

import javax.persistence.*;
import java.util.Date;

@Data
@Entity
@Table(name = "tags")
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long tagId;

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "usage_count", columnDefinition = "int default 0")
    private Integer usageCount;

    @Column(name = "created_at", updatable = false)
    private Date createdAt;
}