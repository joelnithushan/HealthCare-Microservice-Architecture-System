package com.healthcare.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public boolean sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("noreply@healthcare-platform.com");

            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            return false;
        }
    }
}
