package com.healthcare.notificationservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ws-api")
public class NotificationWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send/{userId}")
    public void sendStatusUpdate(@PathVariable Long userId, @RequestBody Map<String, Object> message) {
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, message);
    }
}
