package com.it.pinhaopian.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.it.pinhaopian.annotation.AuditLog;
import com.it.pinhaopian.annotation.RequiresRole;
import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.entity.UserProfile;
import com.it.pinhaopian.entity.Role;
import com.it.pinhaopian.service.UserService;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiresRole("ADMIN")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    @RequiresPermissions("API:USER:LIST")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/username/{username}")
    @RequiresPermissions("API:USER:LIST")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/email/{email}")
    @RequiresPermissions("API:USER:LIST")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    @RequiresPermissions("API:USER:LIST")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }

    /**
     * 分页查询用户列表
     */
    @GetMapping("/page")
    @RequiresPermissions("API:USER:LIST")
    public ResponseEntity<Page<User>> findUsersPage(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Integer status) {
        
        Page<User> page = new Page<>(current, size);
        Page<User> result = userService.findUsersPage(page, username, email, status);
        
        return ResponseEntity.ok(result);
    }



    @PutMapping("/{userId}")
    @AuditLog(value = "更新用户", operationType = AuditLog.OperationType.UPDATE)
    @RequiresPermissions("API:USER:UPDATE")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @RequestBody User user) {
        user.setUserId(userId);
        User updatedUser = userService.save(user);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{userId}")
    @AuditLog(value = "删除用户", operationType = AuditLog.OperationType.DELETE)
    @RequiresPermissions("API:USER:DELETE")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteById(userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{userId}/profile")
    @RequiresPermissions("API:USER:LIST")
    public ResponseEntity<UserProfile> getUserProfile(@PathVariable Long userId) {
        UserProfile profile = userService.getUserProfile(userId);
        if (profile != null) {
            return ResponseEntity.ok(profile);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{userId}/profile")
    @AuditLog(value = "更新用户资料", operationType = AuditLog.OperationType.UPDATE)
    @RequiresPermissions("API:USER:UPDATE")
    public ResponseEntity<UserProfile> updateUserProfile(@PathVariable Long userId, @RequestBody UserProfile profile) {
        profile.setUserId(userId);
        boolean success = userService.updateUserProfile(profile);
        if (success) {
            return ResponseEntity.ok(profile);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{userId}/password")
    @AuditLog(value = "修改用户密码", operationType = AuditLog.OperationType.UPDATE)
    @RequiresPermissions("API:USER:UPDATE")
    public ResponseEntity<Void> changePassword(@PathVariable Long userId, @RequestBody PasswordChangeRequest request) {
        boolean success = userService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
        if (success) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).header("Error-Message", "原密码错误").build();
        }
    }

    // 内部静态类用于密码修改请求
    static class PasswordChangeRequest {
        private String oldPassword;
        private String newPassword;

        // getters and setters
        public String getOldPassword() {
            return oldPassword;
        }

        public void setOldPassword(String oldPassword) {
            this.oldPassword = oldPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
    
    /**
     * 分配用户角色
     */
    @PostMapping("/{userId}/roles")
    @AuditLog(value = "分配用户角色", operationType = AuditLog.OperationType.UPDATE)
    @RequiresPermissions("API:USER:UPDATE")
    public ResponseEntity<Void> assignRoles(@PathVariable Long userId, @RequestBody List<Long> roleIds) {
        // 检查用户是否存在
        Optional<User> userOpt = userService.findById(userId);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        boolean success = userService.assignRoles(userId, roleIds);
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 获取用户角色列表
     */
    @GetMapping("/{userId}/roles")
    @RequiresPermissions("API:USER:LIST")
    public ResponseEntity<List<Role>> getUserRoles(@PathVariable Long userId) {
        // 检查用户是否存在
        Optional<User> userOpt = userService.findById(userId);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Role> roles = userService.getUserRoles(userId);
        return ResponseEntity.ok(roles);
    }
    
    /**
     * 获取用户角色ID列表
     */
    @GetMapping("/{userId}/roleIds")
    @RequiresPermissions("API:USER:LIST")
    public ResponseEntity<List<Long>> getUserRoleIds(@PathVariable Long userId) {
        // 检查用户是否存在
        Optional<User> userOpt = userService.findById(userId);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Long> roleIds = userService.getUserRoleIds(userId);
        return ResponseEntity.ok(roleIds);
    }
    
    /**
     * 重置用户密码
     */
    @PostMapping("/{userId}/reset-password")
    @AuditLog(value = "重置用户密码", operationType = AuditLog.OperationType.UPDATE)
    @RequiresPermissions("API:USER:UPDATE")
    public ResponseEntity<Void> resetPassword(@PathVariable Long userId, @RequestParam String newPassword) {
        // 检查用户是否存在
        Optional<User> userOpt = userService.findById(userId);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        boolean success = userService.resetPassword(userId, newPassword);
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 启用/禁用用户
     */
    @PostMapping("/{userId}/status")
    @AuditLog(value = "启用/禁用用户", operationType = AuditLog.OperationType.UPDATE)
    @RequiresPermissions("API:USER:UPDATE")
    public ResponseEntity<Void> updateUserStatus(@PathVariable Long userId, @RequestParam Integer status) {
        // 检查用户是否存在
        Optional<User> userOpt = userService.findById(userId);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        boolean success = userService.updateUserStatus(userId, status);
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}