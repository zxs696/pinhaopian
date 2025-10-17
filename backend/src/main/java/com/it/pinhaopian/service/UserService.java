package com.it.pinhaopian.service;

import com.it.pinhaopian.entity.User;
import com.it.pinhaopian.entity.UserProfile;

import java.util.List;

public interface UserService {
    User getUserById(Long userId);
    User getUserByUsername(String username);
    User getUserByEmail(String email);
    List<User> getAllUsers();
    boolean registerUser(User user);
    boolean updateUser(User user);
    boolean deleteUser(Long userId);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    UserProfile getUserProfile(Long userId);
    boolean updateUserProfile(UserProfile profile);
    boolean changePassword(Long userId, String oldPassword, String newPassword);
    User login(String username, String password);
}