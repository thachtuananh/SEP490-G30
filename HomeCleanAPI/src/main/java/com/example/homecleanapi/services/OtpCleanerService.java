package com.example.homecleanapi.services;

import com.example.homecleanapi.models.OtpVerificationCleaner;
import com.example.homecleanapi.repositories.OtpVerificationCleanerRepository;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpCleanerService {
    private final OtpVerificationCleanerRepository otpVerificationCleanerRepository;
    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    private static final String twilioPhoneNumber = "+15392825449";
    public OtpCleanerService(OtpVerificationCleanerRepository otpVerificationCleanerRepository) {
        this.otpVerificationCleanerRepository = otpVerificationCleanerRepository;
    }
    public String generateOtp() {
        return String.valueOf(new Random().nextInt(899999) + 100000); // 6 digits
    }

    public void sendOtp(String phone) {
        String otp = generateOtp();
        String formattedPhone = formatPhoneNumber(phone);
        Message.creator(
                new PhoneNumber(formattedPhone),
                new PhoneNumber(twilioPhoneNumber),
                "Mã OTP của bạn là: " + otp + ". Mã có hiệu lực trong 5 phút."
        ).create();

        OtpVerificationCleaner entity = new OtpVerificationCleaner();
        entity.setPhone(phone);
        entity.setOtpCode(otp);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        entity.setVerified(false);
        otpVerificationCleanerRepository.save(entity);
    }

    public boolean verifyOtp(String phone, String otpCode) {
        Optional<OtpVerificationCleaner> otpOpt = otpVerificationCleanerRepository.findTopByPhoneAndOtpCodeOrderByCreatedAtDesc(phone, otpCode);

        if (otpOpt.isPresent()) {
            OtpVerificationCleaner otp = otpOpt.get();
            if (!otp.getVerified() && otp.getExpiresAt().isAfter(LocalDateTime.now())) {
                otp.setVerified(true);
                otpVerificationCleanerRepository.save(otp);
                return true;
            }
        }

        return false;
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
