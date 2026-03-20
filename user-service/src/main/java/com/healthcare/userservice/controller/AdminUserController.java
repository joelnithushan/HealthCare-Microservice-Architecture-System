package com.healthcare.userservice.controller;

import com.healthcare.userservice.dto.UserResponse;
import com.healthcare.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/users")
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        List<UserResponse> allUsers = userService.getAllUsers();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", allUsers.size());
        stats.put("patients", allUsers.stream().filter(u -> u.getRole() != null && "PATIENT".equals(u.getRole().name())).count());
        stats.put("doctors", allUsers.stream().filter(u -> u.getRole() != null && "DOCTOR".equals(u.getRole().name())).count());
        stats.put("admins", allUsers.stream().filter(u -> u.getRole() != null && "ADMIN".equals(u.getRole().name())).count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable String role) {
        List<UserResponse> allUsers = userService.getAllUsers();
        List<UserResponse> filtered = allUsers.stream()
                .filter(u -> u.getRole() != null && role.equalsIgnoreCase(u.getRole().name()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
