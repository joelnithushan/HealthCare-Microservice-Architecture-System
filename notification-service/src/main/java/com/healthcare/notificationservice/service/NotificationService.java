package com.healthcare.notificationservice.service;

import com.healthcare.notificationservice.dto.NotificationRequest;
import com.healthcare.notificationservice.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {

    NotificationResponse createNotification(NotificationRequest request);

    List<NotificationResponse> getNotificationsByUser(Long userId);

    NotificationResponse markNotificationAsRead(Long id);

    void deleteNotification(Long id);
}
