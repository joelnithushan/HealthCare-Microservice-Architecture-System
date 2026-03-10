package com.healthcare.userservice.service;

import com.healthcare.userservice.config.CustomUserDetails;
import com.healthcare.userservice.dto.AuthResponse;
import com.healthcare.userservice.dto.LoginRequest;
import com.healthcare.userservice.dto.RegisterRequest;
import com.healthcare.userservice.dto.UserRequest;
import com.healthcare.userservice.dto.UserResponse;
import com.healthcare.userservice.model.User;
import com.healthcare.userservice.repo.UserRepository;
import com.healthcare.userservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(
                new CustomUserDetails(savedUser),
                savedUser.getRole().name(),
                savedUser.getId());

        return new AuthResponse(token);
    }

    @Override
    public AuthResponse loginUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String token = jwtUtil.generateToken(
                userDetails,
                userDetails.getUser().getRole().name(),
                userDetails.getUser().getId());

        return new AuthResponse(token);
    }

    @Override
    public UserResponse createUser(UserRequest userRequest) {
        User user = new User();
        user.setName(userRequest.getName());
        user.setEmail(userRequest.getEmail());
        user.setRole(userRequest.getRole());
        user.setPassword(passwordEncoder.encode("default123"));

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return mapToResponse(user);
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest userRequest) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        existingUser.setName(userRequest.getName());
        existingUser.setEmail(userRequest.getEmail());
        existingUser.setRole(userRequest.getRole());

        User updatedUser = userRepository.save(existingUser);
        return mapToResponse(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        userRepository.delete(existingUser);
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        return response;
    }
}
