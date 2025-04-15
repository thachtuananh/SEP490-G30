package com.example.homecleanapi.services;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {
    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    private static final String FROM_PHONE = "+15392825449";

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    public String sendSms(String toPhone, String messageContent) {
        String formattedPhone = formatPhoneNumber(toPhone);

        Message message = Message.creator(
                new PhoneNumber(formattedPhone),
                new PhoneNumber(FROM_PHONE),
                messageContent
        ).create();
        return message.getSid();
    }

    private String formatPhoneNumber(String rawPhone) {
        // Loại bỏ dấu cách, dấu gạch, dấu chấm, v.v.
        String cleaned = rawPhone.replaceAll("[^0-9]", "");

        // Nếu bắt đầu bằng "0" và có 10 số, đổi thành "+84"
        if (cleaned.startsWith("0") && cleaned.length() == 10) {
            return "+84" + cleaned.substring(1);
        }

        // Nếu đã ở định dạng quốc tế (bắt đầu bằng 84 và đủ 11 số), thêm dấu +
        if (cleaned.startsWith("84") && cleaned.length() == 11) {
            return "+" + cleaned;
        }

        // Nếu bắt đầu bằng +84 thì giữ nguyên
        if (rawPhone.startsWith("+84")) {
            return rawPhone;
        }

        throw new IllegalArgumentException("Số điện thoại không hợp lệ: " + rawPhone);
    }
}
