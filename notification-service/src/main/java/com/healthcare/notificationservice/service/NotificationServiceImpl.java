package com.healthcare.notificationservice.service;

import com.healthcare.notificationservice.dto.NotificationRequest;
import com.healthcare.notificationservice.dto.NotificationResponse;
import com.healthcare.notificationservice.model.Notification;
import com.healthcare.notificationservice.model.NotificationStatus;
import com.healthcare.notificationservice.model.NotificationType;
import com.healthcare.notificationservice.repo.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setMessage(request.getMessage());
        notification.setType(NotificationType.valueOf(request.getType()));
        notification.setStatus(NotificationStatus.valueOf(request.getStatus()));

        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    @Override
    public List<NotificationResponse> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponse markNotificationAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        notification.setStatus(NotificationStatus.READ);
        Notification updated = notificationRepository.save(notification);
        return mapToResponse(updated);
    }

    @Override
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        notificationRepository.delete(notification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setUserId(notification.getUserId());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType().name());
        response.setStatus(notification.getStatus().name());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
