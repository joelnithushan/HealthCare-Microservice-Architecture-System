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

    private static final String FROM_NAME = "Clinexa Healthcare";
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
        // Ensuring total platform consistency with Clinexa premium design language
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
            + "<body style='margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;'>"
            + "<div style='max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);border:1px solid #e2e8f0;'>"
            // Header with Modern Icon
            + "<div style='background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:48px 40px;text-align:center;'>"
            + "<div style='display:inline-block;padding:14px;background:rgba(255,255,255,0.2);border-radius:14px;margin-bottom:20px;'>"
            + "<svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' style='display:block;'>"
            + "<path d='M22 12h-4l-3 9L9 3l-3 9H2'></path>"
            + "</svg>"
            + "</div>"
            + "<h1 style='color:#ffffff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.02em;'>Clinexa</h1>"
            + "<p style='color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:15px;font-weight:500;'>" + subtitle + "</p>"
            + "</div>"
            // Body Content
            + "<div style='padding:48px 40px;'>"
            + "<h2 style='color:#1e293b;margin:0 0 20px;font-size:22px;font-weight:700;'>" + title + "</h2>"
            + "<div style='color:#475569;font-size:16px;line-height:1.7;'>" + content.replace("\n", "<br>") + "</div>"
            + "<div style='margin-top:48px;padding-top:24px;border-top:1px solid #f1f5f9;'>"
            + "<p style='color:#64748b;font-size:15px;margin:0;'>Warm regards,<br><strong style='color:#2563eb;'>Clinexa Care Team</strong></p>"
            + "</div>"
            + "</div>"
            // Footer
            + "<div style='background:#f1f5f9;padding:32px 40px;text-align:center;border-top:1px solid #e2e8f0;'>"
            + "<p style='color:#475569;font-size:13px;margin:0 0 8px;font-weight:600;'>&copy; 2026 Clinexa Healthcare Platform</p>"
            + "<p style='color:#64748b;font-size:11px;margin:0;'>You are receiving this automated email regarding your account activity. Please do not reply to this message.</p>"
            + "</div>"
            + "</div></body></html>";
    }
}
