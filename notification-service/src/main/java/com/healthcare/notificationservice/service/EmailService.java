package com.healthcare.notificationservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private static final String FROM_NAME = "Clinexa Notifications";
    private static final String FROM_EMAIL = "stylerfree29@gmail.com";

    public boolean sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(FROM_EMAIL, FROM_NAME);
            helper.setTo(to);
            helper.setSubject(subject);
            
            // Wrap the notification body in our premium system theme
            String themedHtml = buildThemedHtml(subject, "Platform Notification", body);
            helper.setText(themedHtml, true);

            mailSender.send(message);
            System.out.println("Themed Notification sent successfully to: " + to);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send themed notification to " + to + ": " + e.getMessage());
            return false;
        }
    }

    private String buildThemedHtml(String title, String subtitle, String content) {
        // Ensuring total platform consistency with the same high-end template used in User Service
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
            + "<body style='margin:0;padding:0;background-color:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;'>"
            + "<div style='max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);'>"
            // Header with Logo
            + "<div style='background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:40px;text-align:center;'>"
            + "<div style='display:inline-block;padding:12px;background:rgba(255,255,255,0.15);border-radius:12px;margin-bottom:16px;'>"
            + "<svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg' style='display:block;'>"
            + "<rect width='40' height='40' rx='8' fill='white'/>"
            + "<path d='M20 10V30M10 20H30' stroke='#0ea5e9' stroke-width='4' stroke-linecap='round'/>"
            + "</svg>"
            + "</div>"
            + "<h1 style='color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;'>Clinexa</h1>"
            + "<p style='color:rgba(255,255,255,0.9);margin:4px 0 0;font-size:14px;font-weight:500;'>" + subtitle + "</p>"
            + "</div>"
            // Body Content
            + "<div style='padding:48px 40px;'>"
            + "<h2 style='color:#0f172a;margin:0 0 16px;font-size:22px;font-weight:700;'>" + title + "</h2>"
            + "<div style='color:#64748b;font-size:15px;line-height:1.6;'>" + content + "</div>"
            + "<div style='margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;'>"
            + "<p style='color:#94a3b8;font-size:14px;margin:0;'>Best regards,<br><strong>The Clinexa Notifications Team</strong></p>"
            + "</div>"
            + "</div>"
            // Footer
            + "<div style='background:#f8fafc;padding:32px 40px;text-align:center;border-top:1px solid #e2e8f0;'>"
            + "<p style='color:#64748b;font-size:12px;margin:0 0 8px;'>&copy; 2026 Clinexa Healthcare Ecosystem. All rights reserved.</p>"
            + "<p style='color:#94a3b8;font-size:11px;margin:0;'>You received this email from our automated notification system.</p>"
            + "</div>"
            + "</div></body></html>";
    }
}
