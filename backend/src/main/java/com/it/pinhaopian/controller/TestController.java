package com.it.pinhaopian.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.it.pinhaopian.common.PageRequest;
import com.it.pinhaopian.entity.Video;
import com.it.pinhaopian.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 测试Controller，用于验证MyBatis Plus分页功能
 */
@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private VideoService videoService;

    /**
     * 测试分页查询
     */
    @GetMapping("/videos/page")
    public Page<Video> testVideoPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        
        PageRequest pageRequest = new PageRequest();
        pageRequest.setPage(page);
        pageRequest.setPageSize(pageSize);
        
        return videoService.findAll(pageRequest);
    }
}