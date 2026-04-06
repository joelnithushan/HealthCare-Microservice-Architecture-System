package com.healthcare.notificationservice.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromPhoneNumber;

    private boolean twilioInitialized = false;

    @PostConstruct
    public void init() {
        try {
            if (accountSid != null && !accountSid.equals("your-account-sid")
                    && authToken != null && !authToken.equals("your-auth-token")) {
                Twilio.init(accountSid, authToken);
                twilioInitialized = true;
                System.out.println("Twilio SMS service initialized successfully");
            } else {
                System.out.println("Twilio not configured - SMS will be logged only");
            }
        } catch (Exception e) {
            System.err.println("Failed to initialize Twilio: " + e.getMessage());
        }
    }

    public boolean sendSms(String to, String messageBody) {
        if (!twilioInitialized) {
            System.out.println("[SMS LOG] To: " + to + " | Message: " + messageBody);
            return true; // Return true so notification is still saved
        }

        try {
            Message message = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(fromPhoneNumber),
                    messageBody
            ).create();

            System.out.println("SMS sent successfully. SID: " + message.getSid());
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send SMS to " + to + ": " + e.getMessage());
            return false;
        }
    }
}
