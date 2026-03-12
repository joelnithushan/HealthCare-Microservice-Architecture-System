package com.healthcare.notificationservice.dto;

public class NotificationRequest {

    private Long userId;
    private String message;
    private String type;
    private String status;

    public NotificationRequest() {
    }

    public NotificationRequest(Long userId, String message, String type, String status) {
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.status = status;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
