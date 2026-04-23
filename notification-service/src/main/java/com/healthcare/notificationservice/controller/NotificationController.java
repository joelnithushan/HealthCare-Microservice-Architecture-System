package com.healthcare.notificationservice.controller;

import com.healthcare.notificationservice.dto.NotificationRequest;
import com.healthcare.notificationservice.dto.NotificationResponse;
import com.healthcare.notificationservice.service.NotificationService;
import com.healthcare.notificationservice.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private HttpServletRequest httpServletRequest;

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(@RequestBody NotificationRequest request) {
        NotificationResponse created = notificationService.createNotification(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/send")
    public ResponseEntity<NotificationResponse> sendNotification(@RequestBody NotificationRequest request) {
        NotificationResponse sent = notificationService.createNotification(request);
        return new ResponseEntity<>(sent, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByUser(@PathVariable Long userId) {
        validateUserScope(userId);
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markNotificationAsRead(@PathVariable Long id) {
        NotificationResponse notification = notificationService.getNotificationById(id);
        validateUserScope(notification.getUserId());
        return ResponseEntity.ok(notificationService.markNotificationAsRead(id));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllNotificationsAsRead(@PathVariable Long userId) {
        validateUserScope(userId);
        notificationService.markAllNotificationsAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        NotificationResponse notification = notificationService.getNotificationById(id);
        validateUserScope(notification.getUserId());
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    private void validateUserScope(Long targetUserId) {
        String role = getCurrentRole();
        if ("ADMIN".equals(role)) {
            return;
        }

        Long currentUserId = getCurrentUserId();
        if (!targetUserId.equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to access another user's notifications.");
        }
    }

    private String getCurrentRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authentication context.");
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring(5))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Role claim is missing."));
    }

    private Long getCurrentUserId() {
        String authHeader = httpServletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization token is missing.");
        }

        try {
            return jwtUtil.extractUserId(authHeader.substring(7));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token.");
        }
    }
}
