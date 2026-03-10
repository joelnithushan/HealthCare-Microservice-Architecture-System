package com.healthcare.userservice.service;

import com.healthcare.userservice.dto.AuthResponse;
import com.healthcare.userservice.dto.LoginRequest;
import com.healthcare.userservice.dto.RegisterRequest;
import com.healthcare.userservice.dto.UserRequest;
import com.healthcare.userservice.dto.UserResponse;

import java.util.List;

public interface UserService {
    AuthResponse registerUser(RegisterRequest request);

    AuthResponse loginUser(LoginRequest request);

    UserResponse createUser(UserRequest userRequest);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUser(Long id, UserRequest userRequest);

    void deleteUser(Long id);
}
