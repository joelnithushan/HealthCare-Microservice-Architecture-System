package com.healthcare.notificationservice.repo;

import com.healthcare.notificationservice.model.Notification;
import com.healthcare.notificationservice.model.NotificationStatus;
import com.healthcare.notificationservice.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status);

    List<Notification> findByUserIdAndType(Long userId, NotificationType type);
}
