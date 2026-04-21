package com.healthcare.notificationservice.service;

import com.healthcare.notificationservice.dto.NotificationRequest;
import com.healthcare.notificationservice.dto.NotificationResponse;
import com.healthcare.notificationservice.exception.ResourceNotFoundException;
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

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Override
    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setMessage(request.getMessage());
        notification.setType(NotificationType.valueOf(request.getType()));
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setRecipientEmail(request.getRecipientEmail());
        notification.setRecipientPhone(request.getRecipientPhone());
        notification.setSubject(request.getSubject());

        // Send email or SMS based on notification type
        NotificationType type = notification.getType();
        if (type == NotificationType.EMAIL && request.getRecipientEmail() != null) {
            String subject = request.getSubject() != null ? request.getSubject() : "Healthcare Platform Notification";
            emailService.sendEmail(request.getRecipientEmail(), subject, request.getMessage());
        } else if (type == NotificationType.SMS && request.getRecipientPhone() != null) {
            smsService.sendSms(request.getRecipientPhone(), request.getMessage());
        }

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
    public NotificationResponse getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        return mapToResponse(notification);
    }

    @Override
    public NotificationResponse markNotificationAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        notification.setStatus(NotificationStatus.READ);
        Notification updated = notificationRepository.save(notification);
        return mapToResponse(updated);
    }

    @Override
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        notificationRepository.delete(notification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setUserId(notification.getUserId());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType().name());
        response.setStatus(notification.getStatus().name());
        response.setRecipientEmail(notification.getRecipientEmail());
        response.setRecipientPhone(notification.getRecipientPhone());
        response.setSubject(notification.getSubject());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
