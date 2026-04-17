package com.healthcare.userservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private static final String FROM_NAME = "Clinexa Healthcare";
    private static final String FROM_EMAIL = "stylerfree29@gmail.com";
    private static final String LOGO_URL = "https://i.postimg.cc/85zM6sZ3/clinexa-logo.png"; // Placeholder for professionally hosted logo

    /**
     * Sends a themed approval confirmation email to doctors.
     */
    public void sendApprovalEmail(String toEmail, String name) {
        String subject = "Clinexa — Your Profile has been Verified!";
        String html = buildThemedHtml(
            "Account Verified",
            "Welcome to the Clinexa Professional Network",
            "<p style='color:#64748b;font-size:16px;line-height:1.6;margin:0 0 20px;'>Hello Dr. <strong>" + name + "</strong>,</p>"
            + "<p style='color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px;'>We are pleased to inform you that your medical credentials have been successfully reviewed and verified by our administration team. Your professional profile is now active on the Clinexa platform.</p>"
            + "<div style='text-align:center;margin:32px 0;'>"
            + "<a href='http://localhost:3000/login' style='display:inline-block;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;'>Access Your Dashboard</a>"
            + "</div>"
            + "<p style='color:#64748b;font-size:14px;line-height:1.6;margin:0;'>You can now start accepting appointments, managing patient records, and using our telemedicine features.</p>"
        );
        sendHtmlEmail(toEmail, subject, html);
    }

    /**
     * Sends a themed OTP verification email.
     */
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Clinexa — Verify Your Email Address";
        String html = buildThemedHtml(
            "Verify Your Email",
            "One step closer to your health journey",
            "<p style='color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px;'>Use the verification code below to complete your Clinexa account registration. For security reasons, this code will expire in <strong>5 minutes</strong>.</p>"
            + "<div style='background:#f8fafc;border:2px dashed #0ea5e9;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;'>"
            + "<p style='color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;font-weight:600;'>Your Verification Code</p>"
            + "<p style='color:#0ea5e9;font-size:36px;font-weight:700;letter-spacing:8px;margin:0;font-family:monospace;'>" + otp + "</p>"
            + "</div>"
            + "<p style='color:#94a3b8;font-size:13px;line-height:1.5;margin:0;'>If you did not request this code, please ignore this email.</p>"
        );
        sendHtmlEmail(toEmail, subject, html);
    }

    /**
     * Sends a themed password reset email with a clickable link.
     */
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        String subject = "Clinexa — Password Reset Request";
        String html = buildThemedHtml(
            "Reset Your Password",
            "Security Update for Your Account",
            "<p style='color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px;'>We received a request to reset your Clinexa account password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.</p>"
            + "<div style='text-align:center;margin:0 0 32px;'>"
            + "<a href='" + resetLink + "' style='display:inline-block;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;'>Reset Password</a>"
            + "</div>"
            + "<p style='color:#94a3b8;font-size:13px;line-height:1.5;margin:0 0 12px;'>If the button doesn't work, copy and paste this link into your browser:</p>"
            + "<p style='color:#0ea5e9;font-size:12px;word-break:break-all;margin:0;background:#f8fafc;padding:12px;border-radius:8px;'>" + resetLink + "</p>"
        );
        sendHtmlEmail(toEmail, subject, html);
    }

    private String buildThemedHtml(String title, String subtitle, String content) {
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
            + "<h2 style='color:#0f172a;margin:0 0 16px;font-size:24px;font-weight:700;'>" + title + "</h2>"
            + content
            + "<div style='margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;'>"
            + "<p style='color:#94a3b8;font-size:14px;margin:0;'>Best regards,<br><strong>The Clinexa Team</strong></p>"
            + "</div>"
            + "</div>"
            // Footer
            + "<div style='background:#f8fafc;padding:32px 40px;text-align:center;border-top:1px solid #e2e8f0;'>"
            + "<p style='color:#64748b;font-size:12px;margin:0 0 8px;'>&copy; 2026 Clinexa Healthcare Ecosystem. All rights reserved.</p>"
            + "<p style='color:#94a3b8;font-size:11px;margin:0;'>You received this email because you are a registered user of Clinexa.</p>"
            + "</div>"
            + "</div></body></html>";
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (mailSender == null) {
            System.out.println("SMTP not configured. Email to " + to + " with subject: " + subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_EMAIL, FROM_NAME);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("Themed email sent successfully to: " + to);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            System.out.println("Failed to send email to " + to + ": " + e.getMessage());
            throw new RuntimeException("Failed to send email. Please try again later.");
        }
    }
}
